/**
 * scripts/inspect_active_argeportal.cjs
 * Inspects the live Argeportal tab currently open in Chrome via CDP.
 */

const WebSocket = require('ws');

async function main() {
  const tabsRes = await fetch('http://127.0.0.1:9222/json');
  const tabs = await tabsRes.json();
  const argeTab = tabs.find(t => t.url && t.url.includes('argeportal.teknoparkistanbul.com.tr'));

  if (!argeTab) {
    console.error('No Argeportal tab found!');
    process.exit(1);
  }

  console.log(`Connecting to Argeportal tab: ${argeTab.id} (${argeTab.url})`);
  const ws = new WebSocket(argeTab.webSocketDebuggerUrl);

  let messageId = 0;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = ++messageId;
      const handler = (data) => {
        const res = JSON.parse(data);
        if (res.id === id) {
          ws.removeListener('message', handler);
          resolve(res.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.on('open', async () => {
    try {
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          // 1. General page info
          const url = window.location.href;
          const title = document.title;

          // 2. Alert / Warning / Status badges
          const alerts = Array.from(document.querySelectorAll('.alert, .badge, .label, [class*="alert"], [class*="badge"], [class*="status"], .toast, .swal2-title, .modal-title, .modal-body')).map(el => ({
            tag: el.tagName,
            className: el.className,
            text: el.innerText.replace(/\\s+/g, ' ').trim()
          })).filter(a => a.text.length > 0 && a.text.length < 500);

          // 3. Navigation & tabs
          const navLinks = Array.from(document.querySelectorAll('.nav-link, .nav-tabs li, .menu-item, .breadcrumb li, .step')).map(el => ({
            text: el.innerText.replace(/\\s+/g, ' ').trim(),
            active: el.classList.contains('active') || el.getAttribute('aria-selected') === 'true'
          })).filter(n => n.text.length > 0);

          // 4. Cards or checklist items with green/red/status icons
          const cards = Array.from(document.querySelectorAll('.card, .panel, tr, .list-group-item, [id*="Kart"], [class*="card"]')).map(el => {
            const text = el.innerText.replace(/\\s+/g, ' ').trim();
            const hasSuccess = !!el.querySelector('.fa-check, .text-success, .badge-success, .btn-success, [class*="success"], [class*="green"]');
            const hasDanger = !!el.querySelector('.fa-times, .fa-exclamation, .text-danger, .badge-danger, .btn-danger, [class*="danger"], [class*="red"]');
            const hasWarning = !!el.querySelector('.fa-exclamation-triangle, .text-warning, .badge-warning, [class*="warning"]');
            return {
              text: text.slice(0, 150),
              success: hasSuccess,
              danger: hasDanger,
              warning: hasWarning
            };
          }).filter(c => c.text.length > 3 && (c.success || c.danger || c.warning));

          // 5. Buttons (e.g. Kaydet, Gönder, E-İmza, Başvuru vb.)
          const buttons = Array.from(document.querySelectorAll('button, a.btn, input[type="submit"], input[type="button"]')).map(b => ({
            id: b.id,
            text: (b.innerText || b.value || '').replace(/\\s+/g, ' ').trim(),
            disabled: b.disabled,
            visible: b.offsetParent !== null,
            classes: b.className
          })).filter(b => b.text.length > 0);

          // 6. Form inputs and file uploads
          const fileInputs = Array.from(document.querySelectorAll('input[type="file"]')).map(f => ({
            id: f.id,
            name: f.name,
            visible: f.offsetParent !== null,
            accept: f.accept
          }));

          // 7. Body text summary (first 4000 chars)
          const bodyText = (document.querySelector('#main, .main-content, .content-wrapper') || document.body).innerText.replace(/\\s+/g, ' ').trim();

          return {
            url,
            title,
            alerts: alerts.slice(0, 15),
            navLinks: navLinks.slice(0, 25),
            cardsCount: cards.length,
            cardsSample: cards.slice(0, 30),
            buttons: buttons.slice(0, 25),
            fileInputs,
            bodySnippet: bodyText.slice(0, 3500)
          };
        })()`,
        returnByValue: true
      });

      console.log('--- ARGEPORTAL LIVE AUDIT RESULT ---');
      console.log(JSON.stringify(evalRes?.result?.value, null, 2));
    } catch (err) {
      console.error('Audit Error:', err);
    } finally {
      ws.close();
    }
  });

  ws.on('error', (err) => {
    console.error('WS Error:', err);
    process.exit(1);
  });
}

main().catch(console.error);
