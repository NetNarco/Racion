/**
 * Собирает превью всех иллюстраций блюд в один HTML — удобно смотреть глазами.
 * Запуск: node tools/make-dish-preview.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { RECIPES } from '../assets/js/recipes.js';
import { dishArt } from '../assets/js/dishart.js';

const out = path.resolve(import.meta.dirname, '..', '_preview', 'dishes.html');
fs.mkdirSync(path.dirname(out), { recursive: true });

const cards = RECIPES.map(
  (r) => `<figure>
  <div class="art">${dishArt(r, 220)}</div>
  <figcaption><b>${r.name}</b><span>${r.meal} · ${r.id}</span></figcaption>
</figure>`
).join('\n');

fs.writeFileSync(
  out,
  `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Иллюстрации блюд</title>
<style>
  body{font-family:system-ui,sans-serif;background:#FBF6EF;margin:0;padding:28px}
  h1{font-size:20px;margin:0 0 18px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
  figure{margin:0;background:#fff;border:1.5px solid #EFE6D8;border-radius:18px;overflow:hidden}
  .art svg{display:block;width:100%;height:auto}
  figcaption{padding:10px 12px 13px;display:flex;flex-direction:column;gap:3px}
  figcaption b{font-size:13px;line-height:1.25}
  figcaption span{font-size:11px;color:#9A8C7C}
</style></head><body>
<h1>Иллюстрации блюд — ${RECIPES.length} шт.</h1>
<div class="grid">${cards}</div>
</body></html>`
);
console.log('готово:', out);
