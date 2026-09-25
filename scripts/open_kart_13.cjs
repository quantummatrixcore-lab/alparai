const WebSocket = require('d:/AlparAi/node_modules/ws');

async function openKart13() {
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
    // Check #13 attributes
    const btnRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const btn = $('#13');
        if (!btn.length) return 'NO_BTN_13';
        return {
          id: btn.attr('id'),
          ids: btn.attr('ids'),
          modulTipi: btn.attr('modulTipi')
        };
      })()`
    });
    console.log('BTN_13_ATTRS:', btnRes.result.value);

    // Call helper_getCard for 13
    const callRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        try {
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
          return 'CALLED_CARD_13';
        } catch(e) {
          return 'ERR: ' + e.message;
        }
      })()`
    });
    console.log('CALL_13_RES:', callRes.result.value);

    await new Promise(r => setTimeout(r, 2000));

    // Check visible inputs
    const inspectRes = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const inputs = Array.from(document.querySelectorAll('input, select, textarea')).filter(i => {
          return i.offsetParent !== null; // visible
        }).map(i => ({
          id: i.id,
          name: i.name,
          tag: i.tagName,
          type: i.type,
          value: i.value ? i.value.slice(0, 100) : ''
        }));
        return inputs;
      })()`
    });
    console.log('VISIBLE_INPUTS_13:', JSON.stringify(inspectRes.result.value, null, 2));
    ws.close();
  });
}
openKart13();
