const WebSocket = require('d:/AlparAi/node_modules/ws');

async function fetchTab46Html() {
  const tabsRes = await fetch('http://localhost:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));
  if (!argeTab) return;
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const curId = id++;
    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (parsed.id === curId) resolve(parsed.result);
    });
    ws.send(JSON.stringify({ id: curId, method, params }));
  });

  ws.on('open', async () => {
    const res = await send('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `new Promise((resolve) => {
        $.ajax({
          url: '/AdayFirma/AdayFirmaProjeGerekliEvrak/Kart',
          type: 'POST',
          data: {
            Id: 7244,
            Firma_Id: aim.user.firmid,
            Proje_Id: 7244,
            AdayFirmaDoldurulacakAlan_Id: 46,
            ModulTipi: "3"
          },
          success: function(html) {
            resolve({ success: true, length: html ? html.length : 0, snippet: html ? html.slice(0, 1500) : '' });
          },
          error: function(xhr, status, err) {
            resolve({ success: false, status: xhr.status, error: err });
          }
        });
      })`
    });
    console.log('AJAX_RESULT:', JSON.stringify(res.result.value, null, 2));
    ws.close();
  });
}
fetchTab46Html();
