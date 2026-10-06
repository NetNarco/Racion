/**
 * Проверяем, что вкладки отделов на шаге продуктов не сбрасываются при выборе.
 * Запуск: node tools/check-tabs.mjs
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const target = path.join(ROOT, 'dist', 'racion-besplatno.html');
const browser = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-tabs-'));
const port = 9401;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files',
  '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=460,1000', 'about:blank',
], { stdio: 'ignore' });

const json = async (u) => (await fetch(u)).json();

async function main() {
  let v = null;
  for (let i = 0; i < 40 && !v; i++) { try { v = await json(`http://127.0.0.1:${port}/json/version`); } catch { await sleep(250); } }
  const pages = await json(`http://127.0.0.1:${port}/json/list`);
  const ws = new WebSocket((pages.find((t) => t.type === 'page') || pages[0]).webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const errors = []; const logs = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled') {
      logs.push(m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' '));
    }
  };
  const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 430, height: 1000, deviceScaleFactor: 1, mobile: true });

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval error');
    return r.result?.result?.value;
  };

  const fileUrl = 'file:///' + target.replace(/\\/g, '/');
  await send('Page.navigate', { url: `${fileUrl}?screen=tastes&t=${Date.now()}` });
  await sleep(1800);

  const snapshot = () =>
    evaluate(`(() => {
      const active = document.querySelector('.cat-tab.on');
      const stored = JSON.parse(localStorage.getItem('racion-clone-v3') || '{}');
      return {
        active: active ? active.innerText.replace(/\\n/g, ' ') : null,
        activeIndex: [...document.querySelectorAll('.cat-tab')].findIndex((b) => b.classList.contains('on')),
        scrollLeft: Math.round((document.querySelector('.cat-tabs') || {}).scrollLeft || 0),
        cards: document.querySelectorAll('.prod-card').length,
        selectedHere: document.querySelectorAll('.prod-card.selected').length,
        totalSelected: ((stored.state && stored.state.likedProducts) || []).length,
        dots: document.querySelectorAll('.cat-dot').length,
        navs: performance.getEntriesByType('navigation').length,
        marker: window.__tabMarker || null,
      };
    })()`);

  console.log('старт:', JSON.stringify(await snapshot()));

  // Переключаемся на 4-й отдел
  await evaluate(`window.__tabMarker = 'жив'; 'ok'`);
  await evaluate(`(() => { const t = document.querySelectorAll('.cat-tab')[3]; t.click(); t.scrollIntoView({block:'nearest', inline:'center'}); return 'ok'; })()`);
  await sleep(400);
  const beforeClick = await snapshot();
  console.log('после переключения на 4-й отдел:', JSON.stringify(beforeClick));

  // Выбираем два продукта в этом отделе
  await evaluate(`(() => {
    const cards = [...document.querySelectorAll('.prod-card')];
    cards[0].click();
    return 'ok';
  })()`);
  await sleep(450);
  const afterOne = await snapshot();
  console.log('после выбора 1-го продукта:', JSON.stringify(afterOne));

  await evaluate(`(() => { document.querySelectorAll('.prod-card')[1].click(); return 'ok'; })()`);
  await sleep(450);
  const afterTwo = await snapshot();
  console.log('после выбора 2-го продукта:', JSON.stringify(afterTwo));

  // И ещё в другом отделе, чтобы проверить накопление
  await evaluate(`(() => { document.querySelectorAll('.cat-tab')[5].click(); return 'ok'; })()`);
  await sleep(400);
  await evaluate(`(() => { document.querySelectorAll('.prod-card')[0].click(); return 'ok'; })()`);
  await sleep(450);
  const afterOther = await snapshot();
  console.log('выбор в 6-м отделе:', JSON.stringify(afterOther));

  const problems = [];
  if (afterOne.activeIndex !== beforeClick.activeIndex) problems.push('после 1-го выбора вкладка сбросилась на ' + afterOne.activeIndex);
  if (afterTwo.activeIndex !== beforeClick.activeIndex) problems.push('после 2-го выбора вкладка сбросилась на ' + afterTwo.activeIndex);
  if (afterOne.selectedHere < 1) problems.push('первый продукт не отметился в этом отделе');
  if (afterTwo.selectedHere < 2) problems.push('выбор в отделе не накапливается: ' + afterTwo.selectedHere);
  if (afterTwo.totalSelected < 2) problems.push('в состоянии не 2 продукта, а ' + afterTwo.totalSelected);
  if (afterOther.activeIndex !== 5) problems.push('в 6-м отделе активна вкладка ' + afterOther.activeIndex);
  if (afterOther.totalSelected < 3) problems.push('после смены отдела общий выбор потерялся: ' + afterOther.totalSelected);
  if (afterOther.dots < 2) problems.push('на вкладках нет отметок о выбранном: ' + afterOther.dots);
  if (errors.length) problems.push('ошибки в консоли: ' + errors.slice(0, 2).join(' ; '));

  console.log('');
  console.log('── консоль браузера ──');
  console.log(logs.slice(0, 40).join('\n') || '(пусто)');
  console.log('');
  console.log(problems.length ? '✗ ' + problems.join('\n✗ ') : '✓ вкладки не сбрасываются, выбор накапливается');
  process.exitCode = problems.length ? 1 : 0;
  ws.close();
  proc.kill();
}

main().catch((e) => { console.error('ошибка:', e.message); process.exitCode = 1; }).finally(() => setTimeout(() => proc.kill(), 200));
