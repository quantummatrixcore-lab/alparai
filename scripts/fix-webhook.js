const fs = require('fs');
let code = fs.readFileSync('src/app/api/webhooks/stripe/route.ts', 'utf8');

if (!code.includes('@vercel/functions')) {
  code = 'import { waitUntil } from "@vercel/functions";\n' + code;
}

const switchIndex = code.indexOf('switch (event.type) {');
const returnIndex = code.lastIndexOf('return NextResponse.json({ received: true });');

if (switchIndex !== -1 && returnIndex !== -1 && !code.includes('waitUntil(')) {
  const adminIndex = code.indexOf('const admin = createAdminClient();', switchIndex - 50);
  
  const beforeSwitch = code.substring(0, adminIndex);
  const switchBlock = code.substring(adminIndex, returnIndex);
  const afterSwitch = code.substring(returnIndex);
  
  code = beforeSwitch + 'waitUntil((async () => {\n' + switchBlock + '  })());\n\n  ' + afterSwitch;
  
  fs.writeFileSync('src/app/api/webhooks/stripe/route.ts', code);
  console.log('Fixed webhook');
} else {
  console.log('Webhook already fixed or blocks not found');
}
