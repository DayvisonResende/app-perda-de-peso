# Brius

Dieta, cardápio, treino de calistenia e progresso, num PWA que funciona offline.

## Comandos

| Comando | O que faz |
|---|---|
| `npm install` | Instala o executor de testes (Playwright). O app em si não tem dependências. |
| `npm run dev` | Monta o app e abre em http://localhost:5173, remontando a cada arquivo salvo. |
| `npm run build` | Gera `dist/`, a pasta que vai para o servidor. |
| `npm test` | Monta e roda os 39 testes de ponta a ponta no Chrome do sistema. |

Para testar com outro navegador: `PW_CHANNEL=chromium npx playwright install chromium && npm test`.

## Estrutura

```
src/
  index.html        esqueleto da página, com os marcadores <!--@css--> e <!--@js-->
  css/NN-*.css      estilos, na ordem do número
  js/NN-*.js        código do app, na ordem do número (todos compartilham o mesmo escopo global)
public/             vai para dist/ como está: service worker, manifest, ícones, stickers.js
scripts/
  build.mjs         junta src/ em dist/index.html e confere a sintaxe de tudo antes
  serve.mjs         servidor local de dist/
tests/              testes Playwright (telas, calorias, medidas, treino, desafio, adesivos, PWA)
design/             arquivos-fonte de arte (ex.: adesivos de habilidade criados no Claude web)
```

### Como os arquivos de `src/js` funcionam juntos

O build cola todos os arquivos em ordem dentro de um único `<script>`, como era o `index.html` original.
Por isso uma função declarada em `05-alimentos.js` pode ser usada em `14-hoje.js` sem `import`.
Ao criar um arquivo novo, escolha o número pela ordem em que ele precisa ser lido.

### Publicar uma versão nova

1. `npm test`
2. Se mudou algo em `public/` (ex.: `stickers.js`), troque `VERSION` em `public/sw.js` para os celulares baixarem a versão nova.
3. Envie a pasta `dist/` para o servidor (HTTPS é obrigatório para instalar como app).

## Fontes

- Programação de treino baseada em *Complete Calisthenics* (Ashley Kalym) e *Bodyweight Strength Training Anatomy* (Bret Contreras). Os livros não fazem parte do repositório.
- Adesivos de nível: desenho próprio do app. Adesivos de habilidade: arte criada no Claude web (`design/`). Fonte Barlow Condensed sob licença SIL OFL.
