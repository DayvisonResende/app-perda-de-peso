import { test, expect, openApp, treinoPronto, closeSheet } from './helpers.js';

const usuarioAntigo = [treinoPronto, () => {
  Tr.s().logs = [{ id: 'a', date: addDays(todayISO(), -3), name: 'A', min: 40, kcal: 200, items: [{ fam: 'core', step: 'prancha', sets: [35] }, { fam: 'flexao', step: 'flex', sets: [12] }] }];
  delete Store.core.stk;
}];

test('quem já usava recebe os adesivos de uma vez, com aviso', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: usuarioAntigo });
  await expect(page.locator('#toast')).toContainText(/Você já tinha \d+ adesivos?/, { timeout: 6000 });
  expect(await page.evaluate(() => Object.keys(Store.core.stk.seen))).toEqual(expect.arrayContaining(['s1', 's2', 's4', 's6']));
});

test('álbum aparece sem rolar e o selo do nível abre o álbum', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: usuarioAntigo });
  await page.waitForFunction(() => window.BT_STICKERS);
  await expect(page.locator('[data-a=album-open].btn')).toBeInViewport();
  await page.click('.jr-badge');
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('Álbum de adesivos');
  await page.click('[data-a=album-tab][data-v=hab]');
  await expect(page.locator('.album-grid .stk').first()).toBeVisible();
});

test('teste avulso de muscle-up libera o adesivo 21', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: usuarioAntigo });
  await page.waitForFunction(() => window.BT_STICKERS && Store.core.stk);
  await page.evaluate(() => A['stk-open']({ dataset: { k: 's21' } }));
  await page.click('.scrim:not(.out) [data-a=tr-test]');
  await page.fill('#tt-v', '1'); await page.click('[data-a=tr-test-save]');
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('MUSCLE-UP');
  expect(await page.evaluate(() => !!Store.core.stk.seen.s21)).toBe(true);
});

test('adesivo de hábito chega fora do treino (primeiras medidas)', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: usuarioAntigo });
  await page.waitForFunction(() => Store.core.stk);
  await closeSheet(page);
  await page.evaluate(() => { Store.core.measures = [{ id: 'm', date: todayISO(), waist: 95 }]; Store.saveCore(); App.go('hoje'); App.render(); });
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('Fita na mão', { timeout: 6000 });
});
