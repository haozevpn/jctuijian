async function check() {
  const urls = [
    'https://jctuijian.com/airports/elephant/',
    'https://jctuijian.com/report.html?id=elephant'
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      console.log(`URL: ${url} -> Status: ${res.status}`);
      const text = await res.text();
      console.log(`Body starts with: ${text.substring(0, 300).replace(/\r?\n/g, ' ')}`);
      console.log(`Content length: ${text.length}`);
    } catch (e) {
      console.error(`URL: ${url} -> Error: ${e.message}`);
    }
  }
}
check();
