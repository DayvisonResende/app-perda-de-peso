// Utilitários dos testes: perfil de exemplo, abrir abas e falhar em qualquer erro de JavaScript.
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await use(page);
    expect(errors, 'erros de JavaScript na página').toEqual([]);
  },
});
export { expect };

/** Abre o app com um perfil pronto (pula o cadastro). `setup`: função (ou lista de funções) que roda dentro da página antes do primeiro render.
    Cada função é enviada sozinha para a página: ela só enxerga o que existe no app, não outras funções deste arquivo. */
export async function openApp(page, { tab = 'hoje', setup } = {}) {
  await page.goto('/');
  await page.waitForFunction(() => typeof newCore === 'function');
  await page.evaluate(({ tab, setup }) => {
    Store.s.core = newCore({ name: 'Teste', sex: 'M', age: 30, height: 175, weight: 82, goalWeight: 75, activity: 'sedentario', pace: 0.5, waist: null, neck: null });
    for (const src of setup) new Function(src)();
    Store.saveCore(); ui.booting = false; ui.tab = tab; App.render();
  }, { tab, setup: [setup].flat().filter(Boolean).map((f) => `(${f.toString()})()`) });
}

/** Treino já configurado (barra disponível na rua), sem passar pela montagem. */
export const treinoPronto = () => {
  const t = Tr.s();
  Object.assign(t, { setup: true, eq: { barra: true, paralela: true } });
  t.lvl = { flexao: 'flex_joelhos', barra: 'chinup', agach: 'agach', core: 'canoa', posterior: 'ponte', remada: 'remada', paralela: 'merg_banco', ombro: 'pike' };
  t.unl = { ...t.lvl };
};

export const sheetText = (page) => page.locator('.scrim:not(.out) .sheet').innerText();
export const closeSheet = (page) => page.evaluate(() => Sheet.close(true));
