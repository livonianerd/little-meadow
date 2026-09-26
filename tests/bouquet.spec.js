import { test, expect } from '@playwright/test';

for (const mobile of [false, true]) {
  test(`Mom's bouquet grows and survives refresh (${mobile ? 'touch' : 'desktop'})`, async ({ browser }) => {
    test.setTimeout(120000);
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, hasTouch: mobile, isMobile: mobile });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/?test');
    await page.evaluate(() => { window.__meadow.renderer.setPixelRatio(0.5); });
    await page.locator('#start').click();
    await expect(page.locator('#menu-button')).toBeVisible();
    await page.evaluate(() => {
      const g = window.__meadow;
      g.inventory.flowers = 22;
      g.player.group.position.copy(g.mom.position);
    });
    for (const total of [1, 3, 6, 11, 21, 22]) {
      await page.evaluate(target => {
        const g = window.__meadow;
        const remaining = target - 1 - g.score.flowersGiven;
        for (let i = 0; i < remaining; i++) { g.player.actionTime = 0; g.interact(); }
      }, total);
      await page.evaluate(() => { window.__meadow.player.actionTime = 0; });
      if (mobile) await page.locator('#touch-action').tap();
      else await page.keyboard.press('e');
      await expect(page.locator('#kindness')).toHaveText(String(total * 10));
      const state = await page.evaluate(() => {
        const g = window.__meadow, b = g.mom.bouquet;
        return { stage: b.stage, visible: b.group.visible, attached: b.group.parent === g.mom.arms[0], happy: g.mom.happyTime > 0, flowers: g.inventory.flowers, saved: JSON.parse(localStorage.getItem('little-meadow:save:v1')).flowersGiven };
      });
      expect(state).toEqual({ stage: total < 3 ? 1 : total < 6 ? 2 : total < 11 ? 3 : total < 21 ? 4 : 5, visible: true, attached: true, happy: true, flowers: 22 - total, saved: total });
    }
    // Idle animation and same-stage gifts must retain geometry; rendering is bounded.
    expect(await page.evaluate(() => {
      const g = window.__meadow, mesh = g.mom.bouquet.mesh;
      g.mom.update(4, 10); g.mom.updateBouquet(1000);
      return { visible: g.mom.bouquet.group.visible, same: mesh === g.mom.bouquet.mesh, happy: g.mom.happyTime, children: g.mom.bouquet.group.children.length };
    })).toEqual({ visible: true, same: true, happy: 0, children: 1 });
    await page.reload();
    expect(await page.evaluate(() => ({ total: window.__meadow.score.flowersGiven, stage: window.__meadow.mom.bouquet.stage, visible: window.__meadow.mom.bouquet.group.visible }))).toEqual({ total: 22, stage: 5, visible: true });
    await page.locator('#start').click();
    await page.evaluate(() => window.__meadow.reset());
    expect(await page.evaluate(() => ({ stage: window.__meadow.mom.bouquet.stage, total: JSON.parse(localStorage.getItem('little-meadow:save:v1')).flowersGiven }))).toEqual({ stage: 0, total: 0 });
    expect(errors).toEqual([]);
    await context.close();
  });
}
