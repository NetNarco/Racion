/**
 * Проверка отрисовки через CDP: запускаем headless Edge с отладочным портом
 * и читаем DOM/ошибки консоли. Запуск: node tools/cdp-check.mjs [screen]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const target = path.join(ROOT, 'dist', 'racion-besplatno.html');
const screen = process.argv[2] || 'intro';

const candidates = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const browser = candidates.find((p) => fs.existsSync(p));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-'));
const port = 9333;

const proc = spawn(browser, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--allow-file-access-from-files',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  '--window-size=430,1200',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function json(url) {
  const res = await fetch(url);
  return res.json();
}

async function main() {
  let version = null;
  for (let i = 0; i < 40 && !version; i++) {
    try {
      version = await json(`http://127.0.0.1:${port}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  if (!version) throw new Error('не дождались отладочного порта');

  const list = await json(`http://127.0.0.1:${port}/json/list`);
  const page = list.find((t) => t.type === 'page') || list[0];
  const wsUrl = page.webSocketDebuggerUrl;
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let id = 0;
  const pending = new Map();
  const logs = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      logs.push(
        'console.' + msg.params.type + ': ' +
        msg.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ')
      );
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      logs.push('ИСКЛЮЧЕНИЕ: ' + (d.exception?.description || d.text));
    }
    if (msg.method === 'Log.entryAdded') {
      const e = msg.params.entry;
      if (e.level === 'error' || e.level === 'warning') logs.push(`log.${e.level}: ${e.text}`);
    }
  };
  const send = (method, params = {}) =>
    new Promise((res) => {
      const mid = ++id;
      pending.set(mid, res);
      ws.send(JSON.stringify({ id: mid, method, params }));
    });

  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  const url = 'file:///' + target.replace(/\\/g, '/') + '?screen=' + screen;
  await send('Page.navigate', { url });
  await sleep(3000);

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.exception?.description };
    return r.result?.result?.value;
  };

  const report = await evalJs(`(() => {
    const imgs = [...document.querySelectorAll('img')];
    return {
      ready: document.documentElement.getAttribute('data-app-ready'),
      title: document.title,
      rootChildren: document.getElementById('root')?.children.length,
      text: (document.body.innerText || '').slice(0, 400),
      imgs: imgs.length,
      broken: imgs.filter(i => !i.complete || i.naturalWidth === 0).map(i => ({
        src: (i.getAttribute('src') || '').slice(0, 60),
        w: i.naturalWidth,
      })),
      svgs: document.querySelectorAll('svg').length,
      hasMap: !!globalThis.__ASSET_MAP__,
    };
  })()`);

  console.log('экран:', screen);
  console.log(JSON.stringify(report, null, 2));
  if (logs.length) console.log('--- консоль браузера ---\n' + logs.slice(0, 25).join('\n'));

  ws.close();
  proc.kill();
}

main()
  .catch((e) => {
    console.error('ошибка проверки:', e.message);
    process.exitCode = 1;
  })
  .finally(() => setTimeout(() => proc.kill(), 200));
