const token = 'ghp_9fU7G6Kjv60ULOISL8qj0mgUZKfbE81p0e2T';

async function main() {
  try {
    const resp = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'NodeJS-Test-Trigger'
      }
    });
    console.log(`Status Code: ${resp.status} ${resp.statusText}`);
    const text = await resp.text();
    console.log(`Response body: ${text || '(empty)'}`);
  } catch (err) {
    console.error(err);
  }
}

main();
