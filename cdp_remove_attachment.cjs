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
  console.log('Removing 03_Yerlesim_Yeri_Ikametgah_Belgesi.pdf from composer attachment list...');
  const res = await evalJs(`
    (function() {
      const lis = Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li'));
      const targetLi = lis.find(li => li.innerText.includes('03_Yerlesim_Yeri_Ikametgah_Belgesi.pdf') || li.id.includes('7f5837381502f6fd8076b30a01790842'));
      if (targetLi) {
        // Look for delete button or call rcmail.command('remove-attachment', fileId)
        const delBtn = targetLi.querySelector('.delete, a.delete, button.delete') || targetLi.querySelector('[title*=\"sil\" i], [title*=\"delete\" i]');
        if (delBtn) {
          delBtn.click();
          return { success: true, method: 'clicked_del_btn' };
        } else if (window.rcmail && typeof window.rcmail.remove_attachment === 'function') {
          window.rcmail.remove_attachment(targetLi.id);
          targetLi.remove();
          return { success: true, method: 'rcmail_remove' };
        } else {
          targetLi.remove();
          return { success: true, method: 'dom_remove' };
        }
      }
      return { success: false, reason: 'not_found' };
    })()
  `);
  console.log('Remove result:', res);

  await new Promise(r => setTimeout(r, 1000));

  const remaining = await evalJs(`
    Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li')).map(li => li.innerText.trim())
  `);
  console.log('Remaining attachments in composer:', remaining);

  ws.close();
});
