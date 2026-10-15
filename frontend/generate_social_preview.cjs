const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_FILE = path.join(__dirname, 'public', 'social-preview.png');

async function generatePreview() {
  console.log('Generating social-preview.png...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px;
      height: 630px;
      background: radial-gradient(circle at 50% 20%, #0f172a 0%, #020617 100%);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #ffffff;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 16px;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.2);
    }
    .dot {
      width: 10px;
      height: 10px;
      background: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 10px #10b981;
    }
    h1 {
      font-size: 64px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      background: linear-gradient(180deg, #ffffff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-top: 20px;
    }
    p {
      font-size: 24px;
      color: #94a3b8;
      max-width: 860px;
      line-height: 1.5;
      margin-top: 15px;
    }
    .stats-row {
      display: flex;
      gap: 25px;
      margin-top: 30px;
    }
    .stat-card {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 16px 28px;
      backdrop-filter: blur(10px);
    }
    .stat-num {
      font-size: 32px;
      font-weight: 800;
      color: #38bdf8;
    }
    .stat-label {
      font-size: 14px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 4px;
      font-weight: 600;
    }
    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 25px;
    }
    .footer-left {
      font-size: 18px;
      color: #64748b;
      font-weight: 600;
    }
    .footer-flags {
      font-size: 28px;
      display: flex;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="grid-lines"></div>
  <div>
    <div class="badge">
      <span class="dot"></span>
      Global Data Security Observatory
    </div>
    <h1>Sovereign Data Protection Portfolios</h1>
    <p>Authoritative regulatory telemetry and policy benchmarking spanning all 197 sovereign United Nations economies.</p>
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num">197</div>
        <div class="stat-label">Sovereign Nations</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">500+</div>
        <div class="stat-label">Policy Benchmarks</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">100%</div>
        <div class="stat-label">Privacy-First Sandbox</div>
      </div>
    </div>
  </div>
  <div class="footer-row">
    <div class="footer-left">🛡️ dhruvbaslas.github.io/global-data-security-observatory</div>
    <div class="footer-flags">🇺🇸 🇪🇺 🇮🇳 🇯🇵 🇬🇧 🇩🇪 🇫🇷 🇧🇷 🇸🇬 🇨🇦</div>
  </div>
</body>
</html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: OUTPUT_FILE, type: 'png' });
  await browser.close();
  console.log(`✅ Saved preview image to ${OUTPUT_FILE}`);
}

generatePreview().catch((err) => {
  console.error('Error generating preview:', err);
  process.exit(1);
});

