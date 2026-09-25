const WebSocket = require('ws');
const fs = require('fs');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/6C7E134411C702CD8A8774FDA1FC8290');

function sendCmd(id, method, params = {}) {
  return new Promise((resolve) => {
    const handler = (msg) => {
      const resp = JSON.parse(msg);
      if (resp.id === id) {
        ws.removeListener('message', handler);
        resolve(resp.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

ws.on('open', async () => {
  console.log('Navigating to temp HTML...');
  await sendCmd(1, 'Page.navigate', {
    url: 'file:///D:/AlparAi/Teknopark_Istanbul_Basvuru_Evraklari/Kisisel_Evraklar/temp_iski_doc.html'
  });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Printing to PDF...');
  const pdfRes = await sendCmd(2, 'Page.printToPDF', {
    printBackground: true,
    paperWidth: 8.27, // A4
    paperHeight: 11.69,
    marginTop: 0.4,
    marginBottom: 0.4,
    marginLeft: 0.4,
    marginRight: 0.4,
    preferCSSPageSize: true
  });

  const pdfPath = 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\03_eDevlet_ISKI_Abonelik_Ikamet_Adres_Belgesi.pdf';
  fs.writeFileSync(pdfPath, Buffer.from(pdfRes.data, 'base64'));
  console.log('PDF successfully generated at:', pdfPath, 'Size:', fs.statSync(pdfPath).size);

  // Navigate back to Purelymail account portal
  await sendCmd(3, 'Page.navigate', { url: 'https://purelymail.com/manage/account' });
  ws.close();
});
