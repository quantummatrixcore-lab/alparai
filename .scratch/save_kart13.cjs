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
        // Ensure on Kart 13
        const adiEl = document.querySelector('#ProjeKodu').closest('form, div').querySelector('#Adi');
        const suresiEl = document.getElementById('ProjeSuresi');

        if (!adiEl || !suresiEl) return { error: 'Kart 13 fields not found' };

        // Update Proje Adı
        const newTitle = 'AlparAI: Büyük Dil Modelleri ve Otonom Yapay Zeka Sistemleri İçin Kriptografik Sıfır-Bilgi Kanıtlı (ZKP) ve Çok-Ajanlı Güvenilirlik/Denetlenebilirlik Platformu';
        adiEl.value = newTitle;
        $(adiEl).val(newTitle).trigger('change');

        // Update Proje Süresi to 18
        suresiEl.value = '18';
        $(suresiEl).val('18').trigger('change');

        await new Promise(r => setTimeout(r, 800));

        // Find visible saveButton for this portlet
        const saveBtns = Array.from(document.querySelectorAll('.saveButton')).filter(b => b.offsetParent !== null);
        if (saveBtns.length === 0) return { error: 'Save button not found' };

        saveBtns[0].click();
        await new Promise(r => setTimeout(r, 3000));

        // Read values back
        return {
          saved: true,
          adi: adiEl.value,
          suresi: suresiEl.value
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
      console.log('Kart 13 Save result:', JSON.stringify(resp.result?.result?.value, null, 2));
      ws.close();
      process.exit(0);
    };
  });
});
