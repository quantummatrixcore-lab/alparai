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
        const okulEl = document.getElementById('OkulTanimi_Id');
        const bolumEl = document.getElementById('BolumTanimi_Id');
        const ogrenimEl = document.getElementById('OgrenimDurum_Id');

        // Verify current values are ready
        if (!okulEl || !bolumEl) return { error: 'Form elements not ready' };

        console.log('Setting Okul to 10 (Anadolu Üniversitesi)...');
        okulEl.value = '10';
        $(okulEl).val('10').trigger('change');
        
        await new Promise(r => setTimeout(r, 1500));

        console.log('Setting Bolum to 5 (İşletme)...');
        bolumEl.value = '5';
        $(bolumEl).val('5').trigger('change');

        await new Promise(r => setTimeout(r, 1000));

        console.log('Current before save:', {
          okul: okulEl.value,
          bolum: bolumEl.value,
          ogrenim: ogrenimEl.value
        });

        // Find the visible save button
        const saveBtn = Array.from(document.querySelectorAll('.saveButton')).find(b => b.offsetParent !== null);
        if (!saveBtn) return { error: 'Save button not found' };

        saveBtn.click();
        await new Promise(r => setTimeout(r, 3000));

        return {
          saved: true,
          okul: okulEl.value,
          bolum: bolumEl.value
        };
      })()`;
      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: { expression: expr, awaitPromise: true, returnByValue: true }
      }));
    };
    ws.onmessage = (msg) => {
      const resp = JSON.parse(msg.data);
      console.log('Save result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
