import { chromium } from 'playwright';
import path from 'path';
import os from 'os';

(async () => {
  const userDataDir = path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data');
  console.log('Using User Data Dir:', userDataDir);
  
  // Launch Chrome using the user's local profile
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',
    headless: false,
    viewport: null,
    args: ['--start-maximized']
  });

  const page = await context.newPage();

  console.log('--- LINKEDIN COMPANY PAGE MISSION ---');
  try {
    await page.goto('https://www.linkedin.com/company/135125061/admin/dashboard/');
    await page.waitForTimeout(5000);
    
    const title = await page.title();
    console.log('LinkedIn Page Title:', title);

    if (title.includes('Sign In') || title.includes('Giriş Yap')) {
      console.log('❌ NOT LOGGED IN TO LINKEDIN! Please log in first.');
    } else {
      console.log('✅ Logged in successfully. Starting page update...');
      
      // Update About description if "Edit" button exists
      // (This is a simplified automation; normally requires clicking specific selectors)
      const editBtn = page.locator('button:has-text("Edit"), button:has-text("Düzenle")').first();
      if (await editBtn.count() > 0) {
        await editBtn.click();
        await page.waitForTimeout(2000);
        console.log('Clicked edit button.');
      } else {
        console.log('Edit button not found, trying direct navigation to about edit...');
        await page.goto('https://www.linkedin.com/company/135125061/admin/about/edit/');
        await page.waitForTimeout(3000);
      }

      // First Post Creation
      console.log('Creating first official post...');
      await page.goto('https://www.linkedin.com/company/135125061/admin/dashboard/');
      await page.waitForTimeout(3000);
      
      const startPostBtn = page.locator('button:has-text("Start a post"), button:has-text("Gönderi paylaş")').first();
      if (await startPostBtn.count() > 0) {
        await startPostBtn.click();
        await page.waitForTimeout(2000);
        
        const editor = page.locator('.ql-editor, textarea[placeholder*="What do you want to talk about"]').first();
        const postText = `🚀 ALPAR AI Resmi Olarak Faaliyete Geçti!\n\nAI hesap verebilirliği artık gerçek bir altyapıya kavuştu.\n\n✅ 409+ belgeli AI olayı\n✅ Çapraz denetim motoru\n✅ Açık API\n✅ Gerçek zamanlı şeffaflık\n\nYapılandırılmış ve güvenilir yapay zeka geleceğini birlikte inşa ediyoruz.\n\n🔗 alparai.com\n#AIAccountability #AITransparency #TrustAI #ALPARAI`;
        
        await editor.fill(postText);
        await page.waitForTimeout(1000);
        
        const shareBtn = page.locator('button:has-text("Post"), button:has-text("Paylaş")').first();
        await shareBtn.click();
        console.log('✅ First post shared successfully!');
        await page.waitForTimeout(3000);
      }
    }
  } catch (err) {
    console.error('Error during LinkedIn automation:', err.message);
  } finally {
    await context.close();
  }
})();
