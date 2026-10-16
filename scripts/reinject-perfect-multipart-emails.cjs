const tls = require('tls');
const fs = require('fs');

const emailsData = JSON.parse(fs.readFileSync('d:/AlparAi/zoho_clean_emails.json', 'utf8'));

console.log(`Loaded ${emailsData.length} clean extracted emails to inject into ercument.erden@alparai.com.`);

const mimeMessages = emailsData.map((item, idx) => {
  const subject = item.subject || 'Zoho Imported Email';
  const sender = item.sender || 'Zoho Archive';
  const recipient = item.recipient || 'ercument.erden@alparai.com';
  const textBody = item.textBody || item.subject;
  const htmlBody = item.htmlBody || `<div>${item.textBody || item.subject}</div>`;

  const boundary = `----=_Part_AlparAI_${idx}_${Date.now()}`;

  const partText = [
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    textBody,
    ``
  ].join('\r\n');

  const partHtml = [
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    `<!DOCTYPE html>`,
    `<html>`,
    `<head>`,
    `<meta charset="utf-8">`,
    `<style>`,
    `  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #111; line-height: 1.5; }`,
    `</style>`,
    `</head>`,
    `<body>`,
    htmlBody,
    `</body>`,
    `</html>`,
    ``,
    `--${boundary}--`
  ].join('\r\n');

  const headers = [
    `From: ${sender.includes('<') ? sender : `"${sender}" <${sender.includes('@') ? sender : 'archive@alparai.com'}>`}`,
    `To: ${recipient.includes('<') ? recipient : `"${recipient}" <ercument.erden@alparai.com>`}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `Date: ${new Date(Date.now() - (emailsData.length - idx) * 86400000).toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `X-Imported-From: Zoho Mail`,
    ``,
    ``
  ].join('\r\n');

  const fullMsgStr = headers + partText + '\r\n' + partHtml;
  const mimeBuffer = Buffer.from(fullMsgStr, 'utf8');

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
    step = 'PURGE';
    console.log('C: A3 STORE 1:* +FLAGS (\\Deleted)');
    socket.write('A3 STORE 1:* +FLAGS (\\Deleted)\r\n');
  } else if (step === 'PURGE' && text.includes('A3 OK')) {
    step = 'EXPUNGE';
    console.log('C: A4 EXPUNGE');
    socket.write('A4 EXPUNGE\r\n');
  } else if (step === 'EXPUNGE' && text.includes('A4 OK')) {
    step = 'APPEND_CMD';
    sendAppendCmd();
  } else if (step === 'APPEND_CMD' && text.startsWith('+')) {
    step = 'APPEND_DATA';
    const buf = mimeMessages[currentMailIdx].buffer;
    console.log(`C: Writing ${buf.length} bytes multipart buffer...`);
    socket.write(buf);
    socket.write('\r\n');
  } else if (step === 'APPEND_DATA' && text.includes(`A${tagIndex - 1} OK`)) {
    console.log(`✅ [${currentMailIdx + 1}/${mimeMessages.length}] Appended: ${mimeMessages[currentMailIdx].subject}`);
    currentMailIdx++;
    if (currentMailIdx < mimeMessages.length) {
      step = 'APPEND_CMD';
      sendAppendCmd();
    } else {
      console.log('\n🎉 ALL 13 CLEAN MULTIPART EMAILS RE-INJECTED INTO ercument.erden@alparai.com INBOX!');
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
