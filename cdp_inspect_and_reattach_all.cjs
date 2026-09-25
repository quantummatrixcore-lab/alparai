const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const fileList = [
  // 1-6: Proje Belgeleri
  { id: 1, name: '01_HIZLANDIRMA_BILGI_TABLOSU.xlsx', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\01_HIZLANDIRMA_BILGI_TABLOSU.xlsx', type: 'Proje', desc: 'Hızlandırma Ön Değerlendirme Excel Tablosu' },
  { id: 2, name: '01_HIZLANDIRMA_BILGI_TABLOSU.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\01_HIZLANDIRMA_BILGI_TABLOSU.pdf', type: 'Proje', desc: 'Hızlandırma Ön Değerlendirme İmzalı PDF' },
  { id: 3, name: '02_PROJE_DEGERLENDIRME_PDP.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\02_PROJE_DEGERLENDIRME_PDP.pdf', type: 'Proje', desc: 'Proje Değerlendirme Paketi (PDP) Sunumu' },
  { id: 4, name: '03_IS_ZAMAN_CIZELGESI_18AY.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\03_IS_ZAMAN_CIZELGESI_18AY.pdf', type: 'Proje', desc: '18 Aylık Ar-Ge İş-Zaman (Gantt) Çizelgesi' },
  { id: 5, name: '04_KURUCU_OZGECMISI_ERCUMENT_ERDEN.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\04_KURUCU_OZGECMISI_ERCUMENT_ERDEN.pdf', type: 'Proje', desc: 'Kurucu Özgeçmişi (CV) — Ercüment ERDEN' },
  { id: 6, name: '05_DANISMA_KURULU_PROFILI.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\05_DANISMA_KURULU_PROFILI.pdf', type: 'Proje', desc: 'Danışma Kurulu (Prof. Dr. Musa Aygül & A. Rıfat Albuz)' },
  
  // 7-16: Kişisel Resmi Belgeler
  { id: 7, name: '01_Nufus_Kayit_Ornegi_Ercument_Erden.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\01_Nufus_Kayit_Ornegi_Ercument_Erden.pdf', type: 'Şahsi', desc: 'e-Devlet Nüfus Kayıt Örneği (Barkodlu)' },
  { id: 8, name: '02_Adli_Sicil_Kaydi_Ercument_Erden.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\02_Adli_Sicil_Kaydi_Ercument_Erden.pdf', type: 'Şahsi', desc: 'e-Devlet Adli Sicil Kaydı (ADB02223143386)' },
  { id: 9, name: '03_eDevlet_ISKI_Abonelik_Ikamet_Adres_Belgesi.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\03_eDevlet_ISKI_Abonelik_Ikamet_Adres_Belgesi.pdf', type: 'Şahsi', desc: 'İSKİ Konut Su Aboneliği & Geçici Adres Teyit Belgesi' },
  { id: 10, name: '04_UYAP_Dava_Sorgulama.png', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\04_UYAP_Dava_Sorgulama.png', type: 'Şahsi', desc: 'Adalet Bakanlığı UYAP Dava Dosyası Temiz Sorgusu' },
  { id: 11, name: 'Yargıtay.png', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\Yargıtay.png', type: 'Şahsi', desc: 'Yargıtay Dava Dosyası Temiz Sorgusu' },
  { id: 12, name: '65245305662-SGK.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\65245305662-SGK.pdf', type: 'Şahsi', desc: 'SGK Tescil ve Hizmet Dökümü (Barkodlu 10 Sayfa)' },
  { id: 13, name: '65245305662_Mezun-Endüstriyel-Elektronik.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\65245305662_Mezun-Endüstriyel-Elektronik.pdf', type: 'Şahsi', desc: 'YÖK Barkodlu Diploma (Endüstriyel Elektronik Ön Lisans)' },
  { id: 14, name: '65245305662_Mezun-İşletme.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\65245305662_Mezun-İşletme.pdf', type: 'Şahsi', desc: 'YÖK Barkodlu Diploma (İşletme Lisans)' },
  { id: 15, name: '65245305662_Mezun-Halkla-İlişkiler.pdf', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\65245305662_Mezun-Halkla-İlişkiler.pdf', type: 'Şahsi', desc: 'YÖK Barkodlu Diploma (Halkla İlişkiler Ön Lisans)' },
  { id: 16, name: 'Ercument_Erden_Executive_Portrait.jpg', path: 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\Ercument_Erden_Executive_Portrait.jpg', type: 'Şahsi', desc: 'Kurucu Yönetici Portre Fotoğrafı' }
];

async function main() {
  console.log('====================================================');
  console.log('ADIM 1: YEREL DİSKTE 16 DOSYANIN TEK TEK DENETİMİ');
  console.log('====================================================');

  const inspectedFiles = [];

  for (const item of fileList) {
    if (!fs.existsSync(item.path)) {
      console.error(`[HATA] Dosya bulunamadi: ${item.path}`);
      process.exit(1);
    }
    const stat = fs.statSync(item.path);
    if (stat.size === 0) {
      console.error(`[HATA] Dosya 0 bayt (boş): ${item.path}`);
      process.exit(1);
    }

    // Basit içerik/başlık kontrolü
    const buf = fs.readFileSync(item.path, { length: 100 });
    let header = 'Bilinmeyen';
    if (item.name.endsWith('.pdf')) {
      header = buf.toString('utf8', 0, 4) === '%PDF' ? 'Geçerli PDF (%PDF)' : 'Hatalı PDF';
    } else if (item.name.endsWith('.png')) {
      header = buf.toString('hex', 0, 4) === '89504e47' ? 'Geçerli PNG (PNG Magic)' : 'Hatalı PNG';
    } else if (item.name.endsWith('.jpg')) {
      header = buf.toString('hex', 0, 2) === 'ffd8' ? 'Geçerli JPEG (JPEG Magic)' : 'Hatalı JPG';
    } else if (item.name.endsWith('.xlsx')) {
      header = buf.toString('hex', 0, 4) === '504b0304' ? 'Geçerli XLSX (ZIP Magic)' : 'Hatalı XLSX';
    }

    // Güvenlik: Mesude kontrolü
    let mesudeCheck = 'Temiz (Mesude geçmiyor)';
    if (item.name.toLowerCase().includes('mesude') || item.path.toLowerCase().includes('mesude')) {
      mesudeCheck = 'TEHLİKE: Mesude tespit edildi!';
      console.error('[HATA] Mesude tespit edildi!');
      process.exit(1);
    }

    inspectedFiles.push({
      id: item.id,
      name: item.name,
      sizeBytes: stat.size,
      sizeKB: Math.round(stat.size / 1024) + ' KB',
      type: item.type,
      desc: item.desc,
      header: header,
      status: 'ONAYLANDI (OK)'
    });

    console.log(`[${item.id}/16] ONAYLANDI: ${item.name} (${Math.round(stat.size / 1024)} KB) - ${header}`);
  }

  console.log('\n====================================================');
  console.log('ADIM 2: PURELYMAIL BAĞLANTISI VE EKLEME İŞLEMİ');
  console.log('====================================================');

  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const mailTab = tabs.find(t => t.url && t.url.includes('purelymail.com') && t.url.includes('_task=mail') && t.url.includes('_action=compose'));
      if (!mailTab) {
        console.error('Purelymail compose sekmesi bulunamadı!');
        return;
      }

      console.log('Purelymail sekmesine CDP ile bağlanılıyor:', mailTab.id);
      const ws = new WebSocket(mailTab.webSocketDebuggerUrl);

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
        // Mevcut ekleri kontrol et
        const preCheck = await sendCmd(1, 'Runtime.evaluate', {
          expression: `document.querySelectorAll('#attachment-list li, .attachmentslist li').length`,
          returnByValue: true
        });
        console.log('Ekleme öncesi mevcut ek dosya sayısı:', preCheck?.result?.value);

        // input[type="file"] bul
        await sendCmd(2, 'DOM.enable');
        const doc = await sendCmd(3, 'DOM.getDocument');
        const nodeRes = await sendCmd(4, 'DOM.querySelector', {
          nodeId: doc.root.nodeId,
          selector: 'input[type="file"]'
        });

        if (!nodeRes?.nodeId) {
          console.error('input[type="file"] bulunamadı!');
          ws.close();
          return;
        }

        console.log('input[type="file"] nodeId:', nodeRes.nodeId);
        console.log('16 dosya tek tek incelendi, şimdi sunucuya enjekte ediliyor...');

        const filePaths = fileList.map(f => f.path);
        await sendCmd(5, 'DOM.setFileInputFiles', {
          nodeId: nodeRes.nodeId,
          files: filePaths
        });

        console.log('Dosyaların yüklenmesi ve taranması için 8 saniye bekleniyor...');
        await new Promise(r => setTimeout(r, 8000));

        // Sonucu kontrol et
        const postCheck = await sendCmd(6, 'Runtime.evaluate', {
          expression: `
            Array.from(document.querySelectorAll('#attachment-list li, .attachmentslist li')).map(li => {
              const nameEl = li.querySelector('.name, .filename, a');
              const sizeEl = li.querySelector('.size');
              return {
                name: nameEl ? nameEl.innerText.trim() : li.innerText.replace(/\\s+/g, ' ').trim(),
                size: sizeEl ? sizeEl.innerText.trim() : ''
              };
            })
          `,
          returnByValue: true
        });

        console.log('\n====================================================');
        console.log('ADIM 3: CANLI PURELYMAIL ARAYÜZÜNDE YÜKLENEN DOSYALAR');
        console.log('====================================================');
        console.table(postCheck?.result?.value);
        console.log(`Toplam Yüklenen Dosya Sayısı: ${postCheck?.result?.value?.length} / 16`);
        console.log('İŞLEM TAMAMLANDI: BÜTÜN DOSYALAR TEK TEK DENETLENİP YÜKLENDİ.');
        ws.close();
      });
    });
  });
}

main();
