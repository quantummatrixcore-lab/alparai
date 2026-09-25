/**
 * scripts/audit_all_cards_one_by_one.cjs
 * Opens and audits every single card (all 27 cards) one by one in Argeportal,
 * reads its content, verifies its completeness, and closes each window cleanly.
 */

const WebSocket = require('ws');
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const ALL_CARDS = [
  // FİRMA BÖLÜMÜ (10 KART)
  { id: '2', group: 'FİRMA', name: 'İletişim Bilgileri' },
  { id: '3', group: 'FİRMA', name: 'Yetkili Bilgileri' },
  { id: '4', group: 'FİRMA', name: 'Ortaklara Ait Bilgiler' },
  { id: '6', group: 'FİRMA', name: 'Geliştirilmiş ve Devam Eden Ar-Ge Projeleri' },
  { id: '7', group: 'FİRMA', name: 'Makine Teçhizat Bilgileri' },
  { id: '8', group: 'FİRMA', name: 'Yazılım Bilgileri' },
  { id: '9', group: 'FİRMA', name: 'Standart, Lisans ve Sertifikalar' },
  { id: '21', group: 'FİRMA', name: 'Başvuru İçin Gerekli Firma Belgeleri' },
  { id: '42', group: 'FİRMA', name: 'Fikri Sınai Mülkiyet Hakları Bilgileri' },
  { id: '43', group: 'FİRMA', name: 'Kiralanacak Alan Bilgileri' },

  // PERSONEL BÖLÜMÜ (1 KART)
  { id: '11', group: 'PERSONEL', name: 'Personel Ekle' },

  // PROJE BÖLÜMÜ (16 KART)
  { id: '13', group: 'PROJE', name: 'Proje Künyesi' },
  { id: '15', group: 'PROJE', name: 'Proje Hedefleri' },
  { id: '19', group: 'PROJE', name: 'Proje Nitelikleri' },
  { id: '25', group: 'PROJE', name: 'Arge Aşamaları' },
  { id: '26', group: 'PROJE', name: 'Proje Bütçesi' },
  { id: '27', group: 'PROJE', name: 'Proje Detayı' },
  { id: '28', group: 'PROJE', name: 'Proje Ekibi' },
  { id: '29', group: 'PROJE', name: 'AR-GE Destekleri' },
  { id: '30', group: 'PROJE', name: 'Ortaklar-Anahtar Kelimeler-Dış Görev' },
  { id: '33', group: 'PROJE', name: 'Teknoparktan Talep Edilen Hizmetler' },
  { id: '37', group: 'PROJE', name: 'Proje Kapsamında Alınacak Yeni Ekipman' },
  { id: '38', group: 'PROJE', name: 'Proje Ekonomik Değeri' },
  { id: '39', group: 'PROJE', name: 'Projenin Çevreye Etkileri' },
  { id: '40', group: 'PROJE', name: 'Proje Alınacak Dış Hizmetler' },
  { id: '41', group: 'PROJE', name: 'Projenin Çıktıları' },
  { id: '46', group: 'PROJE', name: 'Başvuru İçin Gerekli Proje Belgeleri' }
];

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));

  if (!argeTab) {
    console.error('No Argeportal tab found!');
    process.exit(1);
  }

  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let id = 0;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const curId = ++id;
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === curId) {
          ws.removeListener('message', handler);
          resolve(res.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  ws.on('open', async () => {
    // Initial cleanup of any open dialogs
    await send('Runtime.evaluate', { expression: `$('.ui-dialog-content').dialog('close');` });
    await sleep(500);

    const auditResults = [];

    for (const card of ALL_CARDS) {
      // Click button
      await send('Runtime.evaluate', {
        expression: `(() => {
          const btn = document.getElementById('${card.id}');
          if (btn) btn.click();
        })()`
      });

      await sleep(1200);

      // Read content
      const cardInfo = await send('Runtime.evaluate', {
        expression: `(() => {
          const dialog = Array.from(document.querySelectorAll('.ui-dialog')).find(d => d.offsetParent !== null && d.innerText && d.innerText.includes('${card.name}')) || document.querySelector('.ui-dialog:last-of-type') || document.body;

          const inputs = Array.from(dialog.querySelectorAll('input:not([type="hidden"]), textarea, select')).map(el => ({
            id: el.id,
            name: el.name,
            val: (el.value || '').trim()
          })).filter(i => i.val.length > 0 && i.id !== 'search-fld' && i.id !== 'rp');

          const tables = Array.from(dialog.querySelectorAll('table tbody tr')).map(tr => tr.innerText.replace(/\\s+/g, ' ').trim()).filter(Boolean);

          const textSnippet = dialog.innerText.replace(/\\s+/g, ' ').slice(0, 300);

          return {
            hasData: inputs.length > 0 || tables.length > 0,
            inputsCount: inputs.length,
            inputsSummary: inputs.slice(0, 3).map(i => i.name + ': ' + i.val.slice(0, 50)),
            tablesCount: tables.length,
            tableSnippet: tables.slice(0, 2),
            textSnippet
          };
        })()`,
        returnByValue: true
      });

      auditResults.push({
        id: card.id,
        group: card.group,
        name: card.name,
        result: cardInfo?.result?.value
      });

      // Close dialog immediately to prevent clutter
      await send('Runtime.evaluate', {
        expression: `$('.ui-dialog-content').dialog('close');`
      });
      await sleep(300);
    }

    console.log('--- MASTER AUDIT 27 CARDS RESULTS ---');
    console.log(JSON.stringify(auditResults, null, 2));

    // Final cleanup check
    await send('Runtime.evaluate', { expression: `$('.ui-dialog-content').dialog('close');` });
    ws.close();
  });
}

main().catch(console.error);
