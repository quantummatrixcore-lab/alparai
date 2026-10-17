
const crypto = require('crypto');
setInterval(() => {
    const email = 'dev_' + crypto.randomBytes(2).toString('hex') + '@tech.com';
    console.log('[ALPARAI] Kurumsal API Token Teklifi Gidiyor -> ' + email);
    console.log('   - Urun: Sinirsiz Rate-Limit API Erisimi & Token Paketi');
    console.log('   - Fiyat: 5.000 TL | Link: https://test-checkout.lemonsqueezy.com/buy/alparai_mock');
}, 5000);
