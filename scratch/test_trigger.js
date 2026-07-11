const token = 'ghp_guHBptg9FhHMPqO675MB0ZUE0fBbSk14BW8q';
const url = 'https://api.github.com/repos/haozevpn/vpn/actions/workflows/monitor.yml/dispatches';

async function testWithContentType(contentType) {
  console.log(`Testing with Content-Type: ${contentType}...`);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': contentType,
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

async function main() {
  // Test with application/x-www-form-urlencoded (what you currently have)
  await testWithContentType('application/x-www-form-urlencoded');
  
  // Test with application/json (the standard way)
  await testWithContentType('application/json');
}

main();
