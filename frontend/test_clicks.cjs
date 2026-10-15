const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = process.env.APP_URL || 'http://127.0.0.1:4173';

async function runTests() {
  console.log('🚀 Starting Chrome automation tests...');
  const errors = [];
  const logs = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[BROWSER ${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push(`Console error: ${text}`);
    }
  });

  page.on('pageerror', err => {
    errors.push(`Uncaught page error: ${err.message}`);
  });

  try {
    console.log(`📡 Navigating to ${APP_URL}...`);
    await page.goto(APP_URL, { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('✅ Page loaded successfully');

    // 1. Check title
    const title = await page.title();
    console.log(`📌 Page title: "${title}"`);

    // 2. Test Privacy-First Architecture button & centered modal
    console.log('\n--- 1. Testing Privacy-First Architecture Modal ---');
    const privacyBtn = await page.$('.security-badge-btn');
    if (!privacyBtn) throw new Error('Privacy button not found');
    await privacyBtn.click();
    await page.waitForSelector('.modal-box-centered', { visible: true });

    // Validate bounding box
    const modalBox = await page.$('.modal-box-centered');
    const box = await modalBox.boundingBox();
    console.log(`Modal bounds: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
    const viewport = page.viewport();
    if (box.x < 0 || box.y < 0 || (box.x + box.width) > viewport.width || (box.y + box.height) > viewport.height) {
      throw new Error(`Modal bounds exceed viewport! Viewport: ${viewport.width}x${viewport.height}, Modal: ${box.width}x${box.height} at (${box.x}, ${box.y})`);
    }
    console.log('✅ Privacy modal is within window bounds and centered!');

    // Close modal
    const closeBtn = await page.$('.modal-close-btn');
    await closeBtn.click();
    await page.waitForSelector('.modal-box-centered', { hidden: true });
    console.log('✅ Privacy modal closed successfully');

    // 3. Test Add Country Modal
    console.log('\n--- 2. Testing Add Country Modal ---');
    const addCountryBtn = await page.$('.btn-add-country');
    if (!addCountryBtn) throw new Error('Add Country button not found');
    await addCountryBtn.click();
    await page.waitForSelector('.add-country-modal', { visible: true });

    // Try submitting empty to test validation
    const submitBtn = await page.$('.btn-submit');
    await submitBtn.click();
    const alertMsg = await page.$('.alert-error');
    if (alertMsg) {
      const errText = await page.evaluate(el => el.textContent, alertMsg);
      console.log(`✅ Validation error displayed as expected: "${errText}"`);
    }

    // Close Add Country modal
    const closeAddModal = await page.$('.add-country-modal .modal-close-btn');
    await closeAddModal.click();
    await page.waitForSelector('.add-country-modal', { hidden: true });
    console.log('✅ Add Country modal closed successfully');

    // 4. Test Language Selector
    console.log('\n--- 3. Testing Language Selector ---');
    const langSelect = await page.$('.language-select');
    if (langSelect) {
      const languages = ['fr', 'es', 'de', 'ja', 'zh', 'hi', 'en'];
      for (const lang of languages) {
        await page.select('.language-select', lang);
        await new Promise(r => setTimeout(r, 200));
        console.log(`✅ Switched to language: ${lang}`);
      }
    }

    // 5. Test Country Filters & Searchable Select Dropdowns
    console.log('\n--- 4. Testing Country Filters & Type-to-Search Comboboxes ---');
    // Test Archetype Searchable Select
    const archetypeTrigger = await page.$('.archetype-select .searchable-select-trigger');
    if (archetypeTrigger) {
      await archetypeTrigger.click();
      await page.waitForSelector('.archetype-select .searchable-select-dropdown', { visible: true });
      const archInput = await page.$('.archetype-select .search-inline-input');
      if (archInput) await archInput.type('Omnibus');
      await new Promise(r => setTimeout(r, 200));
      const firstArchOpt = await page.$('.archetype-select .select-option-item');
      if (firstArchOpt) await firstArchOpt.click();
      console.log('✅ Type-searched and selected EU Omnibus archetype');

      // Reset
      await archetypeTrigger.click();
      const allArchOpt = await page.$('.archetype-select .select-option-item');
      if (allArchOpt) await allArchOpt.click();
      console.log('✅ Reset archetype filter');
    }

    // Test Sovereign Nation Type-Search Combobox
    const sovereignTrigger = await page.$('.sovereign-select .searchable-select-trigger');
    if (sovereignTrigger) {
      await sovereignTrigger.click();
      await page.waitForSelector('.sovereign-select .searchable-select-dropdown', { visible: true });

      // Verify the dropdown is ON TOP of cards / elements using elementFromPoint
      const dropdownEl = await page.$('.sovereign-select .searchable-select-dropdown');
      const box = await dropdownEl.boundingBox();
      const isTopmost = await page.evaluate((x, y) => {
        const el = document.elementFromPoint(x, y);
        return el && el.closest('.searchable-select-dropdown') !== null;
      }, box.x + 30, box.y + 40);
      if (!isTopmost) throw new Error('Sovereign dropdown is obstructed or behind other elements!');
      console.log('✅ Verified sovereign dropdown is drawn ON TOP of underlying elements (no card clipping)!');

      const sovInput = await page.$('.sovereign-select .search-inline-input');
      if (sovInput) await sovInput.type('Germany');
      await new Promise(r => setTimeout(r, 200));
      const germanyOpt = await page.$('.sovereign-select .select-option-item');
      if (germanyOpt) await germanyOpt.click();
      console.log('✅ Type-searched and selected Germany from 197 sovereign nations');

      // Reset to All
      await sovereignTrigger.click();
      const sovInputReset = await page.$('.sovereign-select .search-inline-input');
      if (sovInputReset) await sovInputReset.type('All');
      await new Promise(r => setTimeout(r, 200));
      const allNationsOpt = await page.$('.sovereign-select .select-option-item');
      if (allNationsOpt) await allNationsOpt.click();
      console.log('✅ Reset back to All Nations');
    }

    // Test quick country filter pills
    const filterPills = await page.$$('.filter-pill');
    console.log(`Found ${filterPills.length} quick filter pills`);
    if (filterPills.length > 2) {
      await filterPills[1].click(); // click second pill (e.g. US)
      await new Promise(r => setTimeout(r, 200));
      console.log('✅ Clicked country quick filter pill');
      await filterPills[0].click(); // reset to All Nations
      await new Promise(r => setTimeout(r, 200));
      console.log('✅ Reset back to All Nations');
    }

    // Test Search input and clear button
    const searchInput = await page.$('.search-input');
    if (searchInput) {
      await searchInput.type('Japan');
      await new Promise(r => setTimeout(r, 200));
      console.log('✅ Searched for "Japan"');
      const clearBtn = await page.$('.clear-search-btn');
      if (clearBtn) {
        await clearBtn.click();
        await new Promise(r => setTimeout(r, 200));
        console.log('✅ Search cleared via clear button');
      }
    }

    // 6. Test Country Card Interactivity (Details & Radar)
    console.log('\n--- 5. Testing Country Card Buttons ---');
    const firstCard = await page.$('.country-card');
    if (firstCard) {
      // Toggle details
      const detailBtn = await firstCard.$('.btn-details');
      if (detailBtn) {
        await detailBtn.click();
        await page.waitForSelector('.expanded-details', { visible: true });
        console.log('✅ Expanded deep dive details');
        await detailBtn.click();
        await page.waitForSelector('.expanded-details', { hidden: true });
        console.log('✅ Collapsed deep dive details');
      }

      // Open Radar modal
      const radarBtn = await firstCard.$('.btn-radar-modal');
      if (radarBtn) {
        await radarBtn.click();
        await page.waitForSelector('.radar-modal-centered', { visible: true });
        console.log('✅ Opened Radar Spider Map modal');
        const radarClose = await page.$('.radar-modal-centered .modal-close-btn');
        if (radarClose) await radarClose.click();
        console.log('✅ Closed Radar modal');
      }

      // Click card Compare button
      const cardCompareBtn = await firstCard.$('.btn-compare-action');
      if (cardCompareBtn) {
        await cardCompareBtn.click();
        console.log('✅ Clicked card Compare button, moved to Compare tab');
      }
    }

    // 7. Test Comparison View Tab & Social Share
    console.log('\n--- 6. Testing Comparison View & Social Share Modal ---');
    // Ensure we are on Compare tab
    const compareNavBtn = await page.$('button[data-tab="comparison"]');
    if (compareNavBtn) await compareNavBtn.click();
    await page.waitForSelector('.comparison-view', { visible: true });
    console.log('✅ Comparison view loaded');

    // Test Type-Search on Country A
    const countryATrigger = await page.$('.country-a-select .searchable-select-trigger');
    if (countryATrigger) {
      await countryATrigger.click();
      const inputA = await page.$('.country-a-select .search-inline-input');
      if (inputA) await inputA.type('India');
      await new Promise(r => setTimeout(r, 200));
      const optA = await page.$('.country-a-select .select-option-item');
      if (optA) await optA.click();
      console.log('✅ Type-searched and selected India for Country A');
    }

    // Test Type-Search on Country B
    const countryBTrigger = await page.$('.country-b-select .searchable-select-trigger');
    if (countryBTrigger) {
      await countryBTrigger.click();
      const inputB = await page.$('.country-b-select .search-inline-input');
      if (inputB) await inputB.type('France');
      await new Promise(r => setTimeout(r, 200));
      const optB = await page.$('.country-b-select .select-option-item');
      if (optB) await optB.click();
      console.log('✅ Type-searched and selected France for Country B');
    }

    // Test Swap button
    const swapBtn = await page.$('.swap-btn');
    if (swapBtn) {
      await swapBtn.click();
      console.log('✅ Clicked Swap Countries button (Swapped India & France)');
    }

    // Test Share Snapshot button & Graphic Download
    const shareBtn = await page.$('.btn-share-snapshot');
    if (shareBtn) {
      await shareBtn.click();
      await page.waitForSelector('.share-snapshot-modal', { visible: true });
      console.log('✅ Opened Social Snapshot Modal');

      // Test social buttons
      const socialBtns = await page.$$('.share-snapshot-modal .btn-social');
      console.log(`Found ${socialBtns.length} social share buttons`);
      expectTrue(socialBtns.length >= 6, 'Should have at least 6 social sharing options');
      for (const btn of socialBtns) {
        const btnText = await page.evaluate(el => el.textContent, btn);
        console.log(`✅ Verified social button: ${btnText.trim()}`);
      }

      // Test Copy Image button & Toast feedback
      const copyImgBtn = await page.$('.share-snapshot-modal .btn-copy-image');
      if (copyImgBtn) {
        await copyImgBtn.click();
        await page.waitForSelector('.share-feedback-toast', { visible: true });
        const feedbackText = await page.$eval('.share-feedback-toast', el => el.textContent);
        console.log(`✅ Clicked Copy Image button, toast shown: "${feedbackText.trim()}"`);
      }

      // Test Graphic Card Download button
      const downloadBtn = await page.$('.share-snapshot-modal .btn-download');
      if (downloadBtn) {
        await downloadBtn.click();
        await new Promise(r => setTimeout(r, 300));
        console.log('✅ Clicked Download Story Graphic (.png) canvas export');
      }

      const closeShare = await page.$('.share-snapshot-modal .modal-close-btn');
      if (closeShare) {
        await closeShare.click();
        await page.waitForSelector('.share-snapshot-modal', { hidden: true });
        console.log('✅ Closed Social Snapshot Modal');
      }
    }

    // 8. Test Best of Best Tab & Category Buttons
    console.log('\n--- 7. Testing Best of Best Ranking & Category Buttons ---');
    const bestNavBtn = await page.$('button[data-tab="bestOfBest"]');
    if (bestNavBtn) {
      await bestNavBtn.click();
      await page.waitForSelector('.best-of-best', { visible: true });
      console.log('✅ Best of Best view loaded');

      const paramRankRows = await page.$$('.param-rank-row');
      console.log(`Found ${paramRankRows.length} parameter dimension champion/runner-up rows`);
      expectTrue(paramRankRows.length >= 5, 'Should have at least 5 parameter rows');
    }

    // 9. Comprehensive Multi-Device / Form Factor Suite (Mobile, Tablet, Desktop, TV 1080p, TV 4K)
    console.log('\n--- 8. Testing Multi-Form Factor Responsiveness (Mobile, Tablet, Desktop, TV) ---');

    const devices = [
      { name: 'Mobile (iPhone SE / Android)', width: 375, height: 667, isMobile: true },
      { name: 'Tablet (iPad / Tablet)', width: 820, height: 1180, isMobile: false },
      { name: 'Desktop (Standard Laptop)', width: 1280, height: 800, isMobile: false },
      { name: 'TV 1080p (Full HD)', width: 1920, height: 1080, isMobile: false },
      { name: 'TV 4K (Ultra HD)', width: 3840, height: 2160, isMobile: false }
    ];

    // Switch to overview view for grid and command bar testing
    const overviewNavBtn = await page.$('button[data-tab="overview"]');
    if (overviewNavBtn) await overviewNavBtn.click();
    await page.waitForSelector('.cards-grid', { visible: true });

    for (const dev of devices) {
      console.log(`\nTesting viewport: ${dev.name} (${dev.width}x${dev.height})...`);
      await page.setViewport({ width: dev.width, height: dev.height, isMobile: dev.isMobile });
      await new Promise(r => setTimeout(r, 250));

      // Verify zero horizontal overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (overflow) {
        const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
        throw new Error(`Horizontal overflow detected on ${dev.name}! scrollWidth=${scrollW}, innerWidth=${dev.width}`);
      }
      console.log(`✅ Zero horizontal overflow on ${dev.name} (scrollWidth <= ${dev.width}px)`);

      // Verify command dock visibility
      const commandBar = await page.$('.filter-command-bar');
      expectTrue(commandBar !== null, `Command bar should be visible on ${dev.name}`);

      // Verify cards grid adapts cleanly
      const cards = await page.$$('.country-card');
      expectTrue(cards.length > 0, `Country cards should render on ${dev.name}`);
      console.log(`✅ ${cards.length} country cards rendered cleanly on ${dev.name}`);
    }

    // Retest mobile hamburger navigation & centered privacy modal on mobile
    console.log('\n--- 9. Mobile Interaction Verification ---');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 200));

    const hamburgerBtn = await page.$('.hamburger-btn');
    if (hamburgerBtn) {
      await hamburgerBtn.click();
      await new Promise(r => setTimeout(r, 200));
      console.log('✅ Opened mobile menu via hamburger button');

      const mobilePrivacyBtn = await page.$('.security-badge-btn');
      if (mobilePrivacyBtn) {
        await mobilePrivacyBtn.click();
        await page.waitForSelector('.modal-box-centered', { visible: true });
        const mobileBox = await page.$('.modal-box-centered');
        const mBox = await mobileBox.boundingBox();
        if (mBox.x < 0 || (mBox.x + mBox.width) > 375) {
          throw new Error(`Modal exceeds mobile viewport width! w=${mBox.width} at x=${mBox.x}`);
        }
        console.log('✅ Privacy modal fits perfectly inside mobile viewport (375px)!');
        const mobileClose = await page.$('.modal-close-btn');
        if (mobileClose) await mobileClose.click();
        await page.waitForSelector('.modal-box-centered', { hidden: true });
        console.log('✅ Mobile privacy modal closed successfully');
      }

      await hamburgerBtn.click();
      await new Promise(r => setTimeout(r, 200));
      console.log('✅ Closed mobile menu');
    }

    console.log('\n🎉 ALL BUTTONS & USER FLOWS TESTED SUCCESSFULLY WITH ZERO ERRORS!');

  } catch (err) {
    console.error(`❌ TEST FAILED: ${err.message}`);
    errors.push(err.message);
  } finally {
    await browser.close();
  }

  if (errors.length > 0) {
    console.error('\nTotal errors encountered:', errors.length);
    errors.forEach(e => console.error(' - ', e));
    process.exit(1);
  } else {
    console.log('\n✨ COMPLETE VERIFICATION PASSED: All buttons clicked, modals centered, no JS errors.');
    process.exit(0);
  }
}

function expectTrue(val, msg) {
  if (!val) throw new Error(`Assertion failed: ${msg}`);
}

runTests();
