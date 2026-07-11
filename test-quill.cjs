const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const session = { authKey: 'HP-ADMIN-0001', name: 'Admin', loginAt: Date.now() };
  const sessionStr = encodeURIComponent(JSON.stringify(session));
  await page.setCookie({
    name: 'hackpark_auth', value: sessionStr, domain: 'localhost',
    expires: Math.floor(Date.now() / 1000) + 86400, path: '/', sameSite: 'Lax',
  });

  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('hackpark_users') || '[]');
    if (!users.find(u => u.authKey === 'HP-ADMIN-0001')) {
      users.push({ authKey: 'HP-ADMIN-0001', name: 'Admin', phone: '+79999999999', isAdmin: true, loginAt: Date.now() });
      localStorage.setItem('hackpark_users', JSON.stringify(users));
    }
  });

  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  // Click "Статьи" nav item
  await page.evaluate(() => {
    const items = [...document.querySelectorAll('.dash-nav-item')];
    const target = items.find(e => e.textContent.includes('Статьи'));
    if (target) target.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // Get the articles section content
  const content = await page.evaluate(() => {
    const main = document.querySelector('.dash-content, main, [class*=content]');
    if (main) {
      // Get all buttons and links visible in main area
      const btns = [...main.querySelectorAll('button, a, [class*=btn]')].slice(0, 15).map(e => ({
        text: e.textContent.trim().slice(0, 50),
        cls: e.className.slice(0, 80),
      }));
      return { btns, bodyText: main.innerText.slice(0, 500) };
    }
    return { btns: [], bodyText: 'No main content found' };
  });
  console.log('Buttons:', content.btns);
  console.log('Content:', content.bodyText);

  await page.screenshot({ path: 'test-articles.png' });

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });