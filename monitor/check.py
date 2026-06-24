"""
check.py — 机场可用性自动监测脚本
====================================
部署方式：GitHub Actions（每30分钟触发）
数据存储：Supabase（免费 PostgreSQL）

监测内容：
  1. 机场官网是否可达（HTTP 状态 + 响应时间）
  2. 订阅链接是否有效（返回内容是否含节点信息）
  3. 根据多次历史结果计算可用率 / 可靠性评分
  4. 将结果写入 Supabase 数据库
"""

import os
import sys
import json
import time
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path

import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

# ── 本地开发时加载 .env ──────────────────────────────────────
load_dotenv()

# ── 日志配置 ────────────────────────────────────────────────
Path("monitor/logs").mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f"monitor/logs/{datetime.now().strftime('%Y%m%d')}.log"),
    ],
)
log = logging.getLogger(__name__)

# ── 环境变量 ────────────────────────────────────────────────
SUPABASE_URL         = os.environ["SUPABASE_URL"].strip()
if SUPABASE_URL.endswith("/rest/v1/"):
    SUPABASE_URL = SUPABASE_URL[:-9]
elif SUPABASE_URL.endswith("/rest/v1"):
    SUPABASE_URL = SUPABASE_URL[:-8]

SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"].strip()

# ── Supabase 客户端 ─────────────────────────────────────────
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

TIMEOUT_SEC    = 12
MAX_CONCURRENT = 10  # 最大并发数（避免 IP 被封）


# ════════════════════════════════════════════════════════════
#  单个机场检测
# ════════════════════════════════════════════════════════════
async def check_airport(client: httpx.AsyncClient, airport: dict) -> dict:
    """
    对单个机场执行以下检测：
      - 官网 HTTP 可达性 + 响应延迟
      - 订阅链接有效性（可选）
    返回一条待写入 speed_logs 的记录。
    """
    result = {
        "airport_id":   airport["id"],
        "checked_at":   datetime.now(timezone.utc).isoformat(),
        "website_ok":   False,
        "website_ms":   None,
        "sub_ok":       None,
        "http_status":  None,
        "error":        None,
    }

    website_url = airport.get("website_url", "")
    sub_url     = airport.get("sub_url", "")

    # ── 1. 官网可达性测试 ────────────────────────────────────
    if website_url:
        try:
            t0   = time.monotonic()
            resp = await client.get(website_url, follow_redirects=True)
            ms   = round((time.monotonic() - t0) * 1000, 1)

            result["http_status"] = resp.status_code
            result["website_ms"]  = ms
            result["website_ok"]  = resp.status_code < 400
            log.info(f"  OK  {airport['name']:12s}  官网 {resp.status_code}  {ms:.0f}ms")
        except httpx.TimeoutException:
            result["error"] = "timeout"
            log.warning(f"  TO  {airport['name']:12s}  官网超时")
        except Exception as e:
            result["error"] = str(e)[:120]
            log.warning(f"  ERR {airport['name']:12s}  官网错误: {e}")

    # ── 2. 订阅链接有效性测试（选配）────────────────────────
    if sub_url:
        try:
            resp = await client.get(sub_url, follow_redirects=True)
            # 订阅链接通常返回 base64 编码内容或 YAML，长度应 > 100 字节
            result["sub_ok"] = resp.status_code == 200 and len(resp.text) > 100
        except Exception:
            result["sub_ok"] = False

    return result


