const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.join(__dirname, 'test_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Vite preview server...');
  const previewProcess = spawn('npx.cmd', ['vite', 'preview', '--port', '4173', '--strictPort'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });

  // Wait for server to be ready
  await new Promise((resolve, reject) => {
    previewProcess.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('http://localhost:4173')) {
        console.log('✅ Vite preview server ready on http://localhost:4173');
        resolve();
      }
    });
    previewProcess.stderr.on('data', (err) => console.error('Preview stderr:', err.toString()));
    setTimeout(() => resolve(), 3000);
  });

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const viewports = [
    { name: '4k_tv', width: 3840, height: 2160, isMobile: false },
    { name: '1080p_tv', width: 1920, height: 1080, isMobile: false },
    { name: 'desktop', width: 1440, height: 900, isMobile: false },
    { name: 'tablet', width: 820, height: 1180, isMobile: true },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  let testPassed = true;

  try {
    for (const vp of viewports) {
      console.log(`\n==================================================`);
      console.log(`📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})`);
      console.log(`==================================================`);

      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });

      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => {
        consoleErrors.push(err.toString());
      });

      await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 600));

      console.log(`📸 Taking screenshot: ${vp.name}_overview.png`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}_overview.png`) });

      // Verify no critical console errors
      if (consoleErrors.length > 0) {
        console.warn(`⚠️ Console errors on ${vp.name}:`, consoleErrors);
      } else {
        console.log(`✅ Clean console: 0 errors`);
      }

      // Check Brand Shield Logo SVG renders
      const shieldLogo = await page.$('.brand-shield-svg');
      if (shieldLogo) {
        console.log(`✅ Unified Vector Shield Logo rendered on ${vp.name}`);
      } else {
        console.error(`❌ Shield SVG Logo missing on ${vp.name}`);
        testPassed = false;
      }

      // Check Country Cards render
      const cardCount = await page.$$eval('.country-card', (cards) => cards.length);
      console.log(`✅ Loaded ${cardCount} country cards in overview`);
      if (cardCount === 0) throw new Error(`No country cards found on ${vp.name}`);

      // Verify Overview Search Bar and Dropdowns are STRICTLY within mobile browser bounds
      const searchWrap = await page.$('.search-bar-wrap');
      const archWrap = await page.$('.archetype-filter-wrap');
      const countryJumpWrap = await page.$('.country-quick-select-wrap');
      if (searchWrap && archWrap && countryJumpWrap) {
        const sRect = await searchWrap.boundingBox();
        const aRect = await archWrap.boundingBox();
        const cRect = await countryJumpWrap.boundingBox();

        const searchInside = sRect.x >= 0 && sRect.x + sRect.width <= vp.width + 2;
        const archInside = aRect.x >= 0 && aRect.x + aRect.width <= vp.width + 2;
        const countryInside = cRect.x >= 0 && cRect.x + cRect.width <= vp.width + 2;

        if (searchInside && archInside && countryInside) {
          console.log(`✅ Search & both dropdowns strictly inside viewport bounds! (Search width: ${sRect.width.toFixed(0)}px, Arch width: ${aRect.width.toFixed(0)}px, Country width: ${cRect.width.toFixed(0)}px)`);
        } else {
          console.error(`❌ Search or dropdowns overflow window!`, { sRect, aRect, cRect, vpWidth: vp.width });
          testPassed = false;
        }
      }

      // Test Privacy Architecture Modal centering
      if (vp.width <= 992) {
        const hamburger = await page.$('.hamburger-btn');
        if (hamburger) {
          await hamburger.click();
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      const privacyBtn = await page.$('.security-badge-btn');
      if (privacyBtn) {
        await privacyBtn.click();
        await new Promise((r) => setTimeout(r, 400));

        const modalBox = await page.$('.modal-box-centered');
        if (modalBox) {
          const rect = await modalBox.boundingBox();
          console.log(`🔍 Privacy Modal Bounding Box on ${vp.name}:`, rect);

          // Check if modal fits within viewport
          const fitsHorizontally = rect.x >= 0 && rect.x + rect.width <= vp.width + 2;
          const fitsVertically = rect.y >= 0 && rect.y + rect.height <= vp.height + 2;
          const isRoughlyCenteredX = Math.abs((vp.width - rect.width) / 2 - rect.x) < 20;

          if (fitsHorizontally) {
            console.log(`✅ Privacy Modal is within horizontal viewport bounds (${rect.x.toFixed(0)} to ${(rect.x + rect.width).toFixed(0)})`);
          } else {
            console.error(`❌ Privacy Modal overflows horizontal window!`, rect);
            testPassed = false;
          }

          if (isRoughlyCenteredX) {
            console.log(`✅ Privacy Modal is perfectly centered horizontally (offset diff < 20px)`);
          }

          await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}_privacy_modal.png`) });

          // Close modal
          const closeBtn = await page.$('.modal-close-btn');
          if (closeBtn) await closeBtn.click();
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      // Test Compare Tab
      if (vp.width <= 992) {
        // Open hamburger if not already open
        const isNavOpen = await page.$eval('.header-nav', (el) => el.classList.contains('nav-open')).catch(() => false);
        if (!isNavOpen) {
          const hamburger = await page.$('.hamburger-btn');
          if (hamburger) {
            await hamburger.click();
            await new Promise((r) => setTimeout(r, 300));
          }
        }
        const compareTab = await page.$('button[role="tab"]:nth-of-type(2)');
        if (compareTab) await compareTab.click();
      } else {
        const compareTab = await page.$('button[role="tab"]:nth-of-type(2)');
        if (compareTab) await compareTab.click();
      }
      await new Promise((r) => setTimeout(r, 600));

      console.log(`📸 Taking screenshot: ${vp.name}_compare.png`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}_compare.png`) });

      // Verify Comparison Elements
      const vsBadge = await page.$('.vs-badge');
      if (vsBadge) {
        console.log(`✅ VS Badge and Country Selectors present`);
      }

      // Verify Mobile Parameter Breakdown on mobile screens
      if (vp.width <= 768) {
        const isMobileBreakdownVisible = await page.$eval('.mobile-comparison-breakdown', el => window.getComputedStyle(el).display !== 'none').catch(() => false);
        const isDesktopTableHidden = await page.$eval('.desktop-comparison-table', el => window.getComputedStyle(el).display === 'none').catch(() => false);
        if (isMobileBreakdownVisible && isDesktopTableHidden) {
          console.log(`✅ Mobile parameter breakdown cards active & desktop cramped table hidden on ${vp.name}!`);
        } else {
          console.error(`❌ Mobile comparison view check failed! (mobile cards visible: ${isMobileBreakdownVisible}, desktop hidden: ${isDesktopTableHidden})`);
          testPassed = false;
        }
      }

      // Test Share Snapshot Modal
      const shareBtn = await page.$('.btn-primary-share, .comparison-footer-actions .btn-primary');
      if (shareBtn) {
        await shareBtn.click();
        await new Promise((r) => setTimeout(r, 500));

        const shareModal = await page.$('.modal-box-centered');
        if (shareModal) {
          const shareRect = await shareModal.boundingBox();
          console.log(`🔍 Social Share Modal Bounding Box on ${vp.name}:`, shareRect);

          const fitsHorizontally = shareRect.x >= 0 && shareRect.x + shareRect.width <= vp.width + 2;
          if (fitsHorizontally) {
            console.log(`✅ Social Share Modal is strictly inside window bounds`);
          } else {
            console.error(`❌ Social Share Modal overflows window!`, shareRect);
            testPassed = false;
          }

          console.log(`📸 Taking screenshot: ${vp.name}_share_modal.png`);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}_share_modal.png`) });

          // Close share modal
          const closeBtn = await page.$('.modal-close-btn');
          if (closeBtn) await closeBtn.click();
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      // Test Best of Best Tab
      if (vp.width <= 992) {
        const isNavOpen = await page.$eval('.header-nav', (el) => el.classList.contains('nav-open')).catch(() => false);
        if (!isNavOpen) {
          const hamburger = await page.$('.hamburger-btn');
          if (hamburger) {
            await hamburger.click();
            await new Promise((r) => setTimeout(r, 300));
          }
        }
        const bestTab = await page.$('button[role="tab"]:nth-of-type(3)');
        if (bestTab) await bestTab.click();
      } else {
        const bestTab = await page.$('button[role="tab"]:nth-of-type(3)');
        if (bestTab) await bestTab.click();
      }
      await new Promise((r) => setTimeout(r, 600));

      const championCard = await page.$('.grand-champion-card');
      if (championCard) {
        console.log(`✅ #1 Grand Champion card rendered properly on ${vp.name}`);
      }
      console.log(`📸 Taking screenshot: ${vp.name}_best_of_best.png`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${vp.name}_best_of_best.png`) });

      await page.close();
    }
  } catch (err) {
    console.error('Test execution failed:', err);
    testPassed = false;
  } finally {
    await browser.close();
    previewProcess.kill();
  }

  if (testPassed) {
    console.log('\n🎉 ALL MULTI-DEVICE & FORM FACTOR TESTS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME TESTS FAILED.');
    process.exit(1);
  }
}

run();
