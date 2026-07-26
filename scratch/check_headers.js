async function checkHeaders() {
  try {
    const res = await fetch('https://jctuijian.com/', { method: 'HEAD' });
    console.log('Headers:');
    for (const [key, value] of res.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
  } catch (e) {
    console.error(e);
  }
}
checkHeaders();
