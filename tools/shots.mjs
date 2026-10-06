/**
 * Снимки экранов через headless Edge: проверяем, что всё рисуется.
 * Запуск: node tools/shots.mjs [имя-экрана ...]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, '_preview');
fs.mkdirSync(OUT, { recursive: true });

const EDGE_CANDIDATES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const browser = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!browser) {
  console.error('Не найден Edge/Chrome для снимков');
  process.exit(1);
}

const target = path.join(ROOT, 'dist', 'racion-besplatno.html');
if (!fs.existsSync(target)) {
  console.error('Нет dist/racion-besplatno.html — сначала запустите node build.mjs');
  process.exit(1);
}
const fileUrl = 'file:///' + target.replace(/\\/g, '/');

const shots = process.argv.slice(2).length
  ? process.argv.slice(2).map((s) => ({ screen: s, height: 1400 }))
  : [
      { screen: 'intro', height: 1100 },
      { screen: 'stores', height: 1100 },
      { screen: 'people', height: 1200 },
      { screen: 'meals', height: 1200 },
      { screen: 'budget', height: 1200 },
      { screen: 'sex', height: 900 },
      { screen: 'diet', height: 900 },
      { screen: 'tastes', height: 1000 },
      { screen: 'allergy', height: 1500 },
      { screen: 'kitchen', height: 1100 },
      { screen: 'calc', height: 1000 },
      { screen: 'norm', height: 1300 },
      { screen: 'days', height: 1200 },
      { screen: 'result', height: 4200, full: true },
    ];

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'edge-shot-'));

for (const shot of shots) {
  const url = `${fileUrl}?screen=${shot.screen}`;
  const out = path.join(OUT, `screen-${shot.screen}.png`);
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    `--user-data-dir=${profile}`,
    '--virtual-time-budget=4000',
    `--window-size=430,${shot.height}`,
    `--screenshot=${out}`,
    url,
  ];
  try {
    execFileSync(browser, args, { stdio: 'pipe' });
    const size = fs.statSync(out).size;
    console.log(`✓ ${shot.screen} → ${path.relative(ROOT, out)} (${(size / 1024).toFixed(0)} КБ)`);
  } catch (e) {
    console.error(`✗ ${shot.screen}: ${e.message}`);
  }
}
