const httpx = require('child_process');

async function testScraping() {
  const tg_urls = [
    'https://t.me/JLYCloud',
    'https://t.me/bianjie_group'
  ];

  for (const url of tg_urls) {
    let clean = url;
    if (!url.includes('/s/')) {
      clean = url.replace('t.me/', 't.me/s/');
    }
    console.log('Fetching:', clean);
    
    // Use curl or fetch to get content
    try {
      const res = await fetch(clean, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });
      const text = await res.text();
      
      // Let's write the response snippet to check structure
      console.log('HTML length:', text.length);
      
      // Let's regex search in JS equivalent to check.py
      // m = re.search(r'([\d\s\xa0\u200b]+)\s*(?:members|subscribers|成员|订阅者)', resp.text, re.I)
      const matches = text.match(/([\d\s\xa0\u200b,]+)\s*(members|subscribers|成员|订阅者)/i);
      if (matches) {
        console.log('Match found:', matches[0]);
        const numStr = matches[1].replace(/[\s\xa0\u200b,]/g, '');
        console.log('Parsed number:', numStr);
      } else {
        console.log('No regex match found for members/subscribers.');
        // Let's print a small segment of the head/body to see if Telegram is blocking or redirecting
        console.log('Snippet:', text.substring(0, 1000));
      }
    } catch (e) {
      console.error('Error fetching:', e.message);
    }
  }
}

testScraping();
