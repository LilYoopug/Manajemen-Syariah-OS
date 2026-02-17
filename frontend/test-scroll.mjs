import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://127.0.0.1:3000');
  await page.waitForLoadState('networkidle');
  
  // Get initial scroll position
  const initialScroll = await page.evaluate(() => window.scrollY);
  console.log('Initial scroll position:', initialScroll);
  
  // Find and click "Pelajari Fitur" button
  const pelajariButton = page.locator('button:has-text("Pelajari Fitur")');
  console.log('Found Pelajari Fitur button:', await pelajariButton.count());
  
  if (await pelajariButton.count() > 0) {
    await pelajariButton.click();
    
    // Wait for scroll animation
    await page.waitForTimeout(1000);
    
    const afterScroll = await page.evaluate(() => window.scrollY);
    console.log('After clicking Pelajari Fitur, scroll position:', afterScroll);
    
    // Check if features section exists and where it is
    const featuresVisible = await page.evaluate(() => {
      const el = document.getElementById('features');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { top: rect.top, y: window.scrollY, offsetTop: el.offsetTop };
    });
    console.log('Features section info:', featuresVisible);
  }
  
  // Test mobile menu - Fitur Utama
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://127.0.0.1:3000');
  await page.waitForLoadState('networkidle');
  
  // Click mobile menu button (the hamburger icon)
  const menuToggle = page.locator('nav button.md\\:hidden');
  console.log('Menu toggle found:', await menuToggle.count());
  
  if (await menuToggle.count() > 0) {
    await menuToggle.click();
    await page.waitForTimeout(300);
    
    // Check if dropdown is visible
    const fiturUtama = page.locator('button:has-text("Fitur Utama")');
    console.log('Fitur Utama found:', await fiturUtama.count());
    
    if (await fiturUtama.count() > 0) {
      await fiturUtama.click();
      await page.waitForTimeout(1000);
      
      const mobileScrollPos = await page.evaluate(() => window.scrollY);
      console.log('After clicking Fitur Utama, scroll position:', mobileScrollPos);
    }
  }
  
  await browser.close();
  console.log('Test complete!');
}

test().catch(console.error);
