/**
 * Полностраничные снимки экранов через CDP (Page.captureScreenshot с clip).
 * Запуск: node tools/shots-full.mjs [screen ...]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '_preview');
const target = path.join(ROOT, 'dist', 'racion-besplatno.html');
const screens = process.argv.slice(2).length ? process.argv.slice(2) : ['result'];

const candidates = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const browser = candidates.find((p) => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-full-'));
const port = 9355;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files',
  '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=430,1400', 'about:blank',
], { stdio: 'ignore' });

async function json(url) { const r = await fetch(url); return r.json(); }

async function main() {
  let version = null;
  for (let i = 0; i < 40 && !version; i++) {
    try { version = await json(`http://127.0.0.1:${port}/json/version`); } catch { await sleep(250); }
  }
  const list = await json(`http://127.0.0.1:${port}/json/list`);
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const send = (method, params = {}) =>
    new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });

  await send('Page.enable');
  await send('Runtime.enable');
  // Точная ширина вьюпорта (--window-size включает рамку окна).
  const WIDTH = Number(process.env.SHOT_WIDTH || 430);
  const HEIGHT = Number(process.env.SHOT_HEIGHT || 1400);
  await send('Emulation.setDeviceMetricsOverride', {
    width: WIDTH,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: WIDTH < 700,
  });
  const fileUrl = 'file:///' + target.replace(/\\/g, '/');

  for (const spec of screens) {
    // «result@salmon,broccoli#2000» — любимые продукты и срез с нужной высоты,
    // «result!night» — ночная тема.
    const [nameAndLiked, themeRaw] = spec.split('!');
    const theme = themeRaw === 'night' ? 'night' : 'day';
    const [nameAndLiked2, fromRaw] = nameAndLiked.split('#');
    const [screen, liked] = nameAndLiked2.split('@');
    const from = Number(fromRaw || 0);
    const query = [`screen=${screen}`, `theme=${theme}`, liked ? `liked=${liked}` : '', `t=${Date.now()}`]
      .filter(Boolean)
      .join('&');
    await send('Page.navigate', { url: `${fileUrl}?${query}` });
    await sleep(screen === 'calc' ? 2500 : 1800);
    const size = await send('Runtime.evaluate', {
      expression: 'JSON.stringify({h: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)})',
      returnByValue: true,
    });
    const pageHeight = Math.min(9000, JSON.parse(size.result.result.value).h);
    const fullHeight = from ? Math.min(4000, pageHeight - from) : Math.min(pageHeight, 4200);
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: from, width: WIDTH, height: fullHeight, scale: 1 },
    });
    const suffix = `${liked ? '-liked' : ''}${from ? '-from' + from : ''}${theme === 'night' ? '-night' : ''}`;
    const out = path.join(OUT, `full-${screen}${suffix}.png`);
    fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
    console.log(`✓ ${spec}: ${WIDTH}×${fullHeight} → ${path.relative(ROOT, out)}`);
  }
  ws.close();
  proc.kill();
}

main()
  .catch((e) => { console.error('ошибка:', e.message); process.exitCode = 1; })
  .finally(() => setTimeout(() => proc.kill(), 200));
