const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/DF277C637764E836DB12A666B9687696');

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
  const argeData = await evalJs(`
    (async function() {
      // Fetch Kart 2 (Firma İletişim)
      let kart2Html = '';
      try {
        const r2 = await fetch('/AdayFirma/AdayFirmaIletisimBilgisi/Edit/3030');
        kart2Html = await r2.text();
      } catch (e) { kart2Html = e.message; }

      // Fetch Kart 11 (Yetkili İletişim)
      let kart11Html = '';
      try {
        const r11 = await fetch('/AdayFirma/AdayFirmaYetkilisi/Edit/3030');
        kart11Html = await r11.text();
      } catch (e) { kart11Html = e.message; }

      // Extract address fields using regex
      function getVals(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return Array.from(doc.querySelectorAll('input, textarea, select')).map(i => ({
          name: i.name || i.id,
          value: i.value,
          selectedText: i.tagName === 'SELECT' ? i.options[i.selectedIndex]?.text : ''
        })).filter(i => i.value);
      }

      return {
        kart2Fields: getVals(kart2Html),
        kart11Fields: getVals(kart11Html)
      };
    })()
  `);
  console.log('ARGEPORTAL ADDRESS DATA:', JSON.stringify(argeData, null, 2));
  ws.close();
});
