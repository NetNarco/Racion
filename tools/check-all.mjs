/**
 * Разом проверяем все экраны: нет ошибок в консоли, картинки целы,
 * на каждом экране есть ожидаемый текст.
 * Запуск: node tools/check-all.mjs
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const target = path.join(ROOT, 'dist', 'racion-besplatno.html');
const candidates = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const browser = candidates.find((p) => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-all-'));
const port = 9344;

const EXPECT = {
  intro: ['Рацион на неделю', 'Собрать рацион', 'Начать сначала'],
  people: ['Кто будет кушать?', 'ВЗРОСЛЫЕ'],
  meals: ['Сколько приёмов пищи', 'Общие ужины'],
  budget: ['Бюджет на неделю', 'на человека в неделю'],
  sex: ['Для кого считаем норму?', 'Оба пола'],
  diet: ['Какой тип питания?'],
  tastes: ['Что вы любите из продуктов?', 'Курица (бедро)', 'выбрать всё'],
  allergy: ['Аллергии и ограничения', 'НЕ ЛЮБЛЮ'],
  kitchen: ['Что есть на кухне?'],
  calc: ['Собираем рацион'],
  age: ['Сколько вам лет?'],
  height: ['Какой у вас рост?'],
  weight: ['Какой у вас вес?'],
  goal: ['Какая у вас цель?'],
  target: ['ТЕМП'],
  life: ['Ваш образ жизни?'],
  cycle: ['Подстраивать меню'],
  period: ['Когда начались последние месячные?'],
  norm: ['Ваша дневная норма'],
  coffee: ['кофе, матчу или какао'],
  drinks: ['Что именно пьёте?'],
  repeat: ['Как часто блюдо может повторяться?'],
  days: ['В какие дни готовите?'],
  result: ['Ваш рацион на неделю', 'Список покупок', 'План активности', 'Итого на неделю'],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--window-size=430,1200', 'about:blank',
], { stdio: 'ignore' });

async function json(url) {
  const res = await fetch(url);
  return res.json();
}

async function main() {
  let version = null;
  for (let i = 0; i < 40 && !version; i++) {
    try { version = await json(`http://127.0.0.1:${port}/json/version`); } catch { await sleep(250); }
  }
  if (!version) throw new Error('нет отладочного порта');
  const list = await json(`http://127.0.0.1:${port}/json/list`);
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pending = new Map();
  let logs = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') logs.push(m.params.entry.text);
    if (m.method === 'Runtime.exceptionThrown') {
      logs.push('ИСКЛЮЧЕНИЕ: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');

  const fileUrl = 'file:///' + target.replace(/\\/g, '/');
  const THEME = process.env.CHECK_THEME === 'night' ? 'night' : 'day';
  let failed = 0;

  for (const [screen, needles] of Object.entries(EXPECT)) {
    logs = [];
    // Полная перезагрузка, чтобы экраны не смешивались
    await send('Page.navigate', { url: `${fileUrl}?screen=${screen}&theme=${THEME}&t=${Date.now()}` });
    await sleep(screen === 'calc' ? 1200 : 1500);
    const expr = `(() => {
      const text = document.body.innerText || '';
      const imgs = [...document.querySelectorAll('img')];
      return {
        ready: document.documentElement.getAttribute('data-app-ready'),
        theme: document.documentElement.getAttribute('data-theme'),
        len: text.length,
        text,
        broken: imgs.filter(i => !i.complete || i.naturalWidth === 0).length,
        imgs: imgs.length,
        restart: [...document.querySelectorAll('button')].some(b => (b.innerText||'').includes('Начать сначала')),
        themeBtn: !!document.querySelector('.icon-btn'),
      };
    })()`;
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    const v = r.result?.result?.value || {};
    const missing = needles.filter((n) => !(v.text || '').includes(n));
    const ok = v.ready === '1' && missing.length === 0 && v.broken === 0 && logs.length === 0 && v.theme === THEME;
    if (!ok) failed++;
    console.log(
      `${ok ? '✓' : '✗'} ${screen.padEnd(9)} ${THEME.padEnd(5)} текст ${String(v.len).padStart(5)} симв. ` +
      `img ${v.imgs} (битых ${v.broken}) тема ${v.theme} перезапуск ${v.restart ? 'да' : 'нет'} тумблер ${v.themeBtn ? 'да' : 'нет'}` +
      (missing.length ? ` · нет текста: ${missing.join(' | ')}` : '') +
      (logs.length ? ` · ошибки: ${logs.slice(0, 3).join(' ; ')}` : '')
    );
    if (!ok) {
      console.log('    ── начало текста: ' + JSON.stringify((v.text || '').slice(0, 120)));
    }
  }

  console.log(failed ? `\n✗ проблемных экранов: ${failed}` : `\n✓ все экраны отрисовались без ошибок (тема ${THEME})`);
  process.exitCode = failed ? 1 : 0;
  ws.close();
  proc.kill();
}

main()
  .catch((e) => { console.error('ошибка проверки:', e.message); process.exitCode = 1; })
  .finally(() => setTimeout(() => proc.kill(), 200));
