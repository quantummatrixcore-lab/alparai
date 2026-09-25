const ws = require('ws');

async function injectReply() {
  const res = await fetch('http://127.0.0.1:9222/json');
  const tabs = await res.json();
  const tab = tabs.find(t => t.url.includes('purelymail'));
  if (!tab) {
    console.log('NO_TAB');
    return;
  }

  const socket = new ws(tab.webSocketDebuggerUrl);

  const replyHtml = `
<p>Sayın Yusuf Bey,</p>
<p>17.09.2026 tarihli e-postanıza istinaden; ALPAR AI kuluçka aday firma başvurumuza (<strong>Kullanıcı No: 8300 / Başvuru Kodu: 2973908 / Firma ID: 3030 / Proje ID: 7244</strong>) ait kurucu ve proje ekibi evrakları ile güncel tebligat/ikamet adres bilgilerimiz aşağıda ve ekte eksiksiz olarak bilgilerinize sunulmuştur:</p>
<p><strong>1. GÜNCEL TEBLİGAT VE İKAMET ADRESİ:</strong><br>
[GÜNCEL ADRESİNİZ]</p>
<p><strong>2. İBRAZ EDİLEN PROJE EKİBİ EVRAKLARI (EKTE):</strong><br>
1. <strong>Kurumsal Portre Fotoğrafı:</strong> Tanıtımlarda kullanılmak üzere yüksek çözünürlüklü fotoğraf (<em>Ercument_Erden_Executive_Portrait.jpg</em>)<br>
2. <strong>e-Devlet Adli Sicil Kaydı Belgesi:</strong> Teknopark İstanbul kullanım amacı belirtilmiş, barkodlu resmi belge (<em>02_Adli_Sicil_Kaydi_Ercument_Erden.pdf</em> — Barkod No: <code>ADB02223143386</code>)<br>
3. <strong>Yargıtay Dava Dosyası Sorgulama Ekranı:</strong> "Tarafınıza ait Yargıtay dosyası bulunmamaktadır" ibareli resmi e-Devlet sorgusu (<em>Yargıtay.png</em>)<br>
4. <strong>Adalet Bakanlığı UYAP Dava Dosyası Sorgulama Ekranı:</strong> Adli kayıt sorgu dökümü (<em>04_UYAP_Dava_Sorgulama.png</em>)<br>
<em>(Not: e-Devlet servisindeki geçici yoğunluk giderildiğinde barkodlu yerleşim yeri belgesi ayrıca iletilecektir; güncel ikamet ve tebligat adresimiz yukarıda eksiksiz beyan edilmiştir.)</em></p>
<p>Proje Değerlendirme Paneli (PDP) oturumu takviminizi bekler, iyi çalışmalar dileriz.</p>
<p>Saygılarımızla,<br>
<strong>Ercüment ERDEN</strong><br>
Kurucu Girişimci &amp; Baş Sistem Mimarı • ALPAR AI<br>
+90 532 440 83 89 • <a href="mailto:ercument.erden@alparai.com">ercument.erden@alparai.com</a> • <a href="https://alparai.com">https://alparai.com</a><br>
<em>ALPAR AI Bilişim ve Teknoloji • T.C. Kimlik: 65245305662</em></p>
<br><hr><br>
`;

  const script = `
    (() => {
      const editor = tinymce.get('composebody');
      if (!editor) return 'NO_EDITOR';
      const existing = editor.getContent();
      editor.setContent(${JSON.stringify(replyHtml)} + existing);
      return 'OK';
    })()
  `;

  socket.on('open', () => {
    socket.send(JSON.stringify({
      id: 1,
      method: 'Runtime.evaluate',
      params: { expression: script, returnByValue: true }
    }));
  });

  socket.on('message', (msg) => {
    const resp = JSON.parse(msg);
    if (resp.id === 1) {
      console.log('RESULT:', resp.result ? resp.result.result.value : 'NO_RESULT');
      socket.close();
    }
  });
}

injectReply().catch(console.error);
