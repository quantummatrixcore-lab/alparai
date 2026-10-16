const tls = require('tls');
const fs = require('fs');

const emailsData = JSON.parse(fs.readFileSync('d:/AlparAi/zoho_full_html_emails.json', 'utf8'));

console.log(`Loaded ${emailsData.length} full HTML emails to inject into ercument.erden@alparai.com.`);

const mimeMessages = emailsData.map((item, idx) => {
  const subject = item.subject || 'Zoho Imported Email';
  const htmlContent = item.detail?.htmlSnippet || `<div style="padding:20px;"><h3>${subject}</h3><p>Aktarılan E-posta İçeriği</p></div>`;
  
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 15px; color: #222; }
    .import-banner { background: #f0f4f9; border-left: 4px solid #4a69bd; padding: 10px 15px; margin-bottom: 15px; font-size: 13px; color: #444; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="import-banner">
    📌 <strong>Zoho Mail Arşiv Aktarımı</strong> — Konu: ${subject}
  </div>
  <div class="email-body">
    ${htmlContent}
  </div>
</body>
</html>`;

  const bodyBuf = Buffer.from(fullHtml, 'utf8');

  const headers = [
    `From: Zoho Archive <ercument.erden@alparai.com>`,
    `To: Ercüment Erden <ercument.erden@alparai.com>`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `Date: ${new Date(Date.now() - (emailsData.length - idx) * 7200000).toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
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
  console.log('S:', text.trim().slice(0, 150));

  if (step === 'WELCOME' && text.includes('* OK')) {
    step = 'LOGIN';
    console.log('C: A1 LOGIN ercument.erden@alparai.com ...');
    socket.write('A1 LOGIN ercument.erden@alparai.com \r\n');
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
    console.log(`C: Writing ${buf.length} bytes of HTML buffer...`);
    socket.write(buf);
    socket.write('\r\n');
  } else if (step === 'APPEND_DATA' && text.includes(`A${tagIndex - 1} OK`)) {
    console.log(`✅ [${currentMailIdx + 1}/${mimeMessages.length}] Appended to ercument.erden@alparai.com: ${mimeMessages[currentMailIdx].subject}`);
    currentMailIdx++;
    if (currentMailIdx < mimeMessages.length) {
      step = 'APPEND_CMD';
      sendAppendCmd();
    } else {
      console.log('\n🎉 ALL 13 RICH HTML EMAILS INJECTED INTO ercument.erden@alparai.com INBOX!');
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
  socket.write(`${tag} APPEND INBOX (\\Seen) {${len}}\r\n`);
}

socket.on('error', (err) => console.error('TLS Error:', err));
