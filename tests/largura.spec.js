// Nenhuma tela pode ficar mais larga que o celular: no app instalado, isso faz o
// navegador afastar a página e a barra de baixo sai da tela.
import { test, expect, openApp, treinoPronto } from './helpers.js';

const comCardapio = () => { Store.core.plan = { days: clone(ORIGINAL_PLAN), source: 'original', at: Date.now() }; Store.core.stk = null; newStickers(); };
const telas = [['hoje'], ['cardapio', 'semana'], ['cardapio', 'compras'], ['cardapio', 'preparo'], ['treino'], ['progresso'], ['perfil']];

for (const largura of [320, 360, 375]) {
  test.describe(`celular de ${largura}px`, () => {
    test.use({ viewport: { width: largura, height: 780 }, isMobile: true, hasTouch: true });

    test('cadastro cabe na tela', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.onb');
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(largura);
    });

    test('todas as telas cabem na largura', async ({ page }) => {
      await openApp(page, { setup: [treinoPronto, comCardapio] });
      const largas = [];
      for (const [tab, sub] of telas) {
        const w = await page.evaluate(([tab, sub]) => { Sheet.close(true); ui.tab = tab; if (sub) ui.planTab = sub; App.render(); return document.documentElement.scrollWidth; }, [tab, sub]);
        if (w > largura) largas.push(`${tab}${sub ? '/' + sub : ''}: ${w}px`);
      }
      // sessão de treino aberta
      await page.evaluate(() => { ui.tab = 'treino'; App.render(); A['tr-start']({ dataset: { i: '0' } }); });
      const wTreino = await page.evaluate(() => document.documentElement.scrollWidth);
      if (wTreino > largura) largas.push(`sessão de treino: ${wTreino}px`);
      expect(largas, 'telas mais largas que o celular').toEqual([]);
    });
  });
}
