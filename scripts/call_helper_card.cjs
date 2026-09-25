const WebSocket = require('d:/AlparAi/node_modules/ws');

async function triggerHelperGetCard() {
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
      expression: `(() => {
        try {
          const btn = $('#46');
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
            onComplate: function() {
              console.log('helper_getCard completed');
            }
          };
          helper_getCard(u);
          return 'HELPER_GET_CARD_INVOKED';
        } catch(e) {
          return 'ERR: ' + e.message;
        }
      })()`
    });
    console.log('CALL_RESULT:', res.result.value);

    // Wait 2.5s for card HTML to render
    await new Promise(r => setTimeout(r, 2500));

    const domRes = await send('Runtime.evaluate', {
      expression: `(() => {
        // Find newly opened modal or card
        const card = document.querySelector('.modal.in, .bootbox.in, #kartContent, #formdiv, .ui-dialog, div[style*=\"z-index: 10\"]');
        if (!card) {
          // Look for any table containing 'Evrak' or 'Belge'
          const tables = Array.from(document.querySelectorAll('table')).map(t => t.innerText);
          return 'CARD_NOT_FOUND, tables: ' + tables.length;
        }
        return card.innerText.slice(0, 1500);
      })()`
    });
    console.log('CARD_DOM:', domRes.result.value);
    ws.close();
  });
}
triggerHelperGetCard();
