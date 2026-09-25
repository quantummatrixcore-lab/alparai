const ws = require('ws');

async function attachFiles() {
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.url.includes('purelymail'));
  if (!tab) {
    console.log('NO_TAB');
    return;
  }

  const socket = new ws(tab.webSocketDebuggerUrl);

  const files = [
    'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\Ercument_Erden_Executive_Portrait.jpg',
    'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\02_Adli_Sicil_Kaydi_Ercument_Erden.pdf',
    'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\Yargıtay.png',
    'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\04_UYAP_Dava_Sorgulama.png'
  ];

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = Math.floor(Math.random() * 100000);
      const handler = (msg) => {
        const resp = JSON.parse(msg);
        if (resp.id === id) {
          socket.off('message', handler);
          resolve(resp.result);
        }
      };
      socket.on('message', handler);
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  socket.on('open', async () => {
    try {
      const doc = await send('DOM.getDocument');
      const rootNodeId = doc.root.nodeId;
      const query = await send('DOM.querySelector', {
        nodeId: rootNodeId,
        selector: '#uploadformInput'
      });
      console.log('UPLOAD INPUT NODE:', query.nodeId);
      if (query.nodeId) {
        await send('DOM.setFileInputFiles', {
          files: files,
          nodeId: query.nodeId
        });
        console.log('FILES SET SUCCESSFULLY');
      }
      setTimeout(() => {
        socket.close();
      }, 3000);
    } catch (e) {
      console.error('ERROR:', e.message);
      socket.close();
    }
  });
}

attachFiles().catch(console.error);
