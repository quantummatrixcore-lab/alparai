/**
 * scripts/upload_proje_sunumu.cjs
 * Selects radio 37 (Proje Sunumu) and uploads 02_PROJE_DEGERLENDIRME_PDP.pdf via CDP DOM.setFileInputFiles
 */

const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const FILE_PATH = 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\02_PROJE_DEGERLENDIRME_PDP.pdf';

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));

  if (!argeTab) {
    console.error('No Argeportal tab found!');
    process.exit(1);
  }

  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 0;
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = ++id;
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === curId) {
          ws.removeListener('message', handler);
          if (res.error) reject(res.error);
          else resolve(res.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  ws.on('open', async () => {
    console.log('--- Step 1: Select Radio GerekliEvrakTanimi_Id_37 (Proje Sunumu) ---');
    const radioRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const r = document.getElementById('GerekliEvrakTanimi_Id_37');
        if (r) {
          r.click();
          r.checked = true;
          r.dispatchEvent(new Event('change', { bubbles: true }));
          return { ok: true, id: r.id, checked: r.checked };
        }
        return { ok: false, error: 'Radio 37 not found' };
      })()`,
      returnByValue: true
    });

    console.log('Radio selection:', JSON.stringify(radioRes?.result?.value, null, 2));
    await sleep(1000);

    console.log('--- Step 2: Get DOM Document and querySelector for #gosb-fileupload-button ---');
    const doc = await send('DOM.getDocument', {});
    const fileNode = await send('DOM.querySelector', {
      nodeId: doc.root.nodeId,
      selector: '#gosb-fileupload-button'
    });

    console.log('File Input NodeId:', fileNode.nodeId);

    console.log('--- Step 3: DOM.setFileInputFiles with PDP document ---');
    await send('DOM.setFileInputFiles', {
      files: [FILE_PATH],
      nodeId: fileNode.nodeId
    });

    console.log('File injected via CDP successfully!');
    await sleep(4000);

    console.log('--- Step 4: Check file upload progress / table ---');
    const uploadStatus = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = Array.from(document.querySelectorAll('.ui-dialog, .modal')).find(d => d.innerText && d.innerText.includes('Dosya Ekle'));
        const rows = modal ? Array.from(modal.querySelectorAll('tr, .template-upload, .template-download')).map(r => r.innerText.trim()).filter(Boolean) : [];
        const startBtn = modal ? Array.from(modal.querySelectorAll('.start, [class*="start"], button, a')).find(b => b.innerText && (b.innerText.includes('Başlat') || b.innerText.includes('Yükle') || b.innerText.includes('Start'))) : null;

        return {
          rows,
          hasStartBtn: !!startBtn,
          startBtnText: startBtn ? startBtn.innerText.trim() : null
        };
      })()`,
      returnByValue: true
    });

    console.log('Upload Status:', JSON.stringify(uploadStatus?.result?.value, null, 2));

    // If there is a Start button, click it
    if (uploadStatus?.result?.value?.hasStartBtn) {
      console.log('Clicking Start/Upload button...');
      await send('Runtime.evaluate', {
        expression: `(() => {
          const modal = Array.from(document.querySelectorAll('.ui-dialog, .modal')).find(d => d.innerText && d.innerText.includes('Dosya Ekle'));
          const startBtn = modal ? Array.from(modal.querySelectorAll('.start, [class*="start"], button, a')).find(b => b.innerText && (b.innerText.includes('Başlat') || b.innerText.includes('Yükle') || b.innerText.includes('Start'))) : null;
          if (startBtn) startBtn.click();
        })()`
      });
      await sleep(5000);
    }

    ws.close();
  });
}

main().catch(console.error);
