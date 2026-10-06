/**
 * Точка входа приложения: состояние квиза, переходы между экранами,
 * дневная/ночная тема и бесплатный результат без пейволла.
 */

import { h, loadState, saveState, clearState, applyTheme } from './ui.js';
import { makeScreens } from './screens.js';
import { ResultScreen } from './result.js';
import { buildPlan, DEFAULT_STORES } from './plan.js';

const STORAGE_KEY = 'racion-clone-v3';
const THEME_KEY = 'racion-clone-theme';

const INITIAL = {
  stores: DEFAULT_STORES,
  adults: 2,
  kids: [],
  meals: ['breakfast', 'lunch', 'dinner'],
  famMeals: ['fam-dinner'],
  budget: null,
  sex: 'f',
  diet: 'omni',
  likedProducts: [],
  allergies: [],
  dislikes: [],
  stopFoods: [],
  kitchen: ['stove', 'oven', 'micro'],
  age: 29,
  height: 164,
  weight: 63,
  goal: 'lose',
  target: 58,
  pace: 'sure',
  life: 2,
  cycle: null,
  periodDate: null,
  cycleLen: 28,
  normMode: 'balance',
  normAdjust: 0,
  coffee: null,
  drinks: ['latte'],
  cups: 2,
  spoons: 1,
  repeat: 2,
  days: ['wed', 'sat'],
};

const SCREENS = [
  'intro', 'people', 'meals', 'budget', 'sex', 'diet', 'tastes', 'allergy',
  'kitchen', 'calc', 'age', 'height', 'weight', 'goal', 'target', 'life', 'cycle',
  'period', 'norm', 'coffee', 'drinks', 'repeat', 'days', 'result',
];

const STEPS = [
  { id: 'people', label: 'Кто ест' },
  { id: 'meals', label: 'Приёмы пищи' },
  { id: 'budget', label: 'Бюджет' },
  { id: 'sex', label: 'Пол' },
  { id: 'diet', label: 'Тип питания' },
  { id: 'tastes', label: 'Любимые продукты' },
  { id: 'allergy', label: 'Аллергии' },
  { id: 'kitchen', label: 'Кухня' },
];

const Q_STEPS = [
  { id: 'age', label: 'Возраст' },
  { id: 'height', label: 'Рост' },
  { id: 'weight', label: 'Вес' },
  { id: 'goal', label: 'Цель' },
  { id: 'target', label: 'Целевой вес' },
  { id: 'life', label: 'Активность' },
  { id: 'norm', label: 'Норма КБЖУ' },
  { id: 'repeat', label: 'Повторы' },
  { id: 'days', label: 'Дни готовки' },
];

/** Ключ набора блюд: стабилен в пределах дня, чтобы меню не «прыгало». */
function makeSeed(s) {
  return [
    new Date().toISOString().slice(0, 10),
    s.adults, s.kids.join(','), s.sex, s.diet,
    [...s.meals].sort().join(','), [...s.famMeals].sort().join(','),
    [...s.allergies].sort().join(','), [...s.dislikes].sort().join(','),
    s.stopFoods.join(','), [...s.kitchen].sort().join(','),
    s.repeat, [...s.days].sort().join(','), [...s.likedProducts].sort().join('.'),
  ].join('|');
}

function preferredTheme() {
  const saved = loadState(THEME_KEY);
  if (saved === 'night' || saved === 'day') return saved;
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
  } catch {
    return 'day';
  }
}

