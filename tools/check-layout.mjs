/**
 * Проверяем выравнивание нижней кнопки с колонкой контента на десктопе.
 * Запуск: node tools/check-layout.mjs [ширина]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const target = path.join(ROOT, 'dist', 'racion-besplatno.html');
const width = Number(process.argv[2] || 1280);
const screens = process.argv.slice(3);
const list = screens.length ? screens : ['intro', 'people', 'result'];

const browser = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((p) => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-layout-'));
const port = 9399;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files',
  '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=1400,1000', 'about:blank',
], { stdio: 'ignore' });

const json = async (u) => (await fetch(u)).json();

async function main() {
  let v = null;
  for (let i = 0; i < 40 && !v; i++) { try { v = await json(`http://127.0.0.1:${port}/json/version`); } catch { await sleep(250); } }
  const pages = await json(`http://127.0.0.1:${port}/json/list`);
  const ws = new WebSocket((pages.find((t) => t.type === 'page') || pages[0]).webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false });

  const fileUrl = 'file:///' + target.replace(/\\/g, '/');
  let fails = 0;
  for (const screen of list) {
    await send('Page.navigate', { url: `${fileUrl}?screen=${screen}&t=${Date.now()}` });
    await sleep(1800);
    const r = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const box = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { l: Math.round(b.left), r: Math.round(b.right), w: Math.round(b.width) }; };
        return JSON.stringify({
          width: window.innerWidth,
          content: box('.shell-body'),
          dock: box('.cta-dock .btn') || box('.cta-dock .dock-col'),
          side: box('.shell-side'),
          overflowX: document.documentElement.scrollWidth - window.innerWidth,
        });
      })()`,
    });
    const d = JSON.parse(r.result.result.value);
    const dock = d.dock;
    const content = d.content;
    // Кнопка должна стоять по левому краю колонки контента (±2 px) и не шире неё.
    const aligned = dock && content && Math.abs(dock.l - content.l) <= 2;
    const fits = dock && content && dock.w <= content.w + 2;
    const ok = aligned && fits && d.overflowX <= 1;
    if (!ok) fails++;
    console.log(
      `${ok ? '✓' : '✗'} ${screen.padEnd(8)} @${d.width}px — контент ${content?.l}…${content?.r} (${content?.w}), ` +
      `кнопка ${dock?.l}…${dock?.r} (${dock?.w}), сайдбар ${d.side ? d.side.w : '—'}px, переполнение ${d.overflowX}px`
    );
  }
  console.log(fails ? `\n✗ проблем: ${fails}` : '\n✓ выравнивание в порядке');
  process.exitCode = fails ? 1 : 0;
  ws.close();
  proc.kill();
}

main().catch((e) => { console.error('ошибка:', e.message); process.exitCode = 1; }).finally(() => setTimeout(() => proc.kill(), 200));
