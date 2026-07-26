async function checkNonExistent() {
  try {
    const urls = [
      'https://jctuijian.com/nonexistent-page-12345',
      'https://jctuijian.com/airports/elephant/',
      'https://jctuijian.com/airports/nonexistent-airport/'
    ];
    for (const url of urls) {
      const res = await fetch(url);
      console.log(`URL: ${url} -> Status: ${res.status}`);
    }
  } catch (e) {
    console.error(e);
  }
}
checkNonExistent();
