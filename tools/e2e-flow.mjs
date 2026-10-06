/**
 * Полный прогон квиза кликами: от интро до бесплатного результата.
 * Проверяем, что ни на одном шаге нет ошибок и рацион действительно открывается.
 * Запуск: node tools/e2e-flow.mjs
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
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-e2e-'));
const port = 9377;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const proc = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--allow-file-access-from-files',
  '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=430,1200', 'about:blank',
], { stdio: 'ignore' });

async function json(url) { const r = await fetch(url); return r.json(); }

async function main() {
  let version = null;
  for (let i = 0; i < 40 && !version; i++) { try { version = await json(`http://127.0.0.1:${port}/json/version`); } catch { await sleep(250); } }
  const list = await json(`http://127.0.0.1:${port}/json/list`);
  const page = list.find((t) => t.type === 'page') || list[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map(); const errors = [];
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push('ИСКЛЮЧЕНИЕ: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text);
  };
  const send = (method, params = {}) => new Promise((res) => { const mid = ++id; pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); });
  await send('Runtime.enable');
  await send('Log.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 430, height: 1200, deviceScaleFactor: 1, mobile: true });

  const fileUrl = 'file:///' + target.replace(/\\/g, '/');
  await send('Page.navigate', { url: fileUrl });
  await sleep(1500);

  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description || 'eval error');
    return r.result?.result?.value;
  };

  /** Жмём кнопку по тексту: сначала в доке, потом на странице. */
  const clickByText = async (text, { last = false } = {}) => {
    const expr = `(() => {
      const wanted = ${JSON.stringify(text)};
      const btns = [...document.querySelectorAll('button')].filter(
        (b) => (b.innerText || '').trim().includes(wanted) && !b.disabled && b.offsetParent !== null
      );
      if (!btns.length) return 'нет кнопки: ' + wanted;
      const btn = ${last ? 'btns[btns.length - 1]' : 'btns[0]'};
      btn.scrollIntoView({ block: 'center' });
      btn.click();
      return 'ok';
    })()`;
    return evaluate(expr);
  };

  const state = async () =>
    evaluate(`(() => {
      const first = (s) => String(s || '').split(String.fromCharCode(10))[0];
      const t = document.body.innerText || '';
      const named = document.querySelector('.shell-body');
      const h1 = document.querySelector('.shell-body h1, .analyze h1');
      const title =
        (named && named.getAttribute('data-screen')) ||
        (h1 && first(h1.innerText)) ||
        first(t);
      return {
        title: String(title).slice(0, 40),
        text: t,
        isResult: !!document.querySelector('.shop-total'),
      };
    })()`);

  const steps = [];
  const step = async (label, fn) => {
    const before = errors.length;
    const res = await fn();
    await sleep(420);
    const s = await state();
    const title = s.title;
    const newErr = errors.slice(before);
    steps.push({ label, res, title, newErr });
    console.log(
      `${newErr.length ? '✗' : '✓'} ${label.padEnd(26)} → ${title}` +
      (newErr.length ? `  ОШИБКИ: ${newErr.slice(0, 2).join(' ; ')}` : '')
    );
  };

  await step('тема: переключить на ночную', async () => {
    const r = await evaluate(`(() => {
      const b = document.querySelector('.icon-btn');
      if (!b) return 'нет тумблера темы';
      b.click();
      return 'ok';
    })()`);
    await sleep(400);
    return r;
  });
  await step('тема: вернуть дневную', async () => {
    const r = await evaluate(`(() => {
      const b = document.querySelector('.icon-btn');
      if (!b) return 'нет тумблера темы';
      b.click();
      return 'ok';
    })()`);
    await sleep(400);
    return r;
  });
  await step('интро → кто ест', () => clickByText('Собрать рацион'));
  await step('люди: включить детей', () => clickByText('Есть дети?'));
  await step('люди → приёмы', () => clickByText('Далее'));
  await step('приёмы → бюджет', () => clickByText('Далее'));
  await step('бюджет → пол', () => clickByText('Далее'));
  await step('пол: оба пола', () => clickByText('Оба пола'));
  await step('пол → питание', () => clickByText('Далее'));
  await step('питание → продукты', () => clickByText('Далее'));
  await step('продукты: 6 любимых', async () => {
    // Отмечаем по паре продуктов в нескольких категориях. Заодно следим,
    // чтобы вкладка не сбрасывалась на первую после каждого выбора.
    const cats = ['Мясо', 'Овощи', 'Крупы', 'Фрукты'];
    for (const cat of cats) {
      const r = await evaluate(`(() => {
        const tab = [...document.querySelectorAll('.cat-tab')].find((b) => (b.innerText || '').includes(${JSON.stringify(cat)}));
        if (!tab) return 'нет категории ' + ${JSON.stringify(cat)};
        tab.click();
        return 'ok';
      })()`);
      if (r !== 'ok') return r;
      await sleep(300);
      const before = await evaluate(`[...document.querySelectorAll('.cat-tab')].findIndex((b) => b.classList.contains('on'))`);
      const picked = await evaluate(`(() => {
        const cards = [...document.querySelectorAll('.prod-card')];
        if (!cards.length) return 'нет карточек';
        cards[0].click();
        if (cards[1]) cards[1].click();
        return 'ok';
      })()`);
      if (picked !== 'ok') return picked;
      await sleep(300);
      const after = await evaluate(`(() => ({
        tab: [...document.querySelectorAll('.cat-tab')].findIndex((b) => b.classList.contains('on')),
        selected: document.querySelectorAll('.prod-card.selected').length,
      }))()`);
      if (after.tab !== before) return `вкладка «${cat}» сбросилась на ${after.tab}`;
      if (after.selected < 2) return `в категории «${cat}» отметилось ${after.selected} продукта`;
    }
    return 'ok';
  });
  await step('продукты → аллергии', () => clickByText('Далее'));
  await step('аллергии: лактоза', () => clickByText('Лактоза'));
  await step('аллергии → кухня', () => clickByText('Далее'));
  await step('кухня → расчёт', () => clickByText('Посчитать рацион'));
  await step('расчёт → результат', async () => {
    for (let i = 0; i < 16; i++) {
      await sleep(500);
      const ready = await evaluate(`!!document.querySelector('.shop-total')`);
      if (ready) return 'ok';
    }
    return 'результат не появился';
  });

  const final = await state();
  const has = (s) => final.text.includes(s);
  const checks = {
    'итог корзины': has('Итого на неделю'),
    'меню на неделю': has('Меню на неделю'),
    'список покупок': has('Список покупок'),
    'план активности': has('План активности'),
    'норма КБЖУ': /норма в день/i.test(final.text) && /белки/i.test(final.text),
    'любимые продукты на результате': /ваши любимые продукты/i.test(final.text),
    'кнопка «начать сначала»': has('Начать сначала'),
    'тумблер темы': await evaluate(`!!document.querySelector('.icon-btn')`),
    'нет слова «оплатить»': !/оплатить|подписк|590\s*₽/i.test(final.text),
    'нет пейволла': !has('Оформить'),
  };
  console.log('');
  for (const [k, v] of Object.entries(checks)) console.log(`${v ? '✓' : '✗'} ${k}`);

  // Проверим клик по дню и раскрытие рецепта
  const interaction = await evaluate(`(() => {
    const tabs = [...document.querySelectorAll('.day-tab')];
    if (tabs.length < 7) return 'дней меньше 7: ' + tabs.length;
    tabs[3].click();
    return 'ok';
  })()`);
  await sleep(400);
  const dayCheck = await evaluate(`(() => {
    const on = document.querySelector('.day-tab.on');
    return { active: on ? on.innerText.split('\\n')[0] : null, meals: document.querySelectorAll('.meal-row').length };
  })()`);
  console.log(`\n${interaction === 'ok' ? '✓' : '✗'} переключение дня: активен ${dayCheck.active}, приёмов пищи ${dayCheck.meals}`);

  const recipeOpen = await evaluate(`(() => {
    const head = document.querySelector('.recipe-head');
    if (!head) return 'нет рецептов';
    head.click();
    return 'ok';
  })()`);
  await sleep(400);
  const recipeCheck = await evaluate(`(() => {
    const open = document.querySelector('.recipe.open');
    return open ? { steps: open.querySelectorAll('.steps li').length, ings: open.querySelectorAll('.ing-list li').length, alts: open.querySelectorAll('.alt-chip').length } : null;
  })()`);
  console.log(`${recipeOpen === 'ok' && recipeCheck ? '✓' : '✗'} раскрытие рецепта: шагов ${recipeCheck?.steps}, продуктов ${recipeCheck?.ings}, замен ${recipeCheck?.alts}`);

  // Кнопка «Начать сначала» спрашивает подтверждение и возвращает на интро.
  await evaluate(`window.confirm = () => true`);
  const restartCheck = await evaluate(`(() => {
    const b = [...document.querySelectorAll('button')].find((x) => (x.innerText || '').includes('Начать сначала'));
    if (!b) return 'нет кнопки';
    b.click();
    return 'ok';
  })()`);
  await sleep(700);
  const afterRestart = await evaluate(`(() => {
    const t = document.body.innerText || '';
    return { intro: t.includes('Собрать рацион'), menu: t.includes('Меню на неделю') };
  })()`);
  console.log(`${restartCheck === 'ok' && afterRestart.intro ? '✓' : '✗'} «Начать сначала»: интро ${afterRestart.intro ? 'показано' : 'нет'}, меню ${afterRestart.menu ? 'осталось' : 'сброшено'}`);

  // Десктопная раскладка: боковая панель должна появиться на широком экране.
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `${fileUrl}?screen=result&t=${Date.now()}` });
  await sleep(1800);
  const desktop = await evaluate(`(() => {
    const side = document.querySelector('.shell-side');
    const body = document.querySelector('.shell-body');
    return {
      sideVisible: !!side && getComputedStyle(side).display !== 'none',
      sideWidth: side ? Math.round(side.getBoundingClientRect().width) : 0,
      bodyWidth: body ? Math.round(body.getBoundingClientRect().width) : 0,
      cols: getComputedStyle(document.querySelector('.shell')).gridTemplateColumns,
    };
  })()`);
  console.log(`${desktop.sideVisible && desktop.sideWidth > 200 ? '✓' : '✗'} десктоп 1280px: сайдбар ${desktop.sideWidth}px, контент ${desktop.bodyWidth}px, колонки ${desktop.cols}`);

  const totalErrors = errors.length;
  console.log(`\n${totalErrors ? '✗' : '✓'} ошибок в консоли за прогон: ${totalErrors}`);
  if (totalErrors) console.log(errors.slice(0, 6).join('\n'));

  fs.writeFileSync(
    path.join(ROOT, '_preview', 'e2e-report.json'),
    JSON.stringify({ steps, checks, dayCheck, recipeCheck, errors }, null, 2)
  );

  const bad = steps.filter((s) => s.newErr.length).length + Object.values(checks).filter((v) => !v).length;
  console.log(bad ? `\n✗ проблем: ${bad}` : '\n✓ прогон пройден полностью');
  process.exitCode = bad || totalErrors ? 1 : 0;
  ws.close();
  proc.kill();
}

main().catch((e) => { console.error('ошибка прогона:', e.message); process.exitCode = 1; }).finally(() => setTimeout(() => proc.kill(), 200));