function RacionApp() {
  const restored = React.useMemo(() => loadState(STORAGE_KEY), []);
  const url = React.useMemo(() => {
    try {
      return new URLSearchParams(location.search);
    } catch {
      return new URLSearchParams('');
    }
  }, []);
  const themeParam = url.get('theme');
  const forcedScreen = url.get('screen');
  const forcedLiked = (url.get('liked') || '')
    .split(',')
    .map((s) => s.trim())
    .filter((id) => id);

  const [theme, setTheme] = React.useState(() =>
    themeParam === 'night' || themeParam === 'day' ? themeParam : preferredTheme()
  );
  const [screen, setScreen] = React.useState(() =>
    SCREENS.includes(forcedScreen) ? forcedScreen : SCREENS.includes(restored?.screen) ? restored.screen : 'intro'
  );
  const [state, setState] = React.useState(() => {
    const base = { ...INITIAL, ...(restored?.state || {}), stores: DEFAULT_STORES };
    if (forcedLiked.length) base.likedProducts = forcedLiked;
    return base;
  });
  const [plan, setPlan] = React.useState(null);
  const history = React.useRef([]);

  // Тема: применяем к документу и запоминаем выбор.
  React.useEffect(() => {
    applyTheme(theme);
    saveState(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((t) => (t === 'night' ? 'day' : 'night'));
  }, []);

  React.useEffect(() => {
    saveState(STORAGE_KEY, { screen, state });
  }, [screen, state]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  const set = React.useCallback((patch) => {
    setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const go = React.useCallback((next) => {
    setScreen((cur) => {
      if (cur !== next) history.current.push(cur);
      return next;
    });
  }, []);

  const build = React.useCallback((s) => buildPlan({ ...s, budget: s.budget ?? undefined }), []);

  /** Собираем рацион и открываем результат — без оплаты. */
  const finish = React.useCallback(() => {
    setState((s) => {
      const next = { ...s, seed: makeSeed(s) };
      setPlan(build(next));
      return next;
    });
    setScreen('result');
  }, [build]);

  const finishQuestionnaire = finish;

  const refine = React.useCallback(() => go('age'), [go]);

  /** Начать сначала: спрашиваем подтверждение, чтобы не потерять рацион случайно. */
  const restart = React.useCallback(() => {
    const hasProgress = screen !== 'intro';
    if (hasProgress) {
      let ok = true;
      try {
        ok = window.confirm('Начать заново? Текущий рацион и ответы будут сброшены.');
      } catch {
        ok = true;
      }
      if (!ok) return;
    }
    clearState(STORAGE_KEY);
    setPlan(null);
    setState({ ...INITIAL, stores: DEFAULT_STORES });
    history.current = [];
    setScreen('intro');
  }, [screen]);

  React.useEffect(() => {
    const onPop = () => {
      const prev = history.current.pop();
      if (prev) setScreen(prev);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /**
   * Живое состояние для экранов. Сами компоненты создаём один раз (иначе React
   * пересоздаёт их и сбрасывает внутреннее состояние — активную вкладку, черновик
   * стоп-списка, бегунок), но читать они должны всегда актуальные данные.
   * Прокси поверх ref даёт и то, и другое.
   */
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const liveState = React.useMemo(
    () =>
      new Proxy(
        {},
        {
          get: (_, key) => stateRef.current[key],
          has: (_, key) => key in stateRef.current,
          ownKeys: () => Reflect.ownKeys(stateRef.current),
          getOwnPropertyDescriptor: (_, key) => ({
            value: stateRef.current[key],
            enumerable: true,
            configurable: true,
            writable: true,
          }),
        }
      ),
    []
  );

  // Экраны создаём один раз на стабильных зависимостях и живом состоянии.
  const screens = React.useMemo(
    () => makeScreens({ state: liveState, set, go, finish, finishQuestionnaire, theme, toggleTheme, restart, steps: STEPS, qSteps: Q_STEPS }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [liveState, set, go, finish, finishQuestionnaire, theme, toggleTheme, restart]
  );

  if (screen === 'result') {
    const current = plan || build(state);
    return h(ResultScreen, {
      plan: current,
      onRestart: restart,
      onRefine: refine,
      theme,
      onToggleTheme: toggleTheme,
      steps: STEPS,
      onGo: go,
    });
  }

  const View = screens[screen] || screens.intro;
  return h(View, null);
}

/** Запуск: рендерим приложение в #root. */
export function render() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(h(RacionApp));
}

render();

// Маркер для проверок: приложение смонтировалось.
setTimeout(() => {
  document.documentElement.setAttribute('data-app-ready', '1');
}, 0);
