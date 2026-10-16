const tls = require('tls');

const socket = tls.connect(993, 'mailserver.purelymail.com', () => {
  console.log('Connected to Purelymail TLS IMAP...');
});

let tagIndex = 1;
let step = 'WELCOME';

function sendCmd(cmd) {
  const tag = `A${tagIndex++}`;
  const full = `${tag} ${cmd}\r\n`;
  console.log('C:', full.trim());
  socket.write(full);
  return tag;
}

socket.on('data', (d) => {
  const text = d.toString();
  console.log('S:', text.trim().slice(0, 200));

  if (step === 'WELCOME' && text.includes('* OK')) {
    step = 'LOGIN';
    sendCmd('LOGIN ercument@alparai.com ');
  } else if (step === 'LOGIN' && text.includes('A1 OK')) {
    step = 'SELECT';
    sendCmd('SELECT INBOX');
  } else if (step === 'SELECT' && text.includes('A2 OK')) {
    step = 'DELETE_OLD';
    // Mark old placeholder messages UIDs 1 to 14 as deleted
    console.log('Deleting old placeholder messages UIDs 1:14...');
    sendCmd('UID STORE 1:14 +FLAGS (\\Deleted)');
  } else if (step === 'DELETE_OLD' && text.includes('A3 OK')) {
    step = 'EXPUNGE';
    console.log('Expunging deleted messages...');
    sendCmd('EXPUNGE');
  } else if (step === 'EXPUNGE' && text.includes('A4 OK')) {
    console.log('\n🎉 CLEANUP COMPLETE! Only rich HTML emails remain in INBOX!');
    sendCmd('LOGOUT');
    setTimeout(() => process.exit(0), 1000);
  }
});

socket.on('error', (err) => console.error('TLS Error:', err));
