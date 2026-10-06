/** Быстрая проверка синтаксиса файла с точной строкой. node tools/syntax.mjs <file> */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const file = path.resolve(process.argv[2]);
const src = fs.readFileSync(file, 'utf8');
try {
  new vm.SourceTextModule(src, { identifier: file });
  console.log('синтаксис ок:', path.basename(file));
} catch (e) {
  const m = /:(\d+)\b/.exec(e.stack || '');
  console.log('ОШИБКА:', e.message, m ? `(строка ~${m[1]})` : '');
  if (e.stack) console.log(e.stack.split('\n').slice(0, 6).join('\n'));
}
