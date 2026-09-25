const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      const expr = `(async () => {
        try {
          if (typeof helper_personel_get_card === 'function') {
            helper_personel_get_card(46192);
          } else if (typeof helper_personel_grid_dbclick_get_card === 'function') {
            helper_personel_grid_dbclick_get_card('row46192');
          }
          await new Promise(r => setTimeout(r, 2000));

          const getVal = (id) => {
            const el = document.getElementById(id);
            if (!el) return 'NOT_FOUND';
            if (el.tagName === 'SELECT') return { value: el.value, text: el.options[el.selectedIndex]?.text };
            return el.value;
          };

          return {
            tc: getVal('TCNo'),
            ad: getVal('Adi'),
            soyad: getVal('Soyadi'),
            ogrenim: getVal('OgrenimDurum_Id'),
            okul: getVal('OkulTanimi_Id'),
            bolum: getVal('BolumTanimi_Id'),
            unvan: getVal('PersonelGorevUnvani')
          };
        } catch (e) {
          return { error: e.message };
        }
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, awaitPromise: true, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
