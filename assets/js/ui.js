/**
 * Каркас интерфейса и мелкие компоненты: полноэкранная раскладка с боковой
 * панелью на десктопе, мобильная колонка, дневная и ночная темы.
 *
 * Пишем на React.createElement без JSX — приложение работает без сборщика.
 */

import { BY_ID } from './products.js';

export const h = React.createElement;
export const Fragment = React.Fragment;

/* ── Формат ───────────────────────────────────────────────────────────── */
export const rub = (n) =>
  `${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}\u00a0₽`;

export function plural(n, one, few, many) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

export const people = (n) => `${n} ${plural(n, 'человек', 'человека', 'человек')}`;
export const portions = (n) => `${n} ${plural(n, 'порция', 'порции', 'порций')}`;
export const dishesW = (n) => `${n} ${plural(n, 'блюдо', 'блюда', 'блюд')}`;

/** Пути к картинкам магазинов. В сборке одного файла подменяются на data-URI. */
function storeAsset(file) {
  const g = globalThis;
  const mapped = g.__ASSET_MAP__ && g.__ASSET_MAP__[file];
  return mapped || `assets/img/stores/${file}`;
}
export const asset = { store: storeAsset };

/* ── Хранилище ────────────────────────────────────────────────────────── */
export function loadState(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим — просто не сохраняем */
  }
}
export function clearState(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* ── Тема ─────────────────────────────────────────────────────────────── */
export function applyTheme(theme) {
  const night = theme === 'night';
  document.documentElement.setAttribute('data-theme', night ? 'night' : 'day');
  document.body.classList.toggle('is-night', night);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', night ? '#14110E' : '#FBF7F1');
}

/* ── Кнопки верхней панели ────────────────────────────────────────────── */
export const ThemeToggle = ({ theme, onToggle }) =>
  h(
    'button',
    {
      type: 'button',
      className: 'icon-btn',
      onClick: onToggle,
      title: theme === 'night' ? 'Дневная тема' : 'Ночная тема',
      'aria-label': theme === 'night' ? 'Включить дневную тему' : 'Включить ночную тему',
    },
    theme === 'night' ? '☀️' : '🌙'
  );

export const RestartButton = ({ onRestart }) =>
  h(
    'button',
    { type: 'button', className: 'text-btn', onClick: onRestart, title: 'Начать сначала' },
    h('span', { style: { fontSize: 15 } }, '↺'),
    'Начать сначала'
  );

/** Верхняя панель: перезапуск слева, тема справа. */
export const TopBar = ({ theme, onToggleTheme, onRestart, extra }) =>
  h(
    'div',
    { className: 'topbar' },
    onRestart ? h(RestartButton, { onRestart }) : null,
    h('span', { className: 'grow' }),
    extra || null,
    onToggleTheme ? h(ThemeToggle, { theme, onToggle: onToggleTheme }) : null
  );

/* ── Прогресс ─────────────────────────────────────────────────────────── */
export const Progress = ({ filled, total, title, counter }) =>
  h(
    'div',
    { className: 'progress' },
    h(
      'div',
      { className: 'progress-bar' },
      Array.from({ length: total }, (_, i) =>
        h('div', { key: i, className: 'progress-seg' + (i < filled ? ' on' : '') })
      )
    ),
    h(
      'div',
      { className: 'progress-meta' },
      h('span', null, title),
      h('span', { className: 'count' }, counter)
    )
  );

/**
 * Список шагов в боковой панели (виден только на десктопе).
 * Каждый шаг — кнопка: можно вернуться к любому пройденному шагу.
 */
export const SideSteps = ({ steps, current, onGo, title, reachable = 'all' }) => {
  if (!steps || !steps.length) return null;
  const canGo = (i) => {
    if (!onGo) return false;
    if (reachable === 'all') return true;
    if (reachable === 'passed') return i <= current;
    return false;
  };
  return h(
    'div',
    { className: 'side-block' },
    title ? h('div', { className: 'side-title' }, title) : null,
    h(
      'div',
      { className: 'side-steps' },
      steps.map((step, i) => {
        const item = typeof step === 'string' ? { label: step } : step;
        const clickable = canGo(i);
        const cls =
          'side-step' +
          (i < current ? ' done' : i === current ? ' now' : '') +
          (clickable ? ' clickable' : '');
        const inner = [
          h('span', { className: 'num', key: 'n' }, i < current ? '✓' : i + 1),
          h('span', { key: 'l' }, item.label),
        ];
        return clickable
          ? h(
              'button',
              {
                key: item.label,
                type: 'button',
                className: cls,
                onClick: () => onGo(item.id || i, i),
                title: `Перейти: ${item.label}`,
              },
              inner
            )
          : h('div', { key: item.label, className: cls }, inner);
      })
    )
  );
};

/** Карточка со сводкой в боковой панели (строки «ключ — значение»). */
export const SideSummary = ({ title, rows, note }) =>
  h(
    'div',
    { className: 'side-card' },
    title ? h('div', { className: 'side-title' }, title) : null,
    (rows || []).map((r) =>
      h('div', { className: 'row', key: r.k }, h('span', { className: 'k' }, r.k), h('span', { className: 'v' }, r.v))
    ),
    note ? h('div', { className: 'side-note' }, note) : null
  );

/** Оглавление разделов результата. */
export const SideNav = ({ title, items }) =>
  h(
    'div',
    { className: 'side-card' },
    title ? h('div', { className: 'side-title' }, title) : null,
    h(
      'div',
      { className: 'side-nav' },
      (items || []).map((s) =>
        h(
          'button',
          {
            key: s.id,
            type: 'button',
            onClick: () => {
              const el = document.getElementById(s.id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            },
          },
          s.label
        )
      )
    )
  );

/* ── Каркас экрана ────────────────────────────────────────────────────── */
export const Shell = ({ children, side, noSide, dock, topbar, screenName }) =>
  h(
    Fragment,
    null,
    h(
      'div',
      { className: 'app' },
      h(
        'div',
        { className: 'shell' + (noSide ? ' no-side' : '') },
        h('div', { className: 'shell-side' }, side || null),
        h(
          'div',
          { className: 'shell-body', 'data-screen': screenName || undefined },
          topbar === undefined ? null : topbar,
          children
        )
      )
    ),
    dock ? h('div', { className: 'dock-wrap' + (noSide ? ' no-side' : '') }, dock) : null
  );

export const Button = ({ children, onClick, disabled, variant = '', weight }) =>
  h(
    'button',
    {
      type: 'button',
      className: 'btn ' + variant,
      onClick: disabled ? undefined : onClick,
      disabled: !!disabled,
      style: weight ? { fontWeight: weight } : undefined,
    },
    children,
    h('span', { className: 'chev' })
  );

export const Dock = ({ children, centered }) =>
  h(
    'div',
    { className: 'cta-dock' + (centered ? ' centered' : '') },
    h('div', { className: 'dock-inner' }, h('div', { className: 'dock-col' }, children))
  );

/**
 * Экран квиза: верхняя панель, боковые шаги/прогресс, содержимое и нижняя кнопка.
 */
export const Screen = ({
  children,
  progress,
  side,
  sideTitle = 'Шаги',
  sideSteps,
  sideCurrent,
  onGo,
  ctaLabel,
  onCta,
  ctaDisabled = false,
  dock,
  topbar = true,
  theme,
  onToggleTheme,
  onRestart,
  topExtra,
  noSide = false,
}) => {
  const stepsList = progress?.sideSteps || sideSteps;
  const currentIdx = progress?.sideCurrent !== undefined ? progress.sideCurrent : (sideCurrent ?? 0);
  const clickHandler = progress?.onGo || onGo;
  const sideContent =
    side ||
    h(
      Fragment,
      null,
      progress ? h(Progress, { ...progress }) : null,
      stepsList ? h(SideSteps, { steps: stepsList, current: currentIdx, title: sideTitle, onGo: clickHandler }) : null
    );

  return h(
    Shell,
    {
      noSide,
      side: sideContent,
      screenName: progress ? progress.title : sideTitle,
      topbar: topbar
        ? h(TopBar, { theme, onToggleTheme, onRestart, extra: topExtra })
        : null,
      dock:
        dock !== undefined
          ? dock
          : ctaLabel
          ? h(Dock, null, h(Button, { onClick: onCta, disabled: ctaDisabled }, ctaLabel))
          : null,
    },
    children
  );
};

/* ── Мелкие блоки ─────────────────────────────────────────────────────── */
export const Title = ({ title, children, sub, mbSub = 16 }) =>
  h(
    Fragment,
    null,
    h('h1', { className: 'title' }, title ?? children),
    sub ? h('p', { className: 'sub', style: { marginBottom: mbSub } }, sub) : null
  );

export const Card = ({ children, compact = false, tight = false, className = '', style }) =>
  h(
    'div',
    { className: `card${compact ? ' compact' : ''}${tight ? ' tight' : ''} ${className}`, style },
    children
  );

export const Grid = ({ cols = 2, gap, children, className = '' }) =>
  h('div', { className: `grid-${cols} ${className}`, style: gap ? { gap } : undefined }, children);

export const Cap = ({ children, mb = 10 }) =>
  h('div', { className: 'label-cap', style: { marginBottom: mb } }, children);

export const Note = ({ emoji, title, children }) =>
  h(
    'div',
    { className: 'note' },
    h('span', { className: 'emoji' }, emoji),
    h(
      'div',
      null,
      title ? h('div', { className: 'note-title' }, title) : null,
      h('div', { className: 'note-text' }, children)
    )
  );

export const Callout = ({ kind = 'warn', emoji, title, children }) =>
  h(
    'div',
    { className: 'callout' + (kind === 'ok' ? ' ok' : '') },
    h('span', { className: 'emoji' }, emoji),
    h(
      'div',
      null,
      h('div', { className: 'callout-title' }, title),
      h('div', { className: 'callout-text' }, children)
    )
  );

export const OptionCard = ({
  selected, onClick, children, minHeight, padding, gap, radius, checkSize = 20,
  justify = 'center', showCheck = true, className = '',
}) =>
  h(
    'button',
    {
      type: 'button',
      className: 'opt ' + className + (selected ? ' selected' : ''),
      onClick,
      style: { minHeight, padding, gap, borderRadius: radius, justifyContent: justify },
    },
    selected && showCheck
      ? h('span', { className: 'check', style: { width: checkSize, height: checkSize } }, h('i'))
      : null,
    children
  );

export const OptionRow = ({ selected, onClick, emoji, children }) =>
  h(
    'button',
    { type: 'button', className: 'row-opt' + (selected ? ' selected' : ''), onClick },
    emoji ? h('span', { style: { fontSize: 20, flex: 'none' } }, emoji) : null,
    h('span', { style: { flex: 1 } }, children),
    h('span', { className: 'check-round' }, h('i'))
  );

export const Toggle = ({ on, onToggle }) =>
  h(
    'button',
    { type: 'button', className: 'toggle' + (on ? ' on' : ''), onClick: onToggle, 'aria-pressed': !!on },
    h('span')
  );

export const Counter = ({ value, min, max, onChange }) => {
  const side = (sign, enabled, act) =>
    h(
      'button',
      {
        type: 'button',
        className: `round${enabled ? ' on' : ''}${sign === '+' ? ' plus' : ''}`,
        onClick: enabled ? act : undefined,
        'aria-label': sign === '+' ? 'Больше' : 'Меньше',
      },
      h('b'),
      sign === '+' ? h('b') : null
    );
  return h(
    'div',
    { className: 'counter' },
    side('−', value > min, () => onChange(Math.max(min, value - 1))),
    h('span', { className: 'value' }, value),
    side('+', value < max, () => onChange(Math.min(max, value + 1)))
  );
};

export const MiniStep = ({ value, min, max, onChange, format }) =>
  h(
    'div',
    { className: 'mini-step' },
    h('button', { type: 'button', disabled: value <= min, onClick: () => onChange(Math.max(min, value - 1)) }, '−'),
    h('span', null, format ? format(value) : value),
    h('button', { type: 'button', disabled: value >= max, onClick: () => onChange(Math.min(max, value + 1)) }, '+')
  );

export const PillSwitch = ({ options, value, onChange }) =>
  h(
    'div',
    { className: 'pill-row' },
    options.map((o) =>
      h(
        'button',
        { key: o.id, type: 'button', className: 'pill' + (o.id === value ? ' on' : ''), onClick: () => onChange(o.id) },
        o.name
      )
    )
  );

export const SegButton = ({ on, onClick, children }) =>
  h('button', { type: 'button', className: 'seg-btn' + (on ? ' on' : ''), onClick }, children);

export const WideTrack = ({ percent }) =>
  h('div', { className: 'track-wide' }, h('i', { style: { width: `${percent}%` } }));

/* ── Рецепт: состав и шаги ────────────────────────────────────────────── */
export function ingredientLines(recipe, factor = 1, portionsCount = 1) {
  return recipe.items.map(([id, g]) => {
    const p = BY_ID.get(id);
    const grams = Math.round(g * factor * portionsCount * 10) / 10;
    const amount =
      p?.unit === 'шт'
        ? `${Math.max(1, Math.round(grams / (p.unitG || 55)))} шт`
        : grams >= 1000
        ? `${(grams / 1000).toFixed(2).replace('.', ',')} кг`
        : `${grams} г`;
    return { id, name: p?.name || id, amount };
  });
}

/** Пошаговый рецепт собираем из состава и техники — без выдуманных деталей. */
export function recipeSteps(recipe) {
  const items = recipe.items.map(([id, g]) => ({ p: BY_ID.get(id), g })).filter((x) => x.p);
  const main = items.find((x) => ['prot'].includes(x.p.type));
  const grain = items.find((x) => x.p.type === 'grain');
  const veg = items.filter((x) => x.p.type === 'veg');
  const dairy = items.find((x) => x.p.type === 'dairy' && ['cream', 'sourcream', 'milk', 'cheese', 'feta'].includes(x.id));
  const fat = items.find((x) => ['oil', 'oliveoil', 'butter'].includes(x.id));
  const spice = items.find((x) => x.p.type === 'other' && ['soysauce', 'tomato_paste', 'honey', 'sugar'].includes(x.id));
  const steps = [];

  const prep = [];
  if (main) prep.push(`нарезать ${main.p.name.toLowerCase()} (${main.g} г)`);
  veg.forEach((v) => prep.push(`${v.p.name.toLowerCase()} — ${v.g} г`));
  if (prep.length) steps.push(`Подготовить продукты: ${prep.join(', ')}.`);

  if (recipe.meal === 'breakfast' && items.some((x) => x.id === 'egg')) {
    steps.push('Взбить яйца с молоком, посолить. Разогреть сковороду с маслом.');
    steps.push('Вылить смесь и готовить под крышкой 3–5 минут, пока верх не схватится.');
  } else if (recipe.meal === 'lunch' && (recipe.tags.includes('суп') || items.some((x) => x.id === 'veg_stock'))) {
    steps.push('Довести бульон до кипения, заложить продукты по плотности: сначала картофель и крупы.');
    steps.push('Через 10 минут добавить овощи и зажарку, варить до готовности 15–20 минут.');
  } else if (grain && main) {
    steps.push(`Отварить ${grain.p.name.toLowerCase()} (${grain.g} г) до готовности.`);
    steps.push('Обжарить основу на среднем огне 7–8 минут, посолить.');
    steps.push(`Соединить с гарниром${dairy ? `, влить ${dairy.p.name.toLowerCase()}` : ''} и прогреть вместе 3 минуты.`);
  } else if (grain) {
    steps.push(`Отварить/распарить ${grain.p.name.toLowerCase()} (${grain.g} г).`);
    if (veg.length) steps.push('Овощи нарезать и потушить 8–10 минут до мягкости.');
    steps.push('Соединить всё, приправить и дать настояться 5 минут.');
  } else if (main) {
    steps.push('Разогреть сковороду, выложить основу и готовить по 5–6 минут с каждой стороны.');
    if (veg.length) steps.push('Овощи обжарить отдельно или запечь 15 минут при 190 °C.');
  } else {
    steps.push('Смешать продукты, заправить по вкусу.');
  }

  if (spice) steps.push(`Заправить ${spice.p.name.toLowerCase()} по вкусу.`);
  if (fat && !steps.some((s) => s.includes('масл'))) steps.push(`Добавить ${fat.p.name.toLowerCase()} — ${fat.g} г.`);
  steps.push('Подавать сразу; излишки остудить и убрать в холодильник на 2–3 дня.');
  return steps;
}
