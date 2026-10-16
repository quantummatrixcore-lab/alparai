const tls = require('tls');
const fs = require('fs');

const emailsData = JSON.parse(fs.readFileSync('d:/AlparAi/zoho_full_emails.json', 'utf8'));

console.log(`Loaded ${emailsData.length} extracted emails to import into ercument@purelymail.com.`);

const mimeMessages = emailsData.map((item, idx) => {
  const subject = item.subject || 'Zoho Imported Email';
  const detailText = item.detail?.textSnippet || '';
  const detailHtml = item.detail?.htmlSnippet || `<pre>${detailText}</pre>`;
  
  const contentHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; line-height: 1.6; padding: 20px; color: #333; }
    .header { background: #f4f6f8; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e1e4e8; }
    .badge { display: inline-block; background: #6c5ce7; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">ZOHO IMPORTED EMAIL</span>
    <h2>${subject}</h2>
  </div>
  <div class="content">
    ${detailHtml}
  </div>
</body>
</html>`;

  const bodyBuf = Buffer.from(contentHtml, 'utf8');

  const headers = [
    `From: Zoho Archive <ercument.erden@alparai.com>`,
    `To: Ercüment Erden <ercument.erden@alparai.com>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `Date: ${new Date(Date.now() - (emailsData.length - idx) * 3600000).toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Length: ${bodyBuf.length}`,
    `X-Imported-From: Zoho Mail`,
    ``,
    ``
  ].join('\r\n');

  const mimeBuffer = Buffer.concat([Buffer.from(headers, 'utf8'), bodyBuf]);

  return { subject, buffer: mimeBuffer };
});

const socket = tls.connect(993, 'mailserver.purelymail.com', () => {
  console.log('Connected to Purelymail TLS IMAP...');
});

let tagIndex = 1;
let currentMailIdx = 0;
let step = 'WELCOME';

socket.on('data', (d) => {
  const text = d.toString();
  console.log('S:', text.trim());

  if (step === 'WELCOME' && text.includes('* OK')) {
    step = 'LOGIN';
    console.log('C: A1 LOGIN ercument@purelymail.com ...');
    socket.write('A1 LOGIN ercument@purelymail.com \r\n');
  } else if (step === 'LOGIN' && text.includes('A1 OK')) {
    step = 'SELECT';
    console.log('C: A2 SELECT INBOX');
    socket.write('A2 SELECT INBOX\r\n');
  } else if (step === 'SELECT' && text.includes('A2 OK')) {
    step = 'APPEND_CMD';
    sendAppendCmd();
  } else if (step === 'APPEND_CMD' && text.startsWith('+')) {
    step = 'APPEND_DATA';
    const buf = mimeMessages[currentMailIdx].buffer;
    console.log(`C: Writing ${buf.length} bytes of MIME buffer...`);
    socket.write(buf);
    socket.write('\r\n');
  } else if (step === 'APPEND_DATA' && text.includes(`A${tagIndex - 1} OK`)) {
    console.log(`✅ [${currentMailIdx + 1}/${mimeMessages.length}] Appended to ercument@purelymail.com: ${mimeMessages[currentMailIdx].subject}`);
    currentMailIdx++;
    if (currentMailIdx < mimeMessages.length) {
      step = 'APPEND_CMD';
      sendAppendCmd();
    } else {
      console.log('\n🎉 ALL 13 ZOHO EMAILS SUCCESSFULLY IMPORTED INTO ercument@purelymail.com!');
      socket.write(`A${tagIndex++} LOGOUT\r\n`);
      setTimeout(() => process.exit(0), 1000);
    }
  }
});

function sendAppendCmd() {
  const msg = mimeMessages[currentMailIdx];
  const len = msg.buffer.length;
  const tag = `A${tagIndex++}`;
  console.log(`\nAppending [${currentMailIdx + 1}/${mimeMessages.length}]: ${msg.subject} (${len} bytes)`);
  console.log(`C: ${tag} APPEND INBOX (\\Seen) {${len}}`);
  socket.write(`${tag} APPEND INBOX (\\Seen) {${len}}\r\n`);
}

socket.on('error', (err) => console.error('TLS Error:', err));
