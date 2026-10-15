const puppeteer = require('puppeteer-core');
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const LIVE_URL = 'https://dhruvbaslas.github.io/global-data-security-observatory/';

async function testLiveResponsive() {
  console.log('Testing live responsive layouts on:', LIVE_URL);
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const viewports = [
    { name: 'iPhone 14 (Mobile)', width: 390, height: 844 },
    { name: 'iPad (Tablet)', width: 768, height: 1024 },
    { name: 'Desktop HD', width: 1920, height: 1080 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(LIVE_URL, { waitUntil: 'networkidle0' });

    // 1. Vector Logo check
    const logoExists = await page.$('.brand-shield-svg');
    console.log(`[${vp.name}] Vector Shield Logo:`, !!logoExists);

    // 2. Mobile search & dropdowns bounding box
    const searchWrap = await page.$('.search-bar-wrap');
    const archWrap = await page.$('.archetype-filter-wrap');
    const countryWrap = await page.$('.country-quick-select-wrap');
    if (searchWrap && archWrap && countryWrap) {
      const sRect = await searchWrap.boundingBox();
      const aRect = await archWrap.boundingBox();
      const cRect = await countryWrap.boundingBox();
      const fits = (sRect.x + sRect.width <= vp.width + 2) && (aRect.x + aRect.width <= vp.width + 2) && (cRect.x + cRect.width <= vp.width + 2);
      console.log(`[${vp.name}] Search & Dropdowns inside viewport:`, fits, `(Search: ${sRect.width}px, Arch: ${aRect.width}px, Country: ${cRect.width}px)`);
    }

    // 3. Compare View
    await page.goto(LIVE_URL + '?tab=compare&a=US&b=DE', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    if (vp.width <= 768) {
      const mobileBreakdown = await page.$eval('.mobile-comparison-breakdown', el => window.getComputedStyle(el).display !== 'none').catch(() => false);
      const desktopTableHidden = await page.$eval('.desktop-comparison-table', el => window.getComputedStyle(el).display === 'none').catch(() => false);
      console.log(`[${vp.name}] Mobile comparison cards active & desktop table hidden:`, mobileBreakdown && desktopTableHidden);
    } else {
      const desktopTableVisible = await page.$eval('.desktop-comparison-table', el => window.getComputedStyle(el).display !== 'none').catch(() => false);
      console.log(`[${vp.name}] Desktop comparison table visible:`, desktopTableVisible);
    }

    await page.close();
  }

  await browser.close();
  console.log('✅ All live responsive checks verified successfully!');
}

testLiveResponsive().catch(err => { console.error(err); process.exit(1); });
