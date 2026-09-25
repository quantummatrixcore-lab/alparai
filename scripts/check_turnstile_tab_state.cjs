/**
 * scripts/check_turnstile_tab_state.cjs
 * Safely inspects Turnstile tab state via CDP.
 */

const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:9222/devtools/page/36D5E824F985CA2C1E92C13794716AC3');

ws.on('open', () => {
  const script = `(() => {
    const url = window.location.href;
    const title = document.title;
    const bodyText = (document.querySelector('main') || document.body).innerText || '';

    // Search for Site Key and Secret Key patterns
    const siteKeyMatch = bodyText.match(/(?:Site Key|Sitekey)[\\s\\n:]+([0-9a-zA-Z_xX-]{20,})/i) || bodyText.match(/(0x4[0-9a-zA-Z_]{15,})/);
    const secretKeyMatch = bodyText.match(/(?:Secret Key|Secretkey)[\\s\\n:]+([0-9a-zA-Z_xX-]{20,})/i) || bodyText.match(/(0x4[0-9a-zA-Z_]{20,})/);

    // Inputs
    const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type,
      name: i.name,
      value: i.value,
      placeholder: i.placeholder
    }));

    return {
      url,
      title,
      siteKey: siteKeyMatch ? siteKeyMatch[1] : null,
      secretKey: secretKeyMatch ? secretKeyMatch[1] : null,
      inputs,
      textSample: bodyText.slice(0, 2000)
    };
  })()`;

  ws.send(JSON.stringify({
    id: 1,
    method: 'Runtime.evaluate',
    params: { expression: script, returnByValue: true }
  }));
});

ws.on('message', (raw) => {
  const res = JSON.parse(raw);
  console.log('--- TURNSTILE TAB STATE ---');
  console.log(JSON.stringify(res.result?.result?.value, null, 2));
  ws.close();
});

ws.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
