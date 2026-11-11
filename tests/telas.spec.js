import { test, expect, openApp, treinoPronto } from './helpers.js';

test('cadastro: começa vazio, aponta o campo errado e cria o perfil com o que foi digitado', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.onb h1')).toHaveText('Bem-vindo ao Brius', { timeout: 8000 });
  for (const id of ['name', 'age', 'height', 'weight', 'goal', 'waist', 'neck']) await expect(page.locator('#ob-' + id)).toHaveValue('');
  await expect(page.locator('#view')).not.toContainText('João');

  await page.click('[data-a=ob-start]');
  await expect(page.locator('#toast')).toContainText('Selecione o sexo');
  await expect(page.locator('#ob-sex')).toHaveAttribute('aria-invalid', 'true');

  await page.selectOption('#ob-sex', 'F');
  await page.fill('#ob-name', 'Ana'); await page.fill('#ob-age', '34'); await page.fill('#ob-height', '163');
  await page.fill('#ob-weight', '74,5'); await page.fill('#ob-goal', '80');
  await page.click('[data-a=ob-start]');
  await expect(page.locator('#toast')).toContainText('menor que o peso de hoje');
  await expect(page.locator('#ob-goal')).toBeFocused();

  await page.fill('#ob-goal', '65');
  await page.click('[data-a=ob-start]');
  await expect(page.locator('#view h1').first()).toContainText('Ana');
  expect(await page.evaluate(() => { const p = Store.p; return [p.name, p.sex, p.age, p.height, p.weight, p.goalWeight, p.waist]; })).toEqual(['Ana', 'F', 34, 163, 74.5, 65, null]);
});

for (const [tab, titulo] of [['hoje', /Boa|Bom|Registro/], ['cardapio', 'Cardápio da semana'], ['treino', 'Treino'], ['progresso', 'Progresso'], ['perfil', 'Perfil e metas']]) {
  test(`aba ${tab} abre sem erro`, async ({ page }) => {
    await openApp(page, { tab, setup: treinoPronto });
    await expect(page.locator('#view h1').first()).toContainText(titulo);
  });
}

test('abas do cardápio: semana, compras e preparo', async ({ page }) => {
  await openApp(page, { tab: 'cardapio' });
  for (const t of ['compras', 'preparo', 'semana']) {
    await page.click(`[data-a=ptab][data-t=${t}]`);
    await expect(page.locator(`[data-a=ptab][data-t=${t}]`)).toHaveAttribute('aria-pressed', 'true');
  }
});

test('painéis da tela Hoje abrem e fecham', async ({ page }) => {
  await openApp(page);
  const fold = page.locator('[data-fold=balanco]');
  const was = await fold.evaluate((e) => e.classList.contains('open'));
  await fold.locator('[data-a=fold]').click();
  await expect(fold).toHaveClass(was ? /^(?!.*\bopen\b)/ : /\bopen\b/);
});

test('quem usava o app como BioTrack abre o Brius com os dados intactos', async ({ page }) => {
  await openApp(page);
  // simula um aparelho com dados só na chave antiga
  await page.evaluate(() => { const v = localStorage.getItem('brius:v4'); localStorage.setItem('biotrack:v4', v); localStorage.removeItem('brius:v4'); });
  await page.reload();
  await page.waitForFunction(() => typeof Store !== 'undefined' && !!Store.core);
  expect(await page.evaluate(() => [Store.p.name, !!localStorage.getItem('brius:v4'), !!localStorage.getItem('biotrack:v4')])).toEqual(['Teste', true, true]);
  await expect(page.locator('.brand').first()).toContainText('Brius');
});
