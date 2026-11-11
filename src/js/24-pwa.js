/* ===================== PWA (instalar e usar offline) ===================== */
const PWA = {
  prompt: null,
  installed: () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true,
  isIOS: () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  canRegister: () => 'serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname)),
  init() {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); this.prompt = e; if (ui.tab === 'perfil') App.render(); });
    window.addEventListener('appinstalled', () => { this.prompt = null; App.toast('Brius instalado'); if (ui.tab === 'perfil') App.render(); });
    if (this.canRegister()) window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  },
  platform() {
    const ua = navigator.userAgent;
    if (this.isIOS()) return /CriOS|FxiOS|EdgiOS/.test(ua) ? 'ios-other' : 'ios';
    if (/Android/i.test(ua)) return /SamsungBrowser/.test(ua) ? 'samsung' : /Firefox/.test(ua) ? 'android-firefox' : 'android';
    if (/Firefox/.test(ua)) return 'desktop-firefox';
    if (/Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua)) return 'mac-safari';
    return 'desktop';
  },
  panel() {
    if (this.installed()) return `<section class="panel"><div class="ph"><h2>App instalado</h2></div><p class="muted" style="font-size:13.5px">Você está usando o Brius instalado. Ele abre pela tela inicial e funciona sem internet.</p></section>`;
    return `<section class="panel"><div class="ph"><h2>Instalar no aparelho</h2></div>
      <p class="muted" style="font-size:13.5px">Abra o Brius direto da tela inicial, em tela cheia, e use mesmo sem internet.</p>
      <button class="btn btn-primary btn-sm mt12" data-a="pwa-install">${ic('download', 'sm')} Instalar app</button></section>`;
  },
  steps() {
    const st = (arr) => `<ol class="steps">${arr.map((x) => `<li><span>${x}</span></li>`).join('')}</ol>`;
    if (!this.canRegister()) return `<p class="muted">Para instalar, o Brius precisa estar aberto pelo endereço publicado na internet (começando com <b>https://</b>). Aberto como arquivo no computador ou dentro de outro app, o navegador não permite a instalação.</p>
      <p class="muted mt12">Abra o link do Brius no navegador do celular e toque em <b>Instalar app</b> de novo.</p>`;
    return {
      ios: st(['Toque no botão <b>Compartilhar</b> (o quadrado com a seta para cima) na barra do Safari.', 'Role a lista e toque em <b>Adicionar à Tela de Início</b>.', 'Confirme em <b>Adicionar</b>. O ícone do Brius aparece na tela inicial.']),
      'ios-other': st(['No iPhone, a instalação só funciona pelo <b>Safari</b>.', 'Copie o endereço desta página e abra no Safari.', 'Toque em <b>Compartilhar</b> → <b>Adicionar à Tela de Início</b>.']),
      android: st(['Toque no menu <b>⋮</b> no canto de cima do Chrome.', 'Toque em <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>).', 'Confirme em <b>Instalar</b>.']),
      samsung: st(['Toque no menu <b>≡</b> na barra de baixo.', 'Toque em <b>Adicionar página a</b> → <b>Tela inicial</b>.', 'Confirme em <b>Adicionar</b>.']),
      'android-firefox': st(['Toque no menu <b>⋮</b>.', 'Toque em <b>Instalar</b> (ou <b>Adicionar à tela inicial</b>).', 'Confirme em <b>Adicionar</b>.']),
      'desktop-firefox': `<p class="muted">O Firefox para computador não instala apps. Abra o Brius no <b>Chrome</b> ou no <b>Edge</b> e toque em <b>Instalar app</b> de novo, ou use o ícone de instalar na barra de endereço.</p>`,
      'mac-safari': st(['No menu <b>Arquivo</b> do Safari, escolha <b>Adicionar ao Dock</b>.', 'Confirme em <b>Adicionar</b>.']),
      desktop: st(['Clique no ícone de <b>instalar</b> na ponta direita da barra de endereço (um monitor com uma seta).', 'Ou abra o menu <b>⋮</b> → <b>Transmitir, salvar e compartilhar</b> → <b>Instalar página como app</b>.', 'Confirme em <b>Instalar</b>.']),
    }[this.platform()];
  },
};
A['pwa-install'] = async () => {
  if (PWA.prompt) {
    PWA.prompt.prompt();
    const { outcome } = await PWA.prompt.userChoice.catch(() => ({}));
    PWA.prompt = null; if (outcome !== 'accepted') App.render();
    return;
  }
  Sheet.open({ label: 'Instalar app', render: () => `${sheetHead('Instalar o Brius', 'Leva menos de um minuto')}
    <div class="sheet-b">${PWA.steps()}</div>
    <div class="sheet-f"><button class="btn btn-primary grow" data-a="sheet-close">Entendi</button></div>` });
};
PWA.init();
setTimeout(() => loadStickers(), 1500);

// Sem zoom: o iPhone ignora user-scalable=no, então bloqueia o gesto de pinça aqui
['gesturestart', 'gesturechange', 'gestureend'].forEach((t) => document.addEventListener(t, (e) => e.preventDefault(), { passive: false }));
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1 || (e.scale && e.scale !== 1)) e.preventDefault(); }, { passive: false });

App.init();
