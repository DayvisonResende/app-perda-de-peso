import { test, expect, openApp, treinoPronto } from './helpers.js';

test('cadastro aparece para quem é novo', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#view')).toContainText(/Vamos|cadastro|Começar|Bem-vind/i, { timeout: 8000 });
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
