import { test, expect, openApp, treinoPronto, closeSheet } from './helpers.js';

const desafioHoje = [treinoPronto, () => { const o = Tr.boss.bind(Tr); Tr.boss = () => ({ ...o(), available: true }); }];

test('desistir do desafio: o app provoca e o cartão guarda a provocação', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: desafioHoje });
  await page.click('[data-a=tr-boss]');
  const s = page.locator('[data-in=tr-set][data-x="0"][data-j="0"]'); await s.fill('5'); await s.press('Tab');
  const total = await page.evaluate(() => bossHP(Tr.s().cur).total);
  await expect(page.locator('[data-live=boss-hp]')).toHaveText(new Intl.NumberFormat('pt-BR').format(total - 5));
  await page.click('[data-a=tr-cancel]');
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('BioTrack:');
  await page.click('.scrim:not(.out) [data-a=confirm-ok]');
  await expect(page.locator('#toast')).toContainText('BioTrack:');
  await expect(page.locator('.boss-taunt')).toContainText('você desistiu 1×');
});

test('vencer o desafio dá +300 XP e não mexe no rodízio A/B', async ({ page }) => {
  await openApp(page, { tab: 'treino', setup: desafioHoje });
  const xp0 = await page.evaluate(() => Tr.xp());
  await page.click('[data-a=tr-boss]');
  await page.evaluate(() => { const c = Tr.s().cur; c.items.forEach((it) => (it.sets = [it.target])); Store.saveCore(); App.render(); });
  await expect(page.locator('[data-live=boss-hp]')).toHaveText('0');
  await page.click('[data-a=tr-finish]');
  await expect(page.locator('.scrim:not(.out) .sheet')).toContainText('Desafio vencido');
  await closeSheet(page);
  const r = await page.evaluate(() => ({ xp: Tr.xp(), next: Tr.s().next, venceu: Tr.boss().defeated }));
  expect(r.xp - xp0).toBeGreaterThanOrEqual(300);
  expect(r).toMatchObject({ next: 0, venceu: true });
});
