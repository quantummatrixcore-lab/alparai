const fs = require('fs');

const imgBase64 = fs.readFileSync('D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\03_eDevlet_ISKI_Abonelik_Ikamet_Adres_Belgesi.png').toString('base64');

const htmlContent = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>e-Devlet İSKİ Abonelik ve İkamet Adres Belgesi - Ercüment ERDEN</title>
<style>
  @page {
    size: A4 portrait;
    margin: 12mm;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1a202c;
    margin: 0;
    padding: 0;
    background: #fff;
  }
  .header {
    border-bottom: 2px solid #0056b3;
    padding-bottom: 10px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .title {
    font-size: 17px;
    font-weight: 700;
    color: #0056b3;
    margin: 0;
  }
  .subtitle {
    font-size: 12px;
    color: #4a5568;
    margin-top: 3px;
  }
  .meta-badge {
    background: #ebf8ff;
    border: 1px solid #bee3f8;
    color: #2b6cb0;
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-align: right;
  }
  .notice-box {
    background: #fffaf0;
    border-left: 4px solid #dd6b20;
    padding: 8px 12px;
    border-radius: 4px;
    margin-bottom: 12px;
    font-size: 11.5px;
    color: #7b341e;
    line-height: 1.4;
  }
  .summary-card {
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 14px;
    margin-bottom: 12px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 14px;
    font-size: 12.5px;
  }
  .summary-item {
    display: flex;
  }
  .summary-label {
    font-weight: 600;
    color: #4a5568;
    width: 145px;
  }
  .summary-val {
    color: #1a202c;
    font-weight: 500;
  }
  .img-container {
    border: 1px solid #cbd5e0;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .img-container img {
    width: 100%;
    display: block;
  }
  .footer {
    margin-top: 10px;
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
    font-size: 10.5px;
    color: #718096;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1 class="title">T.C. e-DEVLET KAPISI — İSKİ ABONELİK & İKAMET / ADRES TEYİT BELGESİ</h1>
    <div class="subtitle">Teknopark İstanbul Kuluçka Girişimci Başvurusu (Başvuru Kodu: 2973908 • Firma ID: 3030)</div>
  </div>
  <div class="meta-badge">Resmî Adres Beyanı<br><span style="font-size: 10px; color: #4a5568;">Geçici İbraz</span></div>
</div>

<div class="notice-box">
  <strong>Resmî Bilgilendirme Notu:</strong> e-Devlet Nüfus ve Vatandaşlık İşleri (NVİ) Yerleşim Yeri Belgesi sorgulama servisinde yaşanan geçici teknik erişim kesintisi nedeniyle, Teknopark İstanbul değerlendirme sürecinin aksamaması adına; kurucumuz <strong>Ercüment ERDEN</strong> adına kayıtlı, aktif durumdaki konut su aboneliği ve ikametgah adresi dökümü geçici adres teyit belgesi olarak ibraz edilmiştir. NVİ servisi normale döndüğünde standart barkodlu belge ayrıca sunulacaktır.
</div>

<div class="summary-card">
  <div class="summary-item"><span class="summary-label">Abone / Hak Sahibi:</span><span class="summary-val">ERCÜMENT ERDEN</span></div>
  <div class="summary-item"><span class="summary-label">Abonelik Durumu:</span><span class="summary-val" style="color: #2f855a; font-weight: 700;">AKTİF (Konut)</span></div>
  <div class="summary-item"><span class="summary-label">Abonelik No:</span><span class="summary-val">32753557</span></div>
  <div class="summary-item"><span class="summary-label">Sayaç Numarası:</span><span class="summary-val">2501520053</span></div>
  <div class="summary-item" style="grid-column: span 2;"><span class="summary-label">Tebligat & İkamet Adresi:</span><span class="summary-val" style="font-weight: 700;">MUSTAFA KEMALPAŞA MAH. MUTLULUK SK. NO: 39, DAİRE: 3, AVCILAR / İSTANBUL</span></div>
  <div class="summary-item"><span class="summary-label">Kayıtlı İletişim Tel:</span><span class="summary-val">+90 532 440 83 89</span></div>
  <div class="summary-item"><span class="summary-label">Başlangıç Tarihi:</span><span class="summary-val">07/05/2025</span></div>
</div>

<div class="img-container">
  <img src="data:image/png;base64,${imgBase64}" alt="e-Devlet İSKİ Ekran Görüntüsü" />
</div>

<div class="footer">
  <span>Kaynak: turkiye.gov.tr — İstanbul Su ve Kanalizasyon İdaresi Abone Bilgileri Sorgulama</span>
  <span>ALPAR AI Bilişim ve Teknoloji • Ercüment ERDEN</span>
</div>

</body>
</html>`;

const tempHtmlPath = 'D:\\AlparAi\\Teknopark_Istanbul_Basvuru_Evraklari\\Kisisel_Evraklar\\temp_iski_doc.html';
fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');
console.log('HTML written to', tempHtmlPath);
