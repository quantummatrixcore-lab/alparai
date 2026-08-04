async function test(url) {
  const r = await fetch(url, { headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } });
  const t = await r.text();
  const bodyMatch = t.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (bodyMatch) {
    const main = bodyMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`\n=== ${url} ===`);
    console.log('STATUS:', r.status);
    console.log('MAIN snippet:', main.slice(0, 250));
  }
  // Look for literal i18n keys
  const hasLiteral = t.includes('legal.cookie') || t.includes('legal.takedown');
  console.log('Has literal keys:', hasLiteral ? 'YES (BUG)' : 'no');
}
(async () => {
  await test('https://alparai.com/tr');
  await test('https://alparai.com/en');
})();
