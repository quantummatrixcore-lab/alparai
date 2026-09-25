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
        // Ensure form is loaded with row46192
        window.$('#row46192 .row-grid-edit').trigger('click');
        await new Promise(r => setTimeout(r, 1500));

        const okulEl = document.getElementById('OkulTanimi_Id');
        const bolumEl = document.getElementById('BolumTanimi_Id');
        const ogrenimEl = document.getElementById('OgrenimDurum_Id');

        // Set Okul to Anadolu Üniversitesi (10)
        okulEl.value = '10';
        okulEl.dispatchEvent(new Event('input', { bubbles: true }));
        okulEl.dispatchEvent(new Event('change', { bubbles: true }));
        if (window.$) window.$(okulEl).trigger('change');

        // Wait a bit in case bolum depends on okul
        await new Promise(r => setTimeout(r, 800));

        // Set Bolum to İşletme (5)
        bolumEl.value = '5';
        bolumEl.dispatchEvent(new Event('input', { bubbles: true }));
        bolumEl.dispatchEvent(new Event('change', { bubbles: true }));
        if (window.$) window.$(bolumEl).trigger('change');

        // Set Ogrenim to Lisans (23)
        ogrenimEl.value = '23';
        ogrenimEl.dispatchEvent(new Event('input', { bubbles: true }));
        ogrenimEl.dispatchEvent(new Event('change', { bubbles: true }));
        if (window.$) window.$(ogrenimEl).trigger('change');

        await new Promise(r => setTimeout(r, 500));

        // Find the visible save button inside the active portlet/form
        const saveBtns = Array.from(document.querySelectorAll('.saveButton')).filter(b => b.offsetParent !== null);
        if (saveBtns.length === 0) return { error: 'Visible saveButton not found' };

        const saveBtn = saveBtns[0];
        saveBtn.click();
        if (window.$) window.$(saveBtn).trigger('click');

        await new Promise(r => setTimeout(r, 3000));

        // Check for toast, notification or dialog
        const alerts = Array.from(document.querySelectorAll('.toast, .alert, .bootbox, .jGrowl-notification, .ui-dialog:not([style*=\"display: none\"])'))
          .map(a => a.innerText.trim()).filter(Boolean);

        return {
          status: 'Saved',
          okulVal: okulEl.value,
          okulText: okulEl.options[okulEl.selectedIndex]?.text,
          bolumVal: bolumEl.value,
          bolumText: bolumEl.options[bolumEl.selectedIndex]?.text,
          ogrenimVal: ogrenimEl.value,
          ogrenimText: ogrenimEl.options[ogrenimEl.selectedIndex]?.text,
          alerts
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
      console.log('Update result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
