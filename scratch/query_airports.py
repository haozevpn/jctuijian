import sys
import traceback

try:
    import os
    from dotenv import load_dotenv
    from supabase import create_client

    load_dotenv()

    SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
    if SUPABASE_URL.endswith("/rest/v1/"):
        SUPABASE_URL = SUPABASE_URL[:-9]
    elif SUPABASE_URL.endswith("/rest/v1"):
        SUPABASE_URL = SUPABASE_URL[:-8]

    SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "").strip()

    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    response = supabase.table("airports").select("id, name, score, score_delta, status").execute()
    print("数据条数:", len(response.data))
    for row in response.data:
        print(f"ID: {row['id']} | Name: {row['name']} | Score: {row['score']} | Delta: {row['score_delta']} | Status: {row['status']}")
except Exception as e:
    print("发生错误:")
    traceback.print_exc()
    sys.exit(1)
