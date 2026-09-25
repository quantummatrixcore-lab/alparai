const WebSocket = require('d:/AlparAi/node_modules/ws');

async function checkProjectTabs() {
  const tabsRes = await fetch('http://localhost:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
  if (!argeTab) return console.log('No tab');

  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);
  let id = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const curId = id++;
    const onMsg = (event) => {
      const data = JSON.parse(event.toString());
      if (data.id === curId) resolve(data.result);
    };
    ws.on('message', onMsg);
    ws.send(JSON.stringify({ id: curId, method, params }));
    setTimeout(() => reject(new Error('timeout')), 8000);
  });

  ws.on('open', async () => {
    try {
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const links = Array.from(document.querySelectorAll('.adayfirmabutton, .list-group-item, a, button, li')).map(el => {
            const html = el.innerHTML || '';
            const text = el.innerText ? el.innerText.trim() : '';
            return {
              text: text,
              id: el.id,
              class: el.className,
              isGreen: html.includes('fa-check') || el.className.includes('green') || html.includes('success'),
              isRed: html.includes('fa-times') || el.className.includes('red') || html.includes('danger') || html.includes('warning')
            };
          }).filter(x => x.text && x.text.length > 2 && x.text.length < 50);
          return JSON.stringify(links);
        })()`
      });
      console.log('TABS_RESULT:');
      const parsed = JSON.parse(evalRes.result.value);
      parsed.forEach(p => {
        if (p.isGreen || p.isRed) {
          console.log(`[${p.id || '-'}] ${p.text} -> ${p.isGreen ? 'GREEN' : 'RED'}`);
        }
      });
    } catch(e) {
      console.error('EVAL_ERR:', e.message);
    } finally {
      ws.close();
    }
  });
}
checkProjectTabs();
