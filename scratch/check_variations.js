const url = 'https://api.github.com/user';

// We will try variations of the token to see which one is valid
const variations = [
  'ghp_9fU7G6Kjv60ULOISL8qj0mgUZKfbE81p0e2T',
  'ghp_9fU7G6Kjv60ULOlsL8qj0mgUZKfbE81p0e2T',
  'ghp_9fU7G6Kjv60UL0lSL8qj0mgUZKfbE81p0e2T',
  'ghp_9fU7G6Kjv60UL0ISL8qj0mgUZKfbE81p0e2T',
  'ghp_9fU7G6Kjv60ULO1SL8qj0mgUZKfbE81p0e2T',
  'ghp_9fU7G6Kjv60UL01SL8qj0mgUZKfbE81p0e2T',
  
  // What if the first L is also lowercase l or 1?
  'ghp_9fU7G6Kjv60UloISL8qj0mgUZKfbE81p0e2T',
  'ghp_9fU7G6Kjv60UlOISL8qj0mgUZKfbE81p0e2T',
  'ghp_9fU7G6Kjv60UlolsL8qj0mgUZKfbE81p0e2T',
  'ghp_9fU7G6Kjv60UlOlsL8qj0mgUZKfbE81p0e2T',
];

async function checkToken(token) {
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'NodeJS-Test-Trigger'
      }
    });
    if (resp.ok) {
      console.log(`✅ SUCCESS! Valid Token found: ${token}`);
      const data = await resp.json();
      console.log(`Token owner: ${data.login}`);
      return true;
    }
  } catch (err) {
    // Ignore error
  }
  return false;
}

async function main() {
  for (const token of variations) {
    const success = await checkToken(token);
    if (success) return;
  }
  console.log('❌ None of the variations matched. The token might have been revoked by GitHub or has another typo.');
}

main();
