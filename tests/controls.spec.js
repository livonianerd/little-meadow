import { test, expect as baseExpect } from '@playwright/test';

// Software rendering can advance the capped game clock slowly on CI hosts.
const expect = baseExpect.configure({ timeout: 15000 });
async function start(page) {
  await page.goto('/?test');
  // Keep software-rendered browser tests responsive, as in the bouquet suite.
  await page.evaluate(() => {
    window.__meadow.renderer.setPixelRatio(0.5);
    window.__meadow.renderer.shadowMap.enabled = false;
  });
  await page.locator('#start').click();
  await expect(page.locator('#menu-button')).toBeVisible();
}
async function state(page) {
  return page.evaluate(() => {
    const g = window.__meadow;
    return { speed: g.player.speed, yaw: g.controller.yaw, distance: g.controller.distance, x: g.input.moveX, y: g.input.moveY };
  });
}
async function nearby(page, kind) {
  await page.evaluate(kind => {
    const g = window.__meadow;
    const object = kind === 'flowers' ? g.flowers.items[0] : kind === 'acorns' ? g.nuts.items[0] : kind === 'mom' ? g.mom : g.squirrels[0];
    g.controller.clear(); g.player.actionTime = 0;
    g.player.group.position.copy(object.position);
    if (kind === 'squirrel') { object.state = 'idle'; object.remaining = 30; }
  }, kind);
}
test('desktop movement, jogging, camera, zoom and E remain available', async ({ page }) => {
  await start(page);
  await page.keyboard.down('w');
  await expect.poll(async () => (await state(page)).speed).toBeGreaterThan(4);
  await page.keyboard.down('Shift');
  await expect.poll(async () => (await state(page)).speed).toBeGreaterThan(7);
  await page.keyboard.up('Shift'); await page.keyboard.up('w');
  await expect.poll(async () => (await state(page)).speed).toBeLessThan(.1);
  await page.mouse.move(600, 300); await page.mouse.down(); await page.mouse.move(700, 330); await page.mouse.up();
  await expect.poll(async () => (await state(page)).yaw).toBeLessThan(-.4);
  await page.mouse.wheel(0, 200);
  await expect.poll(async () => (await state(page)).distance).toBeGreaterThan(14);
  await nearby(page, 'flowers'); await page.keyboard.press('e');
  await expect(page.locator('#flowers')).toHaveText('1');
});
test('phone touch movement, independent camera, pinch, gifts, menus, save and rotation', async ({ browser }) => {
  test.setTimeout(120000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await start(page); await expect(page.locator('#joystick')).toBeVisible();
  const cdp = await context.newCDPSession(page);
  const touch = (type, touchPoints) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints });
  const rect = await page.locator('#joystick').boundingBox();
  const left = { id: 1, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  await touch('touchStart', [left]);
  const walking = { ...left, y: left.y - 22 };
  await touch('touchMove', [walking]);
  await expect.poll(async () => (await state(page)).speed).toBeGreaterThan(1);
  expect((await state(page)).speed).toBeLessThan(4);
  const right = { id: 2, x: 280, y: 370 };
  await touch('touchStart', [walking, right]);
  await touch('touchMove', [walking, { ...right, x: 340 }]);
  await expect.poll(async () => (await state(page)).yaw).toBeLessThan(-.2);
  // CDP touchEnd lists the fingers being released, not those remaining down.
  await touch('touchEnd', [{ ...right, x: 340 }]);
  expect((await state(page)).y).toBeLessThan(0);
  // Test each quadrant and clamping at the outer edge.
  for (const [dx, dy] of [[90, 90], [-90, 90], [-90, -90], [90, -90]]) {
    await touch('touchMove', [{ ...left, x: left.x + dx, y: left.y + dy }]);
    await expect.poll(async () => {
      const { x, y } = await state(page);
      return [Math.sign(x), Math.sign(y)];
    }).toEqual([Math.sign(dx), Math.sign(dy)]);
  }
  await touch('touchCancel', []);
  await expect.poll(async () => (await state(page)).speed).toBeLessThan(.1);
  await touch('touchStart', [{ id: 2, x: 180, y: 300 }, { id: 3, x: 280, y: 300 }]);
  await touch('touchMove', [{ id: 2, x: 130, y: 300 }, { id: 3, x: 330, y: 300 }]);
  await touch('touchEnd', []);
  await expect.poll(async () => (await state(page)).distance).toBeLessThan(12);
  for (const [kind, label, counter, value] of [
    ['flowers', /Pick.*flower/i, 'flowers', '1'], ['acorns', /Pick.*acorn/i, 'acorns', '1'],
    ['mom', /Give flower/, 'kindness', '10'], ['squirrel', /Give acorn/, 'kindness', '15'],
  ]) {
    await nearby(page, kind);
    await expect(page.locator('#touch-action')).toHaveText(label);
    await page.locator('#touch-action').tap();
    await expect(page.locator(`#${counter}`)).toHaveText(value);
  }
  await page.locator('#menu-button').tap(); await expect(page.locator('#menu-overlay')).toBeVisible();
  await page.locator('#about-button').tap(); await expect(page.locator('#about-panel')).toBeVisible();
  await page.locator('#about-panel .back-button').tap(); await page.locator('#resume').tap();
  for (const viewport of [{ width: 844, height: 390 }, { width: 320, height: 568 }, { width: 1024, height: 768 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(() => page.evaluate(() => Math.round(window.__meadow.camera.aspect * 100))).toBe(Math.round(viewport.width / viewport.height * 100));
    const stick = await page.locator('#joystick').boundingBox(), action = await page.locator('#touch-action').boundingBox();
    expect(stick.x + stick.width).toBeLessThan(action.x);
    expect(action.y + action.height).toBeLessThanOrEqual(viewport.height);
  }
  expect(await page.evaluate(() => ({ y: scrollY, overflow: getComputedStyle(document.body).overflow, touch: getComputedStyle(document.querySelector('canvas')).touchAction })) ).toEqual({ y: 0, overflow: 'hidden', touch: 'none' });
  await page.reload(); await page.locator('#start').tap(); await expect(page.locator('#kindness')).toHaveText('15');
  expect(errors).toEqual([]); await context.close();
});
