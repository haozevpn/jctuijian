const url = 'https://api.github.com/user';

const baseToken = 'ghp_9fU7G6Kjv60ULOISL8qj0mgUZKfbE81p0e2T';

// Let's identify the positions we want to vary:
// g h p _ 9 f U 7 G 6 K j v 6 0 U L O I  S  L  8 q j 0  m g U Z K f b E 8 1  p 0  e 2 T
// 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8  9  0  1 2 3 4  5 6 7 8 9 0 1 2 3 4  5 6  7 8 9
//
// Index 14: '0' -> ['0', 'o', 'O']
// Index 16: 'L' -> ['L', 'l', '1', 'I']
// Index 17: 'O' -> ['O', '0', 'o']
// Index 18: 'I' -> ['I', 'l', '1', 'L']
// Index 20: 'L' -> ['L', 'l', '1', 'I']
// Index 24: '0' -> ['0', 'o', 'O']
// Index 34: '1' -> ['1', 'l', 'I', 'L']
// Index 36: '0' -> ['0', 'o', 'O']

const variationsMap = {
  14: ['0', 'o', 'O'],
  16: ['L', 'l', '1', 'I'],
  17: ['O', '0', 'o'],
  18: ['I', 'l', '1', 'L'],
  20: ['L', 'l', '1', 'I'],
  24: ['0', 'o', 'O'],
  34: ['1', 'l', 'I', 'L'],
  36: ['0', 'o', 'O']
};

function generateTokens(str, indexMap) {
  const indices = Object.keys(indexMap).map(Number);
  const results = [];
  
  function recurse(currentStr, depth) {
    if (depth === indices.length) {
      results.push(currentStr);
      return;
    }
    const idx = indices[depth];
    const replacements = indexMap[idx];
    const prefix = currentStr.slice(0, idx);
    const suffix = currentStr.slice(idx + 1);
    for (const r of replacements) {
      recurse(prefix + r + suffix, depth + 1);
    }
  }
  
  recurse(str, 0);
  return results;
}

const tokens = generateTokens(baseToken, variationsMap);
console.log(`Generated ${tokens.length} token variations to test...`);

async function testToken(token) {
  try {
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'NodeJS-Brute'
      }
    });
    if (resp.ok) {
      const data = await resp.json();
      console.log(`\n🎉 SUCCESS! Valid token: ${token}`);
      console.log(`Owner: ${data.login}`);
      return token;
    }
  } catch (e) {
    // Ignore network errors
  }
  return null;
}

async function main() {
  const concurrency = 20;
  let active = [];
  
  for (let i = 0; i < tokens.length; i++) {
    const p = testToken(tokens[i]).then(res => {
      if (res) {
        process.exit(0);
      }
    });
    active.push(p);
    if (active.length >= concurrency) {
      await Promise.race(active);
      active = active.filter(p => p.status === 'pending');
    }
  }
  await Promise.all(active);
  console.log('\n❌ Done. No matching tokens found.');
}

main().catch(console.error);
