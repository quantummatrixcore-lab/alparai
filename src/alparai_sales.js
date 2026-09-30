
'use strict';
const checkoutUrl = 'https://alparai.lemonsqueezy.com/checkout/custom/1af551c4-8153-4dbd-b54d-1e51594f4fe0?signature=e9ff4a194d946194788e258bebd2a7656430d869698a04a77a72008eb54fb934';
console.log('[ALPARAI API ENGINE] Live Lemon Squeezy Connected.');
setInterval(() => {
    console.log('[ALPARAI LIVE] API Token Sales & Payment Link Ready: ' + checkoutUrl);
}, 25000);
