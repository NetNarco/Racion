/**
 * Сборка одного файла: складываем все ES-модули в один классический скрипт
 * и встраиваем React, CSS, шрифты и логотипы прямо в HTML.
 *
 * Так приложение открывается двойным щелчком по файлу — без сервера,
 * без сборщика и без интернета.
 *
 * Запуск: node build.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = import.meta.dirname;
const OUT_DIR = path.join(ROOT, 'dist');
const OUT = path.join(OUT_DIR, 'racion-besplatno.html');

// Порядок важен: зависимости идут раньше зависимых модулей.
const MODULES = [
  'assets/js/products.js',
  'assets/js/recipes.js',
  'assets/js/dishart.js',
  'assets/js/plan.js',
  'assets/js/ui.js',
  'assets/js/screens.js',
  'assets/js/result.js',
  'assets/js/app.js',
];

const NAMESPACE = (file) => {
  const base = path.basename(file, '.js');
  return base.replace(/[^A-Za-z0-9_]/g, '_') + 'NS';
};

/** Убираем export-префиксы (имена остаются в области видимости модуля). */
function stripExports(src) {
  return src
    .replace(/^\s*export\s+(const|let|var|function|class)\b/gm, '$1')
    .replace(/^\s*export\s*\{[^}]*\};?[ \t]*$/gm, '')
    .replace(/^\s*export\s+default\s+/gm, 'var __default = ');
}

/**
 * Перенос строки сразу после «?» или «:» делает из тернарника метку и ломает
 * разбор внутри списка аргументов. Схлопываем такие пары в одну строку.
 */
function joinTernaryLines(src) {
  let out = src;
  for (let i = 0; i < 8; i++) {
    const next = out.replace(/(\?|:)[ \t]*\r?\n[ \t]*(\S)/g, '$1 $2');
    if (next === out) break;
    out = next;
  }
  return out;
}

/** Собираем имена, которые модуль отдаёт наружу. */
function collectExports(src) {
  const names = new Set();
  const reDecl = /^\s*export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/gm;
  let m;
  while ((m = reDecl.exec(src))) names.add(m[1]);
  const reList = /^\s*export\s*\{([^}]*)\};?[ \t]*$/gm;
  while ((m = reList.exec(src))) {
    for (const part of m[1].split(',')) {
      const t = part.trim();
      if (!t) continue;
      const as = /\s+as\s+/.test(t) ? t.split(/\s+as\s+/)[1].trim() : t;
      names.add(as);
    }
  }
  return [...names];
}

/** Превращаем статические import в разбор из пространств имён модулей. */
function rewriteImports(src, file) {
  const deps = [];
  let out = src.replace(
    /^[ \t]*import\s+([\s\S]*?)\s+from\s+['"]\.\/([\w.-]+)\.js['"];?[ \t]*$/gm,
    (full, clause, dep) => {
      const ns = NAMESPACE(dep + '.js');
      if (/^\*\s+as\s+/.test(clause.trim())) {
        return `  const ${clause.trim().replace(/^\*\s+as\s+/, '')} = ${ns}.default || ${ns};`;
      }
      const braces = clause.match(/\{([\s\S]*)\}/);
      if (!braces) return '';
      const spec = braces[1]
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const [from, to] = p.split(/\s+as\s+/).map((x) => x.trim());
          return to ? `${from}: ${to}` : from;
        })
        .join(', ');
      deps.push(dep);
      return `  const { ${spec} } = ${ns};`;
    }
  );
  // На случай import без from (побочный эффект) — просто убираем.
  out = out.replace(/^[ \t]*import\s+['"][^'"]+['"];?[ \t]*$/gm, '');
  return { code: out, deps };
}

function read(p) {
  return fs.readFileSync(path.join(ROOT, p), 'utf8');
}
function dataUri(file, mime) {
  return `data:${mime};base64,${fs.readFileSync(path.join(ROOT, file)).toString('base64')}`;
}

const namespaces = {};
const seenNames = new Map();
for (const file of MODULES) {
  const src = read(file);
  const ns = NAMESPACE(file);
  const exportsList = collectExports(src);
  for (const name of exportsList) {
    if (seenNames.has(name) && seenNames.get(name) !== file) {
      throw new Error(
        `Имя «${name}» объявлено и в ${seenNames.get(name)}, и в ${file}: в сборке одного файла это конфликт. Переименуйте одно из них.`
      );
    }
    seenNames.set(name, file);
  }
  const { code } = rewriteImports(joinTernaryLines(stripExports(src)), file);
  namespaces[ns] = { file, code, exports: exportsList };
}

// Диагностика: проверим, что каждое используемое имя импорта реально экспортируется.
const problems = [];
for (const [ns, mod] of Object.entries(namespaces)) {
  for (const name of mod.exports) {
    if (!new RegExp(`\\b${name}\\b`).test(mod.code)) {
      problems.push(`${mod.file}: экспорт «${name}» после очистки не найден в коде`);
    }
  }
}
if (problems.length) console.warn('Предупреждения сборки:\n - ' + problems.join('\n - '));

const bundle = Object.entries(namespaces)
  .map(
    ([ns, mod]) =>
      `\n/* ===== ${mod.file} ===== */\nvar ${ns} = (function () {\n${mod.code}\nreturn { ${mod.exports.join(', ')} };\n})();`
  )
  .join('\n');

const react = read('assets/js/vendor/react.production.min.js');
const reactDom = read('assets/js/vendor/react-dom.production.min.js');

const fontCss = read('assets/css/fonts.css').replace(
  /url\('\.\.\/fonts\/([^']+)'\)/g,
  (_, file) => `url('${dataUri('assets/fonts/' + file, 'font/woff2')}')`
);
const css = read('assets/css/app.css');
const storeFiles = fs.readdirSync(path.join(ROOT, 'assets/img/stores'));
const storeMap = Object.fromEntries(
  storeFiles.map((f) => [f, dataUri('assets/img/stores/' + f, 'image/webp')])
);

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>Рацион на неделю — бесплатно</title>
<meta name="description" content="Собери меню на неделю под свой магазин, бюджет и вкус — со списком покупок. Бесплатно, без оплаты и подписки." />
<meta name="color-scheme" content="light" />
<style>
${fontCss}
${css}
</style>
</head>
<body>
<div id="root"></div>
<noscript><p style="padding:24px;font-family:system-ui">Для квиза нужен включённый JavaScript.</p></noscript>

<script>${react}</script>
<script>${reactDom}</script>
<script>
globalThis.__ASSET_MAP__ = ${JSON.stringify(storeMap)};
${bundle}
</script>
</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html);
console.log(
  `готово: ${path.relative(ROOT, OUT)} — ${(Buffer.byteLength(html) / 1024).toFixed(0)} КБ, модулей ${MODULES.length}`
);