# ════════════════════════════════════════════════════════════
#  评分计算
# ════════════════════════════════════════════════════════════
def compute_score(airport_id: str, airport: dict) -> tuple:
    """
    从数据库读取近30天的检测记录，计算可靠性评分（0-100）。
    返回 (new_score: float, score_delta_str: str) 元组。

    评分维度：
      1. 订阅可用率 (50%)
      2. 官网可用率 (30%)
      3. 运营天数与信誉 (20%)
    并对最终得分进行向中心压缩（0-100 映射至 45-90）以避免极端值。

    关键修复：
      原代码用 .gte("checked_at", "now() - interval '30 days'") 传 SQL 表达式，
      Supabase Python SDK 的 .gte() 只接受字面值，SQL 表达式会导致查询异常，
      触发兜底 return 75.0，因此所有机场评分永远是 75。
      修复方法：用 Python datetime 计算 30 天前的 ISO 字符串传入。
    """
    try:
        # ✅ 用 Python 计算 30 天前的 ISO 时间字符串（而非 SQL 表达式）
        cutoff_time = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

        rows = (
            supabase.table("speed_logs")
            .select("website_ok, website_ms, sub_ok")
            .eq("airport_id", airport_id)
            .gte("checked_at", cutoff_time)
            .execute()
            .data
        )

        if not rows:
            # 没有历史数据时，给定满可用率（新入驻机场）
            web_avail_rate = 1.0
            sub_avail_rate = 1.0
            log.info(f"  {airport_id}: 暂无历史记录，使用默认可用率 100%")
        else:
            total_rows   = len(rows)
            web_ok_count = sum(1 for r in rows if r["website_ok"])
            web_avail_rate = web_ok_count / total_rows

            sub_rows = [r for r in rows if r.get("sub_ok") is not None]
            if sub_rows:
                sub_ok_count   = sum(1 for r in sub_rows if r["sub_ok"])
                sub_avail_rate = sub_ok_count / len(sub_rows)
            else:
                sub_avail_rate = 1.0  # 若没有拉取过订阅，默认为100%

            log.info(
                f"  {airport_id}: {total_rows} 条记录，"
                f"官网可用率 {web_avail_rate:.1%}，"
                f"订阅可用率 {sub_avail_rate:.1%}"
            )

        # 1. 订阅可用率得分 (满分 50)
        sub_score = sub_avail_rate * 50.0

        # 2. 官网可用率得分 (满分 30)
        web_score = web_avail_rate * 30.0

        # 3. 运营天数与信誉得分 (满分 20)
        days_online = airport.get("days_online") or 0
        # 基础信誉分 18.0，每上线 1 天加 2/180 分，满 180 天得满分 20.0
        reputation_score = 18.0 + min(2.0, days_online / 180.0 * 2.0)

        raw_score = sub_score + web_score + reputation_score

        # 扣分规则：如果属于风险预警类别 (category 包含 "risk")，扣减 50 分
        category = airport.get("category") or []
        if isinstance(category, str):
            try:
                category = json.loads(category)
            except Exception:
                category = []
        if "risk" in category:
            raw_score = max(0.0, raw_score - 50.0)

        # 向中心压缩分值：raw_score (0~100) -> final_score (45~90)
        new_score = round(45.0 + (raw_score * 0.45), 2)

        # 计算与上次的变化量
        old_score = float(airport.get("score") or 75.0)
        delta     = new_score - old_score
        if delta > 0:
            delta_str = f"+{delta:.2f}"
        elif delta < 0:
            delta_str = f"{delta:.2f}"
        else:
            delta_str = "+0.00"

        return new_score, delta_str

    except Exception as e:
        log.error(f"评分计算失败 {airport_id}: {e}", exc_info=True)
        return 75.0, "+0.00"  # 异常情况返回中位评分


# ════════════════════════════════════════════════════════════
#  主流程
# ════════════════════════════════════════════════════════════
async def main():
    log.info("=" * 60)
    log.info(f"  机场监测开始  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log.info("=" * 60)

    # ── 从数据库读取待监测的机场列表（包含 score 字段用于计算 delta）
    airports = (
        supabase.table("airports")
        .select("id, name, website_url, sub_url, status, days_online, category, score")
        .eq("status", "active")
        .execute()
        .data
    )
    log.info(f"共监测 {len(airports)} 个机场")

    if not airports:
        log.warning("没有找到启用的机场，退出。")
        return

    # ── 并发检测 ─────────────────────────────────────────────
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async def guarded_check(client, airport):
        async with semaphore:
            return await check_airport(client, airport)

    async with httpx.AsyncClient(
        timeout=TIMEOUT_SEC,
        headers={"User-Agent": "JcTuijian-Monitor/1.0 (+https://jctuijian.com)"},
        verify=False,  # 部分机场使用自签证书
    ) as client:
        tasks   = [guarded_check(client, a) for a in airports]
        results = await asyncio.gather(*tasks, return_exceptions=True)

    # ── 写入速度日志 ──────────────────────────────────────────
    log_rows = []
    for r in results:
        if isinstance(r, Exception):
            log.error(f"检测任务异常: {r}")
            continue
        log_rows.append(r)

    if log_rows:
        supabase.table("speed_logs").insert(log_rows).execute()
        log.info(f"已写入 {len(log_rows)} 条检测记录")

    # ── 重新计算并更新每个机场评分 ───────────────────────────
    for airport in airports:
        new_score, delta_str = compute_score(airport["id"], airport)
        supabase.table("airports").update({
            "score":       new_score,
            "score_delta": delta_str,
            "updated_at":  datetime.now(timezone.utc).isoformat(),
        }).eq("id", airport["id"]).execute()
        log.info(f"  SCORE {airport['name']:12s}  {new_score}  ({delta_str})")

    log.info("=" * 60)
    log.info("  监测完成")
    log.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
