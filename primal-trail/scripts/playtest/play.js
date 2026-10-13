// Plays Primal Trail end to end in the web build (offline backend, simulated GPS):
// sign up, safety screen, walk, gather, craft a slingshot, tame two creatures,
// reload and check they persisted. Saves screenshots of every step.
//
//   EXPO_PUBLIC_SIMULATE_LOCATION=1 npx expo export --platform web --output-dir dist
//   node scripts/playtest/serve.js "$PWD/dist" 8765 &
//   npx -p playwright node scripts/playtest/play.js
//
// The `[play]` log lines narrate the run; it ends with what was tamed and any console errors.
const { chromium } = require('playwright');

const OUT = process.env.OUT || 'playtest-shots';
const URL = process.env.URL || 'http://localhost:8765/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log('[play]', ...a);

(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
  const tid = (id) => page.locator(`[data-testid="${id}"]`);
  const press = async (el) => {
    try {
      await el.click({ timeout: 2000 });
    } catch {
      await el.focus();
      await page.keyboard.press('Enter');
    }
  };
  const toastText = async () => ((await tid('toast').count()) ? (await tid('toast').innerText()).trim() : '');

  await page.goto(URL);
  await page.getByText('New here? Create an account').waitFor({ timeout: 30000 });
  await shot('01-sign-in');
  await page.getByText('New here? Create an account').click();
  await tid('email').fill('tester@example.com');
  await tid('password').fill('hunter22');
  await tid('submit').click();

  await tid('ack-safety').waitFor({ timeout: 15000 });
  await shot('02-safety');
  await tid('ack-safety').click();

  await tid('survival-hud').waitFor({ timeout: 15000 });
  await tid('game-map').waitFor();
  await sleep(1500);
  await shot('03-map');

  // --- helpers -------------------------------------------------------------
  async function mapCenter() {
    const b = await tid('game-map').boundingBox();
    return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  }
  async function targets(prefix) {
    const loc = page.locator(`[data-testid^="${prefix}"]`);
    const n = await loc.count();
    const c = await mapCenter();
    const out = [];
    for (let i = 0; i < n; i++) {
      const el = loc.nth(i);
      const b = await el.boundingBox();
      if (!b) continue;
      const label = (await el.getAttribute('aria-label')) || '';
      const m = label.match(/(\d+) meters/);
      out.push({
        el,
        testid: await el.getAttribute('data-testid'),
        label,
        dist: m ? Number(m[1]) : 9999,
        dx: b.x + b.width / 2 - c.x,
        dy: b.y + b.height / 2 - c.y,
        opacity: await el.evaluate((e) => getComputedStyle(e.firstElementChild).opacity),
      });
    }
    return out.sort((a, b) => a.dist - b.dist);
  }
  // Walk toward a target until the server says we're in range (dist <= 40).
  async function walkTo(find) {
    for (let i = 0; i < 40; i++) {
      const t = await find();
      if (!t) return null;
      if (t.dist <= 38) {
        // wait for the server to accept our latest position
        await sleep(3500);
        return (await find()) ?? t;
      }
      const dir = Math.abs(t.dx) > Math.abs(t.dy) ? (t.dx > 0 ? 'east' : 'west') : t.dy > 0 ? 'south' : 'north';
      await tid(`walk-${dir}`).click();
      await sleep(250);
    }
    return null;
  }
  async function inventory() {
    await page.getByRole('tab', { name: /Bag/ }).click();
    await sleep(400);
    const items = {};
    const loc = page.locator('[data-testid^="item-"]');
    for (let i = 0; i < (await loc.count()); i++) {
      const id = (await loc.nth(i).getAttribute('data-testid')).slice(5);
      const m = (await loc.nth(i).innerText()).match(/×(\d+)/);
      items[id] = m ? Number(m[1]) : 0;
    }
    await page.getByRole('tab', { name: /Explore/ }).click();
    await sleep(400);
    return items;
  }

  // --- gather until we can craft a slingshot -------------------------------
  const gathered = new Set();
  let inv = {};
  for (let round = 0; round < 14; round++) {
    const want = (inv.wood ?? 0) < 3 ? ['node-tree'] : (inv.fiber ?? 0) < 5 ? ['node-bush', 'node-tree'] : ['node-rock'];
    if ((inv.wood ?? 0) >= 3 && (inv.fiber ?? 0) >= 5 && (inv.stone ?? 0) >= 12) break;
    const find = async () => {
      const ts = (await targets('node-')).filter((t) => want.includes(t.testid) && !gathered.has(t.label.split(' ')[0] + t.dx.toFixed(0)));
      return ts.find((t) => Number(t.opacity) > 0.5) ?? null;
    };
    let t = await find();
    if (!t) {
      // nothing of that type in view; wander north a bit
      for (let k = 0; k < 6; k++) await tid('walk-north').click();
      await sleep(3500);
      continue;
    }
    t = await walkTo(find);
    if (!t) continue;
    await press(t.el);
    await sleep(600);
    const msg = await toastText();
    log('gather', t.testid, t.dist + 'm', '->', msg);
    if (round === 0) await shot('04-gather-toast');
    await sleep(2500);
    inv = await inventory();
    log('inventory', JSON.stringify(inv));
  }

  // --- craft --------------------------------------------------------------
  await page.getByRole('tab', { name: /Craft/ }).click();
  await sleep(500);
  await shot('05-craft');
  if ((await tid('craft-slingshot').count()) && (await tid('craft-slingshot').isEnabled())) {
    await tid('craft-slingshot').click();
    await sleep(600);
    log('craft ->', await toastText());
  } else {
    log('could not craft slingshot', JSON.stringify(inv));
  }
  await page.getByRole('tab', { name: /Bag/ }).click();
  await sleep(500);
  await shot('06-bag');
  await page.getByRole('tab', { name: /Explore/ }).click();
  await sleep(500);

  // --- tame ---------------------------------------------------------------
  const passive = ['pebblesnout', 'marshwaddle', 'binbeak'];
  const knockoutOk = ['brambleback', 'ditchrunner', 'leafwing', 'rustjaw', 'mosshorn'];
  const tamedSpecies = [];
  for (let attempt = 0; attempt < 12 && tamedSpecies.length < 2; attempt++) {
    const find = async () =>
      (await targets('creature-')).find((t) => {
        const sp = t.testid.slice(9);
        return !tamedSpecies.includes(sp) && (passive.includes(sp) || knockoutOk.includes(sp));
      }) ?? null;
    let t = await find();
    if (!t) {
      for (let k = 0; k < 6; k++) await tid(attempt % 2 ? 'walk-east' : 'walk-north').click();
      await sleep(3500);
      continue;
    }
    const species = t.testid.slice(9);
    log('heading to', species, t.dist + 'm');
    t = await walkTo(find);
    if (!t) continue;
    await press(t.el);
    await sleep(1200);
    if (!(await tid('leave-tame').count())) {
      log('tame did not open:', await toastText());
      continue;
    }
    await shot(`07-tame-${species}`);

    // knockout phase
    for (let i = 0; i < 60 && (await tid('fire').count()); i++) {
      // wait for the reticle to be near the middle
      for (let k = 0; k < 80; k++) {
        const left = await tid('reticle').evaluate((e) => parseFloat(e.style.left));
        if (Math.abs(left - 50) < 4) break;
        await sleep(10);
      }
      await tid('fire').click();
      await sleep(550);
      if (i === 0) await shot(`08-knockout-${species}`);
    }
    // feeding phase
    for (let i = 0; i < 40 && !(await tid('tamed-title').count()); i++) {
      if (!(await tid('feed').count())) break;
      if (await tid('feed').isDisabled()) {
        await sleep(300);
        continue;
      }
      if (await tid('watching').count()) {
        await sleep(150);
        continue;
      }
      await tid('feed').click();
      await sleep(500);
      if (i === 0) await shot(`09-feeding-${species}`);
    }
    if (await tid('tamed-title').count()) {
      await shot(`10-tamed-${species}`);
      await tid('nickname').fill(species === 'pebblesnout' ? 'Pebbles' : 'Buddy');
      await tid('tame-done').click();
      tamedSpecies.push(species);
      log('TAMED', species);
      await sleep(800);
    } else {
      log('tame failed for', species, await page.locator('body').innerText().then((s) => s.slice(0, 200)));
      if (await tid('leave-tame').count()) await tid('leave-tame').click();
      await sleep(500);
    }
  }

  await page.getByRole('tab', { name: /Creatures/ }).click();
  await sleep(800);
  await shot('11-creatures');
  await page.getByRole('tab', { name: /Survivor/ }).click();
  await sleep(500);
  await shot('12-profile');

  // Reload: progress must persist.
  await page.reload();
  await tid('survival-hud').waitFor({ timeout: 15000 });
  await page.getByRole('tab', { name: /Creatures/ }).click();
  await sleep(800);
  const persisted = await page.locator('[data-testid^="tamed-"]').count();

  log('tamed:', tamedSpecies.join(', ') || 'none', '| after reload:', persisted);
  log('errors:', errors.length ? errors.slice(0, 10).join('\n') : 'none');
  await browser.close();
  if (tamedSpecies.length === 0 || persisted !== tamedSpecies.length || errors.length) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
