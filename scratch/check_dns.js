const dns = require('dns');

dns.resolveNs('jctuijian.com', (err, addresses) => {
  if (err) {
    console.error('NS error:', err);
  } else {
    console.log('NS records:', addresses);
  }
});

dns.resolve4('jctuijian.com', (err, addresses) => {
  if (err) {
    console.error('A error:', err);
  } else {
    console.log('A records:', addresses);
  }
});
