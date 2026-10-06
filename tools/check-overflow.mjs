/**
 * Ищем горизонтальный переполнение на экране.
 * Запуск: node tools/check-overflow.mjs [screen]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const target = path.join(ROOT, 'dist', 'racion-besplatno.html');
const screen = process.argv[2] || 'tastes';
const width = Number(process.argv[3] || 430);
const candidates = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const browser = candidates.find((p) => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-ov-'));
const port = 9366;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files',
  '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  `--window-size=${width},1200`, 'about:blank',
], { stdio: 'ignore' });

async function json(url) { const r = await fetch(url); return r.json(); }

async function main() {
  let v = null;
  for (let i = 0; i < 40 && !v; i++) { try { v = await json(`http://127.0.0.1:${port}/json/version`); } catch { await sleep(250); } }
  const list = await json(`http://127.0.0.1:${port}/json/list`);
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height: 1200, deviceScaleFactor: 1, mobile: true });

  const fileUrl = process.env.CHECK_URL
    ? process.env.CHECK_URL
    : 'file:///' + target.replace(/\\/g, '/') + `?screen=${screen}`;
  await send('Page.navigate', { url: `${fileUrl}${fileUrl.includes('?') ? '&' : '?'}t=${Date.now()}` });
  await sleep(1800);

  const r = await send('Runtime.evaluate', {
    expression: `(() => {
      const vw = document.documentElement.clientWidth;
      const bad = [];
      document.querySelectorAll('*').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.width === 0) return;
        if (b.right > vw + 0.6 || b.left < -0.6) {
          bad.push({
            tag: el.tagName.toLowerCase(),
            cls: String(el.className || '').slice(0, 40),
            left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width),
            text: (el.textContent || '').trim().slice(0, 40),
          });
        }
      });
      return JSON.stringify({
        vw,
        scrollWidth: document.documentElement.scrollWidth,
        count: bad.length,
        worst: bad.sort((a,b) => b.right - a.right).slice(0, 12),
      });
    })()`,
    returnByValue: true,
  });
  const data = JSON.parse(r.result.result.value);
  console.log(`экран ${screen} @ ${data.vw}px — scrollWidth ${data.scrollWidth}, переполнений ${data.count}`);
  for (const b of data.worst) console.log(`  ${b.tag}.${b.cls} [${b.left}…${b.right}] w=${b.w} «${b.text}»`);
  ws.close();
  proc.kill();
}

main().catch((e) => { console.error('ошибка:', e.message); process.exitCode = 1; }).finally(() => setTimeout(() => proc.kill(), 200));
