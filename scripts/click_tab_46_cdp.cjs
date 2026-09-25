const WebSocket = require('d:/AlparAi/node_modules/ws');

async function clickTab46CDP() {
  const tabsRes = await fetch('http://localhost:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
  if (!argeTab) return;
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.id === curId) {
        if (parsed.error) reject(parsed.error);
        else resolve(parsed.result);
      }
    });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  ws.on('open', async () => {
    // 1. Get coordinates of button 46
    const evalRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const btn = document.getElementById('46');
        if (!btn) return { error: 'btn 46 not found' };
        btn.scrollIntoView({ block: 'center' });
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
      })()`
    });

    const coords = evalRes.result.value;
    console.log('BTN_46_COORDS:', coords);
    if (!coords || coords.error) return ws.close();

    const { x, y } = coords;

    // 2. Dispatch real CDP mouse click
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: Math.round(x),
      y: Math.round(y),
      button: 'left',
      clickCount: 1
    });

    await new Promise(r => setTimeout(r, 150));

    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: Math.round(x),
      y: Math.round(y),
      button: 'left',
      clickCount: 1
    });

    console.log('MOUSE_CLICK_DISPATCHED');

    // Wait 3.5s for any UI response
    await new Promise(r => setTimeout(r, 3500));

    // Check DOM for new elements or changes
    const afterRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const activeModal = document.querySelector('.modal.in, .bootbox.in, .modal-dialog, #kartContent, #formdiv, .k-window, div[role=\"dialog\"]');
        const visibleElements = Array.from(document.querySelectorAll('h3, h4, h5, .caption-subject, .modal-title')).map(h => h.innerText.trim()).filter(Boolean);
        return {
          modalFound: !!activeModal,
          modalHtmlSnippet: activeModal ? activeModal.innerHTML.slice(0, 500) : null,
          modalText: activeModal ? activeModal.innerText.slice(0, 500) : null,
          headings: visibleElements
        };
      })()`
    });

    console.log('AFTER_REAL_CLICK:', JSON.stringify(afterRes.result.value, null, 2));
    ws.close();
  });
}
clickTab46CDP();
