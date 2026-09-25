const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const list = JSON.parse(data);
    const target = list.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.onopen = () => {
      const expr = `(() => {
        const okulEl = document.getElementById('OkulTanimi_Id');
        const bolumEl = document.getElementById('BolumTanimi_Id');
        const ogrenimEl = document.getElementById('OgrenimDurum_Id');

        const getOpts = (el) => el ? Array.from(el.options).map(o => ({ val: o.value, text: o.text })) : [];

        // Check for Anadolu Üniversitesi or İşletme
        const okullar = getOpts(okulEl);
        const anadolu = okullar.filter(o => /anadolu/i.test(o.text));
        const selcuk = okullar.filter(o => /selçuk/i.test(o.text));

        const bolumler = getOpts(bolumEl);
        const isletme = bolumler.filter(o => /işletme|isletme/i.test(o.text));
        const elektronik = bolumler.filter(o => /elektronik/i.test(o.text));

        return {
          ogrenimOpts: getOpts(ogrenimEl),
          anadolu,
          selcuk,
          isletme,
          elektronik,
          bolumSample: bolumler.slice(0, 15)
        };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Dropdown options:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
