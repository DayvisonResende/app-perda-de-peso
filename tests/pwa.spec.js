import { test, expect } from './helpers.js';

test('manifest e ícones respondem', async ({ request }) => {
  const man = await (await request.get('/manifest.webmanifest')).json();
  expect(man.short_name).toBe('BioTrack');
  for (const i of man.icons) expect((await request.get('/' + i.src)).status()).toBe(200);
});

test('service worker guarda o app e ele abre sem internet', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const cached = await page.evaluate(async () => (await caches.keys()).length && (await (await caches.open((await caches.keys())[0])).keys()).map((r) => new URL(r.url).pathname));
  expect(cached).toEqual(expect.arrayContaining(['/index.html', '/stickers.js']));
  await context.setOffline(true);
  await page.reload();
  await expect(page).toHaveTitle(/BioTrack/);
  await context.setOffline(false);
});

test('sem zoom: viewport e bloqueio de pinça', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name=viewport]')).toHaveAttribute('content', /user-scalable=no/);
  const prevented = await page.evaluate(() => { const t = [0, 1].map((i) => new Touch({ identifier: i, target: document.body, clientX: 100 + i * 40, clientY: 200 })); const e = new TouchEvent('touchmove', { touches: t, cancelable: true, bubbles: true }); document.body.dispatchEvent(e); return e.defaultPrevented; });
  expect(prevented).toBe(true);
});
