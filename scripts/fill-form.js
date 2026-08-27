const WebSocket = require('ws');

async function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 100000);
    const listener = (msg) => {
      const data = JSON.parse(msg);
      if (data.id === id) {
        ws.removeListener('message', listener);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.on('message', listener);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function fillForm() {
  const wsUrl = `ws://localhost:9222/devtools/page/81B36B93A9A082D4A3A9FAFA5000FE1F`;
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    try {
      await sendCommand(ws, 'Page.enable');
      
      const script = `
        function fill(id, value) {
          const el = document.getElementById(id);
          if (el) {
            el.focus();
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.blur();
          }
        }
        
        fill('36665c531dee4c1c18c74729bc34b957', 'Ercüment Erden');
        fill('a0eda4366492ed50b15b861e70712bac', 'hello@alparai.com');
        fill('31bce0947d54fcd603e280058ecad518', 'https://www.linkedin.com/in/ercüment-erden/');
        fill('583495fc97685b137ed69db8a8281a06', '+905555555555');
        fill('3a2e212f93ab43577596dcda65f5e586', 'ALPAR AI');
        fill('74ce6f1374c6fc5c98dd834577f088dc', 'https://alparai.com');
        fill('228b30712d25f36900ab1cdb04dd61c2', 'https://www.linkedin.com/company/135125061/admin/dashboard/');
        fill('0f4820ebbc625a1a06c6cc12d2b064ec', 'ALPAR AI, yapay zeka ekosisteminde güven (trust infrastructure) ve hesap verebilirlik (accountability) altyapısını sunan global bir SaaS platformudur. Veri gizliliği ihlalleri ve AI halüsinasyonlarına karşı şeffaf denetim kalkanı sağlar. Özellikle LLM güvenlik zaafiyetlerine karşı sunduğumuz bu çözümün pazardaki ihtiyacı giderek büyüyor. Örneğin yakın zamanda yaşadığımız bir ihlalin detaylarına ve sektördeki bu derin ihtiyaca şu haberden ulaşabilirsiniz: https://turkinform.com.tr/turk-girisimcinin-yasadigi-grok-skandali-kisisel-verilerimiz-risk-altinda-mi');
        fill('fad51945b98234e7500322d61a83be13', 'https://alparai.com/demo');
        fill('03b571c17247eaf4b03447b8ca8efc28', 'Silikon Vadisi vizyonuyla ve tamamen global pazar hedefiyle ilerliyoruz. Yapay Zeka Fabrikası programı ile gücümüzü birleştirerek Türk AI ekosistemine liderlik etmeye hazırız.');
      `;
      
      await sendCommand(ws, 'Runtime.evaluate', { expression: script });
      console.log('Form filled successfully.');
      ws.close();
    } catch (err) {
      console.error(err);
      ws.close();
    }
  });
}

fillForm();
