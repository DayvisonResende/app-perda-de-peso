// Monta o app: src/index.html + src/css/*.css + src/js/*.js  →  dist/index.html (+ cópia de public/)
// Sem dependências. Os arquivos de src/js compartilham o mesmo escopo global, na ordem do nome (00-, 01-…).
//   node scripts/build.mjs          monta uma vez
//   node scripts/build.mjs --watch  remonta a cada mudança em src/ ou public/
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, cpSync, watch } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src'), PUB = join(ROOT, 'public'), DIST = join(ROOT, 'dist');

const read = (p) => readFileSync(p, 'utf8');
const parts = (dir, ext) => readdirSync(dir).filter((f) => f.endsWith(ext)).sort().map((f) => read(join(dir, f)));

export function build() {
  const t0 = Date.now();
  const tpl = read(join(SRC, 'index.html'));
  if (!tpl.includes('<!--@css-->') || !tpl.includes('<!--@js-->')) throw new Error('src/index.html precisa dos marcadores <!--@css--> e <!--@js-->');
  const css = parts(join(SRC, 'css'), '.css').join('');
  const js = parts(join(SRC, 'js'), '.js').join('');
  // erro de sintaxe aparece aqui, no build, e não no celular de quem usa
  new vm.Script(js, { filename: 'src/js (montado)' });
  new vm.Script(read(join(PUB, 'stickers.js')), { filename: 'public/stickers.js' });
  new vm.Script(read(join(PUB, 'sw.js')), { filename: 'public/sw.js' });
  const html = tpl.replace('<!--@css-->', () => css).replace('<!--@js-->', () => js);
  rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  cpSync(PUB, DIST, { recursive: true });
  writeFileSync(join(DIST, 'index.html'), html);
  console.log(`build ok: dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB) em ${Date.now() - t0} ms`);
  return html;
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  try { build(); } catch (e) { console.error('build falhou:', e.message); process.exit(1); }
  if (process.argv.includes('--watch')) {
    let t = null;
    const again = () => { clearTimeout(t); t = setTimeout(() => { try { build(); } catch (e) { console.error('build falhou:', e.message); } }, 120); };
    for (const dir of [SRC, PUB]) watch(dir, { recursive: true }, again);
    console.log('observando src/ e public/…');
  }
}
