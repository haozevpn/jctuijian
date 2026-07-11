const token = 'ghp_9fU7G6Kjv60ULOISL8qj0mgUZKfbE81p0e2T';
const url = 'https://api.github.com/repos/haozevpn/vpn/actions/workflows/monitor.yml/dispatches';

async function main() {
  console.log(`Testing with CORRECT new token: ${token}...`);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'NodeJS-Test-Trigger'
      },
      body: JSON.stringify({ ref: 'master' })
    });
    console.log(`Status Code: ${resp.status} ${resp.statusText}`);
    const text = await resp.text();
    console.log(`Response body: ${text || '(empty)'}`);
    console.log('------------------------------------');
  } catch (err) {
    console.error(err);
  }
}

main();
