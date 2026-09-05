// Run against a locally served site. See tests/README.md for browser setup.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
require('node:fs').mkdirSync('tmp', { recursive: true });
const site = process.env.SITE_URL || 'http://127.0.0.1:4174/';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  });
  try {
    // Hold the real entry script at the network boundary. The old reading UI
    // must not be painted while the 3D renderer is still being downloaded.
    for (const [width, delayedScript] of [[1440, 'constellation.js'], [390, 'galaxy-engine.js']]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.startupFrames = [];
        const frame = () => {
          const main = document.querySelector('#main');
          if (main) {
            const css = getComputedStyle(main);
            window.startupFrames.push({ state: document.documentElement.dataset.spaceBoot, readerVisible: css.display !== 'none' && css.visibility !== 'hidden' && css.opacity !== '0' });
          }
          if (document.documentElement.dataset.spaceBoot !== 'ready') requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      let release;
      const pending = new Promise(resolve => { release = resolve; });
      await page.route(`**/${delayedScript}*`, async route => {
        await pending;
        await route.continue();
      });
      await page.goto(site, { waitUntil: 'commit' });
      await page.waitForFunction(() => document.querySelector('.site-footer') && document.styleSheets.length >= 3);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const firstPaint = await page.evaluate(() => {
        const main = getComputedStyle(document.querySelector('#main'));
        return { hidden: main.visibility === 'hidden' || main.display === 'none' || main.opacity === '0', background: getComputedStyle(document.body).backgroundColor };
      });
      console.log(`${width}px pending first paint: ${JSON.stringify(firstPaint)}`);
      await page.screenshot({ path: `tmp/startup-pending-${width}.png` });
      assert.equal(firstPaint.hidden, true, 'the old reading homepage must not flash before 3D startup');
      assert.equal(firstPaint.background, 'rgb(3, 11, 22)', 'startup must use the night-sky background');
      release();
      await page.waitForFunction(() => document.documentElement.dataset.spaceBoot === 'ready');
      assert.equal(await page.evaluate(() => startupFrames.some(frame => frame.readerVisible)), false, 'no sampled startup frame may expose the reading UI');
      assert.equal(await page.locator('.site-header').evaluate(node => getComputedStyle(node).backgroundColor), 'rgba(0, 0, 0, 0)', 'the header must not animate from the old light-blue background');
      assert.equal(await page.locator('.celestial-label').count(), 4);
      assert.equal(await page.locator('.universe canvas').isVisible(), true);
      await page.screenshot({ path: `tmp/startup-ready-${width}.png` });
      assert.equal(await page.locator('#main').isVisible(), false);
      await page.locator('[data-reading]').click();
      assert.equal(await page.locator('#main').isVisible(), true, 'intentional reading mode must remain usable');
      await page.locator('.space-mode-return').click();
      assert.equal(await page.locator('.universe canvas').isVisible(), true);
      assert.deepEqual(errors, [], 'normal startup must not produce browser errors');
      await page.close();
    }
    console.log('PASS: desktop/mobile delayed startup, first rendered frame, reading-mode round trip');

    for (const script of ['constellation.js', 'galaxy-engine.js']) {
      const page = await browser.newPage();
      await page.route(`**/${script}*`, route => route.abort());
      await page.goto(site, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.documentElement.dataset.spaceBoot === 'fallback');
      assert.equal(await page.locator('#main').isVisible(), true, `${script} failure must reveal the reading view`);
      assert.equal(await page.locator('#space-boot').count(), 0);
      assert.equal(await page.locator('.universe').isVisible(), false);
      await page.close();
    }
    console.log('PASS: entry-script and renderer-download failure recovery');

    {
      const page = await browser.newPage();
      await page.addInitScript(() => {
        const getContext = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
          return /webgl/i.test(type) ? null : getContext.call(this, type, ...args);
        };
      });
      await page.goto(site, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.documentElement.dataset.spaceBoot === 'fallback');
      assert.equal(await page.locator('#main').isVisible(), true);
      assert.equal(await page.locator('#space-boot').count(), 0);
      await page.close();
    }
    console.log('PASS: unavailable WebGL recovers to readable content');

    {
      const page = await browser.newPage();
      let release;
      const pending = new Promise(resolve => { release = resolve; });
      await page.route('**/galaxy-engine.js*', async route => { await pending; await route.continue(); });
      await page.goto(site, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.documentElement.dataset.spaceBoot === 'fallback', null, { timeout: 16000 });
      assert.equal(await page.locator('#main').isVisible(), true, 'a stalled download must not leave the site blank');
      release();
      await page.waitForFunction(() => !document.querySelector('.universe'));
      assert.equal(await page.locator('#main').isVisible(), true, 'a late module must not hijack the fallback view');
      assert.equal(await page.locator('.space-mode-return').count(), 0);
      await page.close();
    }
    console.log('PASS: bounded startup timeout and late-download recovery');

    {
      const page = await browser.newPage({ javaScriptEnabled: false });
      await page.goto(site, { waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('#main').isVisible(), true);
      assert.equal(await page.locator('#space-boot').isVisible(), false);
      assert.equal(await page.locator('.hero-copy').evaluate(node => getComputedStyle(node).opacity), '1');
      await page.close();
    }
    {
      const page = await browser.newPage();
      const url = new URL(site); url.hash = 'contact';
      await page.goto(url.href, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('#main').isVisible(), true);
      assert.equal(await page.locator('#space-boot').isVisible(), false);
      await page.close();
    }
    console.log('PASS: no-JavaScript reading and direct section links');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
