const tls = require('tls');

function testZoho(pass) {
  const socket = tls.connect(993, 'imappro.zoho.eu', () => {
    console.log('Connected to Zoho IMAP (imappro.zoho.eu)!');
  });

  let tagIndex = 1;
  function sendCmd(cmd) {
    const tag = `A${tagIndex++}`;
    const full = `${tag} ${cmd}\r\n`;
    console.log('C:', full.trim().replace(pass, '***PASS***'));
    socket.write(full);
  }

  socket.on('data', (d) => {
    const text = d.toString();
    console.log('S:', text.trim());
    if (text.includes('* OK')) {
      sendCmd(`LOGIN ercument.erden@alparai.com ${pass}`);
    } else if (text.includes('A1 OK')) {
      console.log('ZOHO IMAP LOGIN SUCCESSFUL!');
      sendCmd('SELECT INBOX');
    } else if (text.includes('A2 OK')) {
      console.log('INBOX SELECT SUCCESSFUL!');
      sendCmd('LOGOUT');
    } else if (text.includes('A1 NO') || text.includes('A1 BAD')) {
      console.log('Zoho LOGIN failed with this password.');
      socket.end();
      process.exit(1);
    }
  });

  socket.on('error', (err) => console.error('TLS Error:', err));
}

// Test with candidate password
testZoho('AlparAI_2026_045c419b0749!');
