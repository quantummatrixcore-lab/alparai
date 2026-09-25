const WebSocket = require('d:/AlparAi/node_modules/ws');

async function traceAjax() {
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
    await send('Network.enable');
    ws.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.method === 'Network.responseReceived') {
        const resp = msg.params.response;
        if (resp.url.includes('AdayFirma') || resp.url.includes('Kart')) {
          console.log(`NETWORK_RESP: ${resp.status} ${resp.statusText} -> ${resp.url}`);
        }
      }
    });

    // Execute helper_getCard in page
    await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = $('#13');
        const n = btn.attr('ids').split(',');
        const u = {
          color: 'color-orange',
          controller: 'AdayFirma/' + n[0],
          action: n[1],
          value: {
            Id: n[2],
            Firma_Id: aim.user.firmid,
            Proje_Id: n[2],
            AdayFirmaDoldurulacakAlan_Id: n[3],
            ModulTipi: btn.attr('modulTipi')
          },
          onComplate: function() {}
        };
        helper_getCard(u);
      })()`
    });

    await new Promise(r => setTimeout(r, 4000));
    ws.close();
  });
}
traceAjax();
