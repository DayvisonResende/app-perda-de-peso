import { test, expect, openApp, closeSheet } from './helpers.js';

test('registrar medidas, validar, excluir com desfazer e manter após recarregar', async ({ page }) => {
  await openApp(page, { tab: 'progresso' });
  await page.locator('.panel [data-a=meas-open]').first().click();
  await page.fill('#ms-waist', '95,5'); await page.fill('#ms-neck', '39');
  await page.click('[data-a=meas-save]');
  await expect(page.locator('#toast')).toContainText('Medidas salvas');
  expect(await page.evaluate(() => Store.p.waist)).toBe(95.5);

  // validação: vazio e valor absurdo
  await page.locator('.panel [data-a=meas-open]').first().click();
  await page.evaluate(() => document.querySelectorAll('[id^=ms-]:not(#ms-date)').forEach((i) => (i.value = '')));
  await page.click('[data-a=meas-save]');
  await expect(page.locator('#toast')).toContainText('Preencha pelo menos uma medida');
  await page.fill('#ms-waist', '950'); await page.click('[data-a=meas-save]');
  await expect(page.locator('#toast')).toContainText('Confira cintura');
  await closeSheet(page);

  // excluir e desfazer
  await page.evaluate(() => measOpen(todayISO()));
  await page.click('[data-a=meas-del]');
  expect(await page.evaluate(() => Store.measures().length)).toBe(0);
  await page.click('#toast [data-a=undo]');
  expect(await page.evaluate(() => Store.measures().length)).toBe(1);

  await page.reload(); await page.waitForFunction(() => typeof Store !== 'undefined' && !!Store.core);
  expect(await page.evaluate(() => Store.measures().length)).toBe(1);
});

test('aviso de balança mascarada quando o peso para e a cintura cai', async ({ page }) => {
  await openApp(page, { tab: 'progresso', setup: () => {
    Store.core.weights = [83, 82.9, 82.8, 82.8, 82.7].map((w, i) => ({ id: 'w' + i, date: addDays(todayISO(), -28 + i * 7), weight: w, waist: null }));
    Store.core.measures = [{ id: 'a', date: addDays(todayISO(), -28), waist: 97 }, { id: 'b', date: addDays(todayISO(), -7), waist: 94.5 }];
  } });
  await expect(page.locator('#view')).toContainText('Balança mascarada');
});
