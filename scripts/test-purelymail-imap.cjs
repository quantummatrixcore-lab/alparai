const tls = require('tls');

const socket = tls.connect(993, 'mailserver.purelymail.com', () => {
  console.log('Connected to Purelymail TLS IMAP (mailserver.purelymail.com)!');
});

let tagIndex = 1;
function sendCmd(cmd) {
  const tag = `A${tagIndex++}`;
  const full = `${tag} ${cmd}\r\n`;
  console.log('C:', full.trim());
  socket.write(full);
}

socket.on('data', (d) => {
  const text = d.toString();
  console.log('S:', text);
  if (text.includes('* OK')) {
    sendCmd('LOGIN ercument@alparai.com AlparAI_2026_045c419b0749!');
  } else if (text.includes('A1 OK')) {
    sendCmd('SELECT INBOX');
  } else if (text.includes('A2 OK')) {
    console.log('SUCCESS! Logged in and selected INBOX!');
    sendCmd('LOGOUT');
  } else if (text.includes('A3 OK')) {
    socket.end();
    process.exit(0);
  }
});

socket.on('error', (err) => console.error('TLS Error:', err));
