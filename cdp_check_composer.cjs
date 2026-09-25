const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/382902FAC08962E2FA9B316F23FAA8E0');

function evalJs(code) {
  return new Promise((resolve) => {
    const id = Math.floor(Math.random() * 100000);
    const handler = (msg) => {
      const parsed = JSON.parse(msg);
      if (parsed.id === id) {
        ws.removeListener('message', handler);
        resolve(parsed.result?.result?.value);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: code, awaitPromise: true, returnByValue: true } }));
  });
}

ws.on('open', async () => {
  const composerData = await evalJs(`
    (function() {
      const to = document.querySelector('#_to')?.value;
      const cc = document.querySelector('#_cc')?.value;
      const subject = document.querySelector('#_subject')?.value;
      
      const attachmentList = Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li')).map(li => {
        const link = li.querySelector('a');
        const size = li.querySelector('.attachment-size, .size')?.innerText;
        const name = li.querySelector('.attachment-name, .name')?.innerText || link?.innerText;
        const deleteBtn = li.querySelector('.delete, a.delete');
        return {
          id: li.id,
          name: name?.trim(),
          size: size?.trim(),
          fileId: link?.getAttribute('href') || link?.getAttribute('data-file-id'),
          className: li.className
        };
      });

      return { to, cc, subject, attachmentCount: attachmentList.length, attachments: attachmentList };
    })()
  `);
  console.log('COMPOSER DATA:', JSON.stringify(composerData, null, 2));

  ws.close();
});
