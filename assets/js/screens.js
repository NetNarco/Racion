/**
 * Экраны квиза: интро → семья → приёмы пищи → бюджет → пол →
 * тип питания → любимые продукты → аллергии → кухня → расчёт → результат.
 *
 * Выбор магазинов убран: цены считаем по базовой корзине сетей.
 * Всё, что в оригинале было за пейволлом, здесь выдаётся бесплатно.
 */

import {
  h, Fragment, Screen, Title, Card, Grid, Cap, Note, Callout, OptionCard, OptionRow,
  Toggle, Counter, MiniStep, PillSwitch, SegButton, WideTrack, Button, Dock, plural, asset,
} from './ui.js';
import {
  STORES, DIETS, ALLERGENS, DISLIKES, KITCHEN, MEALS, LIFESTYLES, GOALS, PACES,
  SEX_OPTIONS, storeIndex, estimateBaseWeeklyCost, budgetLevel, servingScale, dailyKcal,
} from './plan.js';
import { RECIPES, choiceProducts, productEmoji } from './recipes.js';
import { PRODUCTS, AISLES, BY_ID } from './products.js';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEK_IDS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function makeScreens(ctx) {
  const { state, set, go, theme, toggleTheme, restart } = ctx;
  // Списки шагов приходят извне: их же показывает боковое меню навигации.
  const STEPS = ctx.steps || [];
  const Q_STEPS = ctx.qSteps || [];

  /** Общие пропсы для всех экранов: тема и кнопка «начать сначала». */
  const base = (extra = {}) => ({
    theme,
    onToggleTheme: toggleTheme,
    onRestart: restart,
    ...extra,
  });

  const quizProgress = (id) => {
    const idx = STEPS.findIndex((s) => s.id === id) + 1;
    return {
      filled: idx,
      total: STEPS.length,
      title: STEPS[idx - 1]?.label || '',
      counter: `Шаг ${idx} из ${STEPS.length}`,
      sideSteps: STEPS,
      sideCurrent: idx - 1,
      onGo: (stepId) => go(stepId),
    };
  };

  const qProgress = (id) => {
    const idx = Q_STEPS.findIndex((s) => s.id === id) + 1;
    return {
      filled: idx,
      total: Q_STEPS.length,
      title: Q_STEPS[idx - 1]?.label || '',
      counter: `${idx} / ${Q_STEPS.length}`,
      sideSteps: Q_STEPS,
      sideCurrent: idx - 1,
      onGo: (stepId) => go(stepId),
    };
  };

  const toggleIn = (key, id) =>
    set((s) => {
      const list = s[key] || [];
      return { [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    });

  const storeNames = STORES.map((s) => s.name).join(', ');

  /* ── 0. Интро ───────────────────────────────────────────────────────── */
  function Intro() {
    const features = [
      { emoji: '🛒', title: 'Меню из того, что едите', text: 'Отмечаете любимые продукты — блюда собираются вокруг них.' },
      { emoji: '🧮', title: 'Норма КБЖУ и порции', text: 'Расчёт под ваш пол, вес, рост, возраст и активность.' },
      { emoji: '💸', title: 'Список покупок в рублях', text: 'Корзина по отделам магазина и общая сумма на неделю.' },
      { emoji: '🏋️', title: 'План активности', text: 'Неделя тренировок под вашу цель — тоже бесплатно.' },
    ];
    return h(
      Screen,
      base({ showNav: false, noSide: true, ctaLabel: 'Собрать рацион', onCta: () => go('people') }),
      h(
        'div',
        { className: 'intro' },
        h(
          'h1',
          null,
          'Рацион на неделю ',
          h('em', null, 'под вашу жизнь')
        ),
        h(
          'p',
          { className: 'lead' },
          'Ответьте на 7 коротких вопросов — получите готовое меню на 7 дней, норму калорий, список покупок с ценами и план тренировок.'
        ),
        h(
          'div',
          { className: 'intro-features' },
          features.map((f) =>
            h(
              'div',
              { className: 'feature', key: f.title },
              h('span', { className: 'ic' }, f.emoji),
              h(
                'div',
                null,
                h('div', { className: 'ft' }, f.title),
                h('div', { className: 'fd' }, f.text)
              )
            )
          )
        ),
        h(
          'div',
          { className: 'intro-stats' },
          h('span', { className: 'intro-stat' }, h('b', null, '104'), ' блюда в базе'),
          h('span', { className: 'intro-stat' }, h('b', null, '80'), ' продуктов на выбор'),
          h('span', { className: 'intro-stat' }, h('b', null, '2'), ' минуты на ответы')
        )
      )
    );
  }

  /* ── 1. Кто ест ─────────────────────────────────────────────────────── */
  function People() {
    const kids = state.kids;
    const total = state.adults + kids.length;
    const hasKids = kids.length > 0;
    return h(
      Screen,
      base({ progress: quizProgress('people'), ctaLabel: 'Далее', onCta: () => go('meals') }),
      h(Title, { title: 'Кто будет кушать?', sub: 'От этого зависят порции и объём закупки.' }),
      h(
        Card,
        null,
        h('div', { className: 'label-cap', style: { textAlign: 'center' } }, 'Взрослые'),
        h(Counter, { value: state.adults, min: 1, max: 8, onChange: (v) => set({ adults: v }) }),
        h('div', { style: { textAlign: 'center', fontSize: 13, fontWeight: 500, color: 'var(--muted-2)', marginTop: 10 } },
          'Влияет на размер порций и объём закупки')
      ),
      h('div', { className: 'spacer-10' }),
      h(
        Card,
        { compact: true },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },
          h(
            'div',
            null,
            h('div', { style: { fontSize: 15.5, fontWeight: 800 } }, 'Есть дети?'),
            h('div', { style: { fontSize: 13, fontWeight: 500, color: 'var(--muted-2)', marginTop: 2 } }, 'Порции меньше, меню мягче')
          ),
          h(Toggle, { on: hasKids, onToggle: () => set({ kids: hasKids ? [] : [5] }) })
        )
      ),
      hasKids
        ? h(
            Fragment,
            null,
            h('div', { className: 'spacer-10' }),
            h(
              Card,
              { compact: true, className: 'fade-up', style: { padding: '6px 16px' } },
              kids.map((age, i) =>
                h(
                  'div',
                  {
                    key: i,
                    style: {
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                      padding: '12px 0', borderTop: i > 0 ? '1px solid var(--line-3)' : undefined,
                    },
                  },
                  h('span', { style: { fontSize: 15, fontWeight: 700 } }, `Ребёнок ${i + 1}`),
                  h(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                    h(MiniStep, {
                      value: age,
                      min: 1,
                      max: 17,
                      onChange: (v) => set({ kids: kids.map((x, j) => (j === i ? v : x)) }),
                      format: (v) => `${v} ${plural(v, 'год', 'года', 'лет')}`,
                    }),
                    h(
                      'button',
                      {
                        type: 'button',
                        onClick: () => set({ kids: kids.filter((_, j) => j !== i) }),
                        'aria-label': 'Убрать ребёнка',
                        style: {
                          width: 28, height: 28, borderRadius: 9, border: 'none',
                          background: 'var(--danger-bg)', color: 'var(--danger)',
                          cursor: 'pointer', fontSize: 15, lineHeight: 1, flex: 'none',
                        },
                      },
                      '×'
                    )
                  )
                )
              ),
              kids.length < 8
                ? h(
                    'button',
                    {
                      type: 'button',
                      onClick: () => set({ kids: [...kids, 5] }),
                      style: {
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 0',
                        border: 'none', borderTop: '1px solid var(--line-3)', background: 'transparent',
                        fontSize: 14.5, fontWeight: 800, color: 'var(--accent)', cursor: 'pointer',
                      },
                    },
                    h(
                      'span',
                      {
                        style: {
                          width: 24, height: 24, borderRadius: '50%', background: 'var(--grad-soft)',
                          color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, fontWeight: 800, flex: 'none',
                        },
                      },
                      '+'
                    ),
                    'Добавить ребёнка'
                  )
                : null
            )
          )
        : null,
      h('div', { className: 'spacer-12' }),
      h(Note, {
        emoji: '🍽',
        title: total === 1 ? 'Готовим на одного' : `Готовим на ${total} ${plural(total, 'человека', 'человек', 'человек')}`,
      }, total === 1 ? 'Каждое блюдо — одна порция, без остатков.' : `Общие блюда готовим сразу на ${total} порции.`)
    );
  }

  /* ── 2. Приёмы пищи ─────────────────────────────────────────────────── */
  function Meals() {
    const rows = (scope) =>
      MEALS.map((m, i) => {
        const key = scope === 'meals' ? m.id : 'fam-' + m.id;
        const on = state[scope].includes(key);
        return h(
          'button',
          {
            key: m.id,
            type: 'button',
            onClick: () => toggleIn(scope, key),
            style: {
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '15px 0',
              border: 'none', borderTop: i > 0 ? '1px solid var(--line-3)' : undefined,
              background: 'transparent', cursor: 'pointer', textAlign: 'left',
            },
          },
          h('span', { style: { fontSize: 19, flex: 'none' } }, m.emoji),
          h(
            'span',
            {
              style: {
                flex: 1, fontSize: 15.5, fontWeight: on ? 800 : 600,
                color: on ? 'var(--ink)' : 'var(--muted)',
              },
            },
            scope === 'meals' ? m.name : m.famName
          ),
          h(
            'span',
            {
              style: {
                flex: 'none', width: 24, height: 24, borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: on ? 'var(--grad)' : 'var(--surface-3)',
                border: on ? 'none' : '1.5px solid var(--line-2)',
              },
            },
            on
              ? h('span', {
                  style: {
                    display: 'block', width: 9, height: 5, borderLeft: '2px solid var(--accent-ink)',
                    borderBottom: '2px solid var(--accent-ink)', transform: 'rotate(-45deg) translateY(-1px)',
                  },
                })
              : null
          )
        );
      });
    return h(
      Screen,
      base({ progress: quizProgress('meals'), ctaLabel: 'Далее', onCta: () => go('budget') }),
      h(Title, { title: 'Сколько приёмов пищи в день?', sub: 'Отметьте, что готовите только себе, а что — на всю семью.' }),
      h(Cap, null, 'Ты'),
      h(Card, { compact: true, tight: true }, rows('meals')),
      h('div', { className: 'spacer-16' }),
      h(Cap, null, 'Семья'),
      h(Card, { compact: true, tight: true }, rows('famMeals')),
      h('div', { className: 'spacer-12' }),
      h(Note, { emoji: '⏰' },
        state.famMeals.length
          ? 'Общие приёмы готовим сразу на всех, остальное — одной порцией для вас.'
          : 'Всё меню будет только на вас — без общих блюд.')
    );
  }

  /* ── 3. Бюджет ──────────────────────────────────────────────────────── */
  function Budget() {
    const peopleCount = state.adults + state.kids.length;
    const min = Math.max(1000, Math.round(estimateBaseWeeklyCost(state) / 50) * 50);
    const max = 30000;
    const comfortable = Math.min(max, Math.max(min, 250 * Math.ceil((1.2 * min) / 250)));
    const value = state.budget ?? comfortable;
    const perPerson = value / Math.max(1, peopleCount);
    const level = budgetLevel(perPerson);
    const step = 50;
    const percent = Math.max(0, Math.min(100, ((value - min) / Math.max(1, max - min)) * 100));
    const perPersonRound = Math.round(perPerson / step) * step;

    const setFromClient = (clientX, el) => {
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const snapped = Math.max(min, Math.min(max, Math.round((min + ratio * (max - min)) / step) * step));
      set({ budget: snapped });
    };

    return h(
      Screen,
      base({ progress: quizProgress('budget'), ctaLabel: 'Далее', onCta: () => go('sex') }),
      h(Title, { title: 'Бюджет на неделю', sub: 'Не будем предлагать то, что в него не влезет.' }),
      h(
        'div',
        { style: { textAlign: 'center', marginBottom: 16 } },
        h(
          'div',
          { className: 'budget-value' },
          h('input', {
            type: 'text',
            inputMode: 'numeric',
            'aria-label': 'Бюджет на неделю, ₽',
            value: String(value),
            onChange: (e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
              set({ budget: digits ? Math.max(0, parseInt(digits, 10)) : null });
            },
            style: { width: `${Math.max(2, String(value).length + 1)}ch`, minWidth: 40 },
          }),
          h('span', { 'aria-hidden': true }, '₽')
        ),
        h('div', { style: { fontSize: 14, fontWeight: 600, color: 'var(--muted-2)', marginTop: 6 } },
          `≈ ${perPersonRound.toLocaleString('ru-RU')} ₽ на человека в неделю`)
      ),
      h(
        'div',
        { style: { textAlign: 'center', marginBottom: 14 } },
        h('div', { style: { fontSize: 19, fontWeight: 800 } }, level.name),
        h('div', { style: { fontSize: 14, fontWeight: 500, color: 'var(--muted-2)', marginTop: 3 } }, level.sub)
      ),
      h(
        'div',
        {
          className: 'range',
          onPointerDown: (e) => {
            if (!e.isPrimary) return;
            e.currentTarget.setPointerCapture?.(e.pointerId);
            setFromClient(e.clientX, e.currentTarget);
          },
          onPointerMove: (e) => {
            if (e.buttons) setFromClient(e.clientX, e.currentTarget);
          },
        },
        h(
          'div',
          { className: 'track' },
          h('div', { className: 'fill', style: { width: `${percent}%` } }),
          h('div', { className: 'knob', style: { left: `${percent}%` } })
        )
      ),
      h(
        'div',
        { className: 'range-legend' },
        h('span', null, `${min.toLocaleString('ru-RU')} ₽`, h('small', null, `минимум на ${peopleCount}`)),
        h('span', null, `${max.toLocaleString('ru-RU')} ₽+`)
      ),
      value < comfortable
        ? h(Callout, { kind: 'warn', emoji: '⚠️', title: 'Бюджет впритык' },
            `Уложимся, но выбор блюд сузится. На ${peopleCount} ${plural(peopleCount, 'человека', 'человек', 'человек')} комфортно от ${comfortable.toLocaleString('ru-RU')} ₽ в неделю.`)
        : h(Callout, { kind: 'ok', emoji: '✅', title: 'Хороший бюджет' },
            value > comfortable * 1.6
              ? 'Хватит с запасом — сможем добавить рыбу, фрукты и заготовки впрок.'
              : `Выйдет «${level.name.toLowerCase()}» корзина: ${level.sub.toLowerCase()}.`)
    );
  }

  /* ── 4. Пол ─────────────────────────────────────────────────────────── */
  function Sex() {
    return h(
      Screen,
      base({ progress: quizProgress('sex'), ctaLabel: 'Далее', onCta: () => go('diet') }),
      h(Title, { title: 'Для кого считаем норму?', sub: 'Формула калорий различается для женщин и мужчин. Можно взять среднее на двоих.' }),
      h(
        Grid,
        { cols: 3, gap: 9 },
        SEX_OPTIONS.map((o) =>
          h(
            OptionCard,
            {
              key: o.id,
              selected: state.sex === o.id,
              onClick: () => set({ sex: o.id }),
              minHeight: 140,
              gap: 8,
              showCheck: false,
            },
            h('span', { style: { fontSize: 38 } }, o.emoji),
            h('span', { style: { fontSize: 14, fontWeight: state.sex === o.id ? 800 : 600, color: state.sex === o.id ? 'var(--accent)' : 'var(--ink-2)' } }, o.name),
            h('span', { style: { fontSize: 11, fontWeight: 600, color: 'var(--muted-3)', marginTop: -4 } }, o.sub)
          )
        )
      ),
      h('div', { className: 'spacer-12' }),
      h(Note, { emoji: 'ℹ️' },
        state.sex === 'both'
          ? 'Считаем среднее между женской и мужской формулой — удобно, если рацион общий.'
          : 'Нужно только для расчёта дневной нормы калорий.')
    );
  }

  /* ── 5. Тип питания ─────────────────────────────────────────────────── */
  function Diet() {
    return h(
      Screen,
      base({ progress: quizProgress('diet'), ctaLabel: 'Далее', onCta: () => go('tastes') }),
      h(Title, { title: 'Какой тип питания?', sub: 'Это поможет подобрать подходящие блюда.' }),
      h(
        Grid,
        { cols: 2, gap: 8 },
        DIETS.map((d) =>
          h(
            OptionCard,
            {
              key: d.id,
              selected: state.diet === d.id,
              onClick: () => set({ diet: d.id }),
              minHeight: 124,
              gap: 8,
              showCheck: false,
            },
            h('span', { style: { fontSize: 30 } }, d.emoji),
            h('span', { style: { fontSize: 15, fontWeight: state.diet === d.id ? 800 : 700, color: state.diet === d.id ? 'var(--accent)' : 'var(--ink-2)' } }, d.name),
            h('span', { style: { fontSize: 11.5, fontWeight: 600, color: 'var(--muted-3)', marginTop: -4 } }, d.sub)
          )
        )
      )
    );
  }

  /* ── 6. Любимые продукты ────────────────────────────────────────────── */
  function Tastes() {
    const groups = React.useMemo(
      () => AISLES.map((a) => ({ ...a, items: choiceProducts(PRODUCTS).filter((p) => p.type === a.id) })).filter((g) => g.items.length),
      []
    );
    const [group, setGroup] = React.useState(groups[0]?.id || 'prot');
    const liked = state.likedProducts;
    const current = groups.find((g) => g.id === group) || groups[0];
    const pickedGroups = groups.filter((g) => g.items.some((p) => liked.includes(p.id))).map((g) => g.name.toLowerCase());

    const toggleAll = () => {
      const ids = current.items.map((p) => p.id);
      const allPicked = ids.every((id) => liked.includes(id));
      set((s) => ({
        likedProducts: allPicked
          ? s.likedProducts.filter((id) => !ids.includes(id))
          : [...new Set([...s.likedProducts, ...ids])],
      }));
    };

    return h(
      Screen,
      base({
        progress: quizProgress('tastes'),
        ctaLabel: 'Далее',
        onCta: () => go('allergy'),
        topExtra: liked.length
          ? h('span', { className: 'text-btn', style: { cursor: 'default' } }, `Выбрано: ${liked.length}`)
          : null,
      }),
      h(Title, {
        title: 'Что вы любите из продуктов?',
        sub: 'Отметьте то, что обычно покупаете и едите: блюда с этими продуктами встанут в меню первыми.',
        mbSub: 14,
      }),
      h(
        'div',
        { className: 'cat-tabs' },
        groups.map((g) =>
          h(
            'button',
            {
              key: g.id,
              type: 'button',
              className: 'cat-tab' + (g.id === group ? ' on' : ''),
              onClick: () => setGroup(g.id),
            },
            h('span', null, g.emoji),
            h('span', null, g.name.split(',')[0]),
            g.items.some((p) => liked.includes(p.id)) ? h('span', { className: 'cat-dot' }) : null
          )
        )
      ),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 } },
        h('span', { className: 'label-cap', style: { marginBottom: 0 } }, current.name),
        h(
          'button',
          {
            type: 'button',
            onClick: toggleAll,
            style: {
              border: 'none', background: 'transparent', fontSize: 12.5, fontWeight: 800,
              color: 'var(--accent)', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap',
            },
          },
          current.items.every((p) => liked.includes(p.id)) ? 'снять всё' : 'выбрать всё'
        )
      ),
      h(
        'div',
        { className: 'prod-grid' },
        current.items.map((p) => {
          const on = liked.includes(p.id);
          return h(
            'button',
            {
              key: p.id,
              type: 'button',
              className: 'prod-card' + (on ? ' selected' : ''),
              onClick: () => toggleIn('likedProducts', p.id),
              'aria-pressed': on,
            },
            on ? h('span', { className: 'check', style: { width: 17, height: 17 } }, h('i')) : null,
            h('span', { className: 'prod-emoji' }, productEmoji(p.id)),
            h('span', { className: 'prod-name' }, p.name),
            h('span', { className: 'prod-kcal' }, `${p.kcal} ккал/100 г`)
          );
        })
      ),
      h('div', { className: 'spacer-14' }),
      h(
        'div',
        { className: 'prod-hint' },
        liked.length
          ? `Отмечено ${liked.length} ${plural(liked.length, 'продукт', 'продукта', 'продуктов')}${pickedGroups.length ? ' · ' + pickedGroups.join(', ') : ''}`
          : 'Пока ничего не отмечено — соберём меню из сбалансированного набора.'
      ),
      h('div', { className: 'spacer-12' }),
      h(Note, { emoji: '🛒' },
        `Цены и ассортимент считаем по сетям: ${storeNames}. Аллергии и стоп-список на следующем шаге важнее симпатий.`)
    );
  }

  /* ── 7. Аллергии и стоп-лист ────────────────────────────────────────── */
  function Allergy() {
    const [draft, setDraft] = React.useState('');
    const hasLatin = /[A-Za-z]/.test(draft);
    const cell = (item, selected, onClick) =>
      h(
        OptionCard,
        { key: item.id, selected, onClick, minHeight: 78, padding: '10px 4px', gap: 6, radius: 14, checkSize: 15 },
        h('span', { style: { fontSize: 22 } }, item.emoji),
        h('span', { style: { fontSize: 11, fontWeight: selected ? 800 : 600 } }, item.name)
      );
    const addStop = () => {
      const val = draft.trim();
      if (!val || hasLatin) return;
      set((s) => (s.stopFoods.some((x) => x.toLowerCase() === val.toLowerCase()) ? {} : { stopFoods: [...s.stopFoods, val] }));
      setDraft('');
    };
    return h(
      Screen,
      base({
        progress: quizProgress('allergy'),
        ctaLabel: 'Далее',
        onCta: () => {
          addStop();
          go('kitchen');
        },
      }),
      h(Title, { title: 'Аллергии и ограничения', sub: 'Отметьте всё, что не должно попасть в меню — это важнее любимых продуктов.' }),
      h(Cap, null, 'Аллергии'),
      h(Grid, { cols: 4 }, ALLERGENS.map((a) => cell(a, state.allergies.includes(a.id), () => toggleIn('allergies', a.id)))),
      h('div', { className: 'spacer-16' }),
      h(Cap, null, 'Не люблю'),
      h(Grid, { cols: 4 }, DISLIKES.map((d) => cell(d, state.dislikes.includes(d.id), () => toggleIn('dislikes', d.id)))),
      h('div', { className: 'spacer-16' }),
      h(Cap, null, 'Чего-то не хватает?'),
      h(
        'div',
        { style: { display: 'flex', gap: 8 } },
        h('input', {
          type: 'text',
          value: draft,
          maxLength: 40,
          placeholder: 'Напишите продукт — добавим в стоп-список',
          onChange: (e) => setDraft(e.target.value),
          onKeyDown: (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addStop();
            }
          },
          style: {
            flex: 1, background: 'var(--surface)', borderRadius: 15, padding: '14px 15px',
            fontSize: 15.5, fontWeight: 600, outline: 'none', minWidth: 0, color: 'var(--ink)',
            border: hasLatin ? '2px solid var(--danger)' : draft.trim() ? '2px solid var(--accent-2)' : '1.5px solid var(--line-2)',
          },
        }),
        h(
          'button',
          {
            type: 'button',
            onClick: addStop,
            'aria-label': 'Добавить',
            style: {
              flex: 'none', width: 52, height: 52, borderRadius: 15, border: 'none', fontSize: 24, fontWeight: 800,
              cursor: draft.trim() && !hasLatin ? 'pointer' : 'default',
              background: draft.trim() && !hasLatin ? 'var(--grad)' : 'var(--surface-3)',
              color: draft.trim() && !hasLatin ? 'var(--accent-ink)' : 'var(--muted-3)',
            },
          },
          '+'
        )
      ),
      hasLatin ? h('div', { style: { marginTop: 8, fontSize: 13, fontWeight: 700, color: 'var(--danger)' } }, 'Пожалуйста, пишите продукты на русском языке') : null,
      state.stopFoods.length
        ? h(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 } },
            state.stopFoods.map((f) =>
              h(
                'button',
                {
                  key: f,
                  type: 'button',
                  onClick: () => set((s) => ({ stopFoods: s.stopFoods.filter((x) => x !== f) })),
                  className: 'chip',
                },
                f,
                h('span', { style: { fontSize: 12, fontWeight: 800, opacity: 0.75 } }, '✕')
              )
            )
          )
        : null
    );
  }

  /* ── 8. Кухня ───────────────────────────────────────────────────────── */
  function Kitchen() {
    return h(
      Screen,
      base({ progress: quizProgress('kitchen'), ctaLabel: 'Посчитать рацион', onCta: () => go('calc') }),
      h(Title, { title: 'Что есть на кухне?', sub: 'Отметьте всё, чем реально готовите. Рецепты подберём только под это.' }),
      h(
        Grid,
        { cols: 2, gap: 9 },
        KITCHEN.map((k) => {
          const selected = state.kitchen.includes(k.id);
          return h(
            OptionCard,
            { key: k.id, selected, onClick: () => toggleIn('kitchen', k.id), minHeight: 92 },
            h('span', { style: { fontSize: 25 } }, k.emoji),
            h('span', { style: { fontSize: 13.5, fontWeight: selected ? 800 : 600 } }, k.name)
          );
        })
      ),
      h('div', { className: 'spacer-16' }),
      h(Note, { emoji: '💡' }, 'Ничего не отмечать — тоже вариант: соберём меню из блюд без готовки.')
    );
  }

  /* ── 9. Анализ ──────────────────────────────────────────────────────── */
  const ANALYSIS_STEPS = ['Сверяем настройки', 'Подбираем блюда', 'Считаем корзину', 'Рацион готов'];

  function Calc() {
    const [stage, setStage] = React.useState(0);
    React.useEffect(() => {
      const timers = [900, 1800, 2700, 3500].map((ms, i) => setTimeout(() => setStage(i + 1), ms));
      return () => timers.forEach(clearTimeout);
    }, []);
    React.useEffect(() => {
      if (stage >= 4) {
        const t = setTimeout(() => ctx.finish(), 420);
        return () => clearTimeout(t);
      }
    }, [stage]);
    const percent = Math.round((Math.min(4, stage) / 4) * 100);
    return h(
      Screen,
      { theme, onToggleTheme: toggleTheme, onRestart: restart, showNav: false, bottomPad: 40, dock: null },
      h(
        'div',
        { className: 'analyze' },
        h('div', { className: 'orb' }, '🥗'),
        h('h1', null, stage >= 3 ? 'Почти готово…' : 'Собираем рацион…'),
        h('p', null, stage >= 3 ? 'Составляем список покупок' : 'Подбираем блюда под бюджет и продукты'),
        h(
          Card,
          { style: { width: '100%', textAlign: 'left', padding: '4px 16px' } },
          ANALYSIS_STEPS.map((label, i) =>
            h(
              'div',
              { key: label, className: 'check-row' + (stage > i ? ' done' : stage === i ? ' now' : '') },
              h('span', { className: 'dot' }, stage > i ? '✓' : ''),
              h('span', { className: 'text' }, label)
            )
          )
        ),
        h('div', { className: 'spacer-20' }),
        h('div', { style: { width: '100%' } }, h(WideTrack, { percent }))
      )
    );
  }

  /* ── 10. Опциональная анкета КБЖУ ───────────────────────────────────── */
  const qBase = (id, extra = {}) => ({
    theme,
    onToggleTheme: toggleTheme,
    onRestart: restart,
    topExtra: h(
      'button',
      {
        type: 'button',
        className: 'text-btn',
        onClick: () => ctx.finishQuestionnaire(),
        title: 'Вернуться к рациону',
      },
      '← К рациону'
    ),
    ...extra,
  });

  /** Линейка со «щелчками» — для роста и веса. */
  function Ruler({ value, min, max, onChange, unit, valueSize = 62 }) {
    const drag = React.useRef(null);
    const [ghost, setGhost] = React.useState(null);
    const shown = ghost ?? value;
    const ticks = [];
    for (let v = Math.max(min, Math.floor(shown - 20)); v <= Math.min(max, Math.ceil(shown + 20)); v++) ticks.push(v);
    return h(
      'div',
      { style: { textAlign: 'center' } },
      h(
        'div',
        { style: { marginBottom: 20 } },
        h('span', { style: { fontSize: valueSize, fontWeight: 900, letterSpacing: '-2.4px', color: 'var(--accent)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' } }, Math.round(shown)),
        h('span', { style: { fontSize: 22, fontWeight: 800, color: 'var(--accent)', marginLeft: 8 } }, unit)
      ),
      h(
        'div',
        {
          onPointerDown: (e) => {
            drag.current = { x: e.clientX, from: shown };
            e.currentTarget.setPointerCapture(e.pointerId);
          },
          onPointerMove: (e) => {
            if (!drag.current) return;
            const next = Math.min(max, Math.max(min, drag.current.from - (e.clientX - drag.current.x) / 13));
            setGhost(next);
            const r = Math.round(next);
            if (r !== value) onChange(r);
          },
          onPointerUp: () => { drag.current = null; setGhost(null); },
          onPointerCancel: () => { drag.current = null; setGhost(null); },
          style: {
            position: 'relative', height: 104, overflow: 'hidden', background: 'var(--surface-3)',
            borderRadius: 18, touchAction: 'pan-y', cursor: 'grab', userSelect: 'none',
          },
        },
        ticks.map((t) => {
          const major = t % 5 === 0;
          const offset = (t - shown) * 13;
          return h(
            'div',
            {
              key: t,
              style: {
                position: 'absolute', left: `calc(50% + ${offset}px)`, top: 18, transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none',
              },
            },
            h('span', {
              style: {
                display: 'block', width: major ? 2.5 : 1.5, height: major ? 34 : 18, borderRadius: 2,
                background: major ? 'var(--muted-3)' : 'var(--line-2)',
              },
            }),
            major
              ? h('span', {
                  style: {
                    marginTop: 8, fontSize: 12, fontWeight: t === Math.round(shown) ? 900 : 700,
                    color: t === Math.round(shown) ? 'var(--accent)' : 'var(--muted-3)',
                  },
                }, t)
              : null
          );
        }),
        h('span', {
          style: {
            position: 'absolute', left: '50%', top: 12, transform: 'translateX(-50%)', width: 3, height: 46,
            borderRadius: 2, background: 'var(--grad)', pointerEvents: 'none',
          },
        }),
        ['left', 'right'].map((side) =>
          h('span', {
            key: side,
            style: {
              position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 48, pointerEvents: 'none',
              background: `linear-gradient(to ${side === 'left' ? 'right' : 'left'}, var(--surface-3), transparent)`,
            },
          })
        )
      ),
      h('div', { style: { marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--muted-3)' } }, 'Потяните линейку')
    );
  }

  function Age() {
    const [value, setValue] = React.useState(state.age);
    const drag = React.useRef(null);
    const [ghost, setGhost] = React.useState(null);
    const shown = ghost ?? value;
    const list = [];
    for (let a = Math.max(14, Math.round(shown) - 4); a <= Math.min(90, Math.round(shown) + 4); a++) list.push(a);
    const sizeFor = (d) => (d === 0 ? 34 : d === 1 ? 25 : d === 2 ? 21 : 18);
    const colorFor = (d) => (d === 0 ? 'var(--accent)' : d === 1 ? 'var(--muted)' : 'var(--muted-3)');
    return h(
      Screen,
      qBase('age', { progress: qProgress('age'), ctaLabel: 'Далее', onCta: () => { set({ age: value }); go('height'); } }),
      h(Title, { title: 'Сколько вам лет?', sub: 'Потяните список, чтобы выбрать.' }),
      h(
        'div',
        {
          style: { position: 'relative', background: 'var(--surface-3)', borderRadius: 20 },
          onPointerDown: (e) => {
            drag.current = { x: e.clientX, from: shown };
            e.currentTarget.setPointerCapture(e.pointerId);
          },
          onPointerMove: (e) => {
            if (!drag.current) return;
            const next = Math.min(90, Math.max(14, drag.current.from - (e.clientX - drag.current.x) / 13));
            setGhost(next);
            const r = Math.round(next);
            if (r !== value) setValue(r);
          },
          onPointerUp: () => { drag.current = null; setGhost(null); },
          onPointerCancel: () => { drag.current = null; setGhost(null); },
        },
        h('div', {
          style: {
            position: 'absolute', left: 20, right: 20, top: '50%', transform: 'translateY(-50%)', height: 64,
            borderRadius: 18, background: 'var(--accent-soft)', border: '2px solid var(--accent-2)', pointerEvents: 'none',
          },
        }),
        h(
          'div',
          { style: { position: 'relative', height: 7 * 54, overflow: 'hidden', userSelect: 'none', cursor: 'grab', touchAction: 'pan-y' } },
          list.map((a, i) => {
            const d = Math.abs(a - shown);
            const offset = (i - (list.length - 1) / 2) * 54 + (Math.round(shown) - shown) * 54;
            return h(
              'div',
              {
                key: a,
                style: {
                  position: 'absolute', left: 0, right: 0, height: 54, top: `calc(50% + ${offset}px)`,
                  transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: sizeFor(d), fontWeight: 700, color: colorFor(d),
                  transition: ghost ? 'none' : 'top .18s ease',
                },
              },
              a
            );
          })
        ),
        ['top', 'bottom'].map((pos) =>
          h('span', {
            key: pos,
            style: {
              position: 'absolute', left: 0, right: 0, [pos]: 0, height: 104, borderRadius: 20, pointerEvents: 'none',
              background: `linear-gradient(to ${pos === 'top' ? 'bottom' : 'top'}, var(--surface-3), transparent)`,
            },
          })
        )
      )
    );
  }

  function Height() {
    const [v, setV] = React.useState(state.height);
    return h(
      Screen,
      qBase('height', { progress: qProgress('height'), ctaLabel: 'Далее', onCta: () => { set({ height: v }); go('weight'); } }),
      h('h1', { className: 'title', style: { marginBottom: 40 } }, 'Какой у вас рост?'),
      h(Ruler, { value: v, min: 140, max: 210, onChange: setV, unit: 'см' })
    );
  }

  function Weight() {
    const [v, setV] = React.useState(state.weight);
    return h(
      Screen,
      qBase('weight', {
        progress: qProgress('weight'),
        ctaLabel: 'Далее',
        onCta: () => {
          const target = state.goal === 'lose' ? v - 5 : state.goal === 'gain' ? v + 5 : v;
          set({ weight: v, target });
          go('goal');
        },
      }),
      h('h1', { className: 'title', style: { marginBottom: 40 } }, 'Какой у вас вес?'),
      h(Ruler, { value: v, min: 40, max: 160, onChange: setV, unit: 'кг' })
    );
  }

  function Goal() {
    return h(
      Screen,
      qBase('goal', { progress: qProgress('goal'), ctaLabel: 'Далее', onCta: () => go('target') }),
      h(Title, { title: 'Какая у вас цель?' }),
      h(
        Grid,
        { cols: 3, gap: 9 },
        GOALS.map((g) =>
          h(
            OptionCard,
            {
              key: g.id,
              selected: state.goal === g.id,
              onClick: () =>
                set({
                  goal: g.id,
                  target: g.id === 'lose' ? state.weight - 5 : g.id === 'gain' ? state.weight + 5 : state.weight,
                }),
              minHeight: 116,
              gap: 8,
              showCheck: false,
            },
            h('span', { style: { fontSize: 29 } }, g.emoji),
            h('span', { style: { fontSize: 12.5, fontWeight: state.goal === g.id ? 800 : 600, color: state.goal === g.id ? 'var(--accent)' : 'var(--ink-2)', lineHeight: 1.25 } }, g.name)
          )
        )
      )
    );
  }

  function Target() {
    const goal = state.goal;
    const bounds =
      goal === 'lose'
        ? { min: Math.max(40, state.weight - 30), max: state.weight }
        : goal === 'gain'
        ? { min: state.weight, max: Math.min(160, state.weight + 20) }
        : { min: Math.max(40, state.weight - 30), max: Math.min(160, state.weight + 5) };
    const target = Math.min(bounds.max, Math.max(bounds.min, state.target));
    const paceObj = PACES.find((p) => p.id === state.pace) || PACES[1];
    const weeks = Math.max(1, Math.ceil(Math.max(Number(goal !== 'keep'), Math.abs(state.weight - target)) / paceObj.kg));
    const eta = new Date(Date.now() + weeks * 7 * 864e5);
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const headline =
      goal === 'lose'
        ? `Сбросить ${Math.round(Math.abs(state.weight - target))} кг — реально к`
        : goal === 'gain'
        ? `Набрать ${Math.round(Math.abs(target - state.weight))} кг — реально к`
        : 'Удержать вес — план до';
    return h(
      Screen,
      qBase('target', { progress: qProgress('target'), ctaLabel: 'Далее', onCta: () => go('life') }),
      h('h1', { className: 'title', style: { marginBottom: 28 } },
        goal === 'lose' ? 'К какому весу хотите прийти?' : goal === 'keep' ? 'В каком весе держимся?' : 'До какого веса хотите дойти?'),
      h(Ruler, { value: target, min: bounds.min, max: bounds.max, onChange: (v) => set({ target: v }), unit: 'кг', valueSize: 54 }),
      h('div', { style: { height: 22 } }),
      h(Cap, null, goal === 'lose' ? 'Темп снижения' : goal === 'gain' ? 'Темп набора' : 'Коридор веса'),
      h(
        Grid,
        { cols: 3, gap: 9 },
        PACES.map((p) =>
          h(
            OptionCard,
            {
              key: p.id,
              selected: state.pace === p.id,
              onClick: () => set({ pace: p.id }),
              minHeight: 86,
              gap: 4,
              showCheck: false,
            },
            h('span', { style: { fontSize: 13.5, fontWeight: state.pace === p.id ? 800 : 700, color: state.pace === p.id ? 'var(--accent)' : 'var(--ink-2)' } }, p.name),
            h('span', { style: { fontSize: 15, fontWeight: 900, color: state.pace === p.id ? 'var(--accent)' : 'var(--ink)' } },
              `${goal === 'gain' ? '+' : '−'}${String(p.kg).replace('.', ',')} кг`),
            h('span', { style: { fontSize: 11, fontWeight: 600, color: 'var(--muted-3)' } }, 'в неделю')
          )
        )
      ),
      h('div', { style: { height: 14 } }),
      h(
        'div',
        { style: { background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', borderRadius: 18, padding: 18, textAlign: 'center' } },
        h('div', { style: { fontSize: 13.5, fontWeight: 600, color: 'var(--muted-2)' } }, headline),
        h('div', { style: { fontSize: 22, fontWeight: 900, color: 'var(--accent)', marginTop: 5 } }, `${eta.getDate()} ${months[eta.getMonth()]}`)
      )
    );
  }

  function Life() {
    const l = LIFESTYLES[state.life] || LIFESTYLES[2];
    return h(
      Screen,
      qBase('life', { progress: qProgress('life'), ctaLabel: 'Далее', onCta: () => go(state.sex === 'f' ? 'cycle' : 'norm') }),
      h(Title, { title: 'Ваш образ жизни?' }),
      h(
        Card,
        null,
        h('div', { style: { textAlign: 'center' } },
          h('div', { style: { fontSize: 42, marginBottom: 10 } }, l.emoji),
          h('div', { style: { fontSize: 21, fontWeight: 900 } }, l.name),
          h('div', { style: { fontSize: 13.5, fontWeight: 500, color: 'var(--muted-2)', marginTop: 4, marginBottom: 20 } }, l.sub)
        ),
        h(
          'div',
          { style: { display: 'flex', gap: 7 } },
          LIFESTYLES.map((x, i) =>
            h('button', {
              key: x.name,
              type: 'button',
              'aria-label': x.name,
              onClick: () => set({ life: i }),
              style: {
                flex: 1, height: 10, borderRadius: 5, border: 'none', cursor: 'pointer', padding: 0,
                background: i <= state.life ? 'var(--grad)' : 'var(--line-2)',
              },
            })
          )
        ),
        h(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', marginTop: 10 } },
          h('span', { style: { fontSize: 12, fontWeight: 700, color: 'var(--muted-3)' } }, 'Сидячий'),
          h('span', { style: { fontSize: 12, fontWeight: 700, color: 'var(--muted-3)' } }, 'Очень активный')
        )
      )
    );
  }

  function Cycle() {
    const options = [
      { id: 'sync', emoji: '💛', name: 'Да, подстраивать' },
      { id: 'later', emoji: '🚫', name: 'Не сейчас' },
      { id: 'preg', emoji: '🤰', name: 'Беременность или ГВ' },
    ];
    return h(
      Screen,
      qBase('cycle', {
        progress: qProgress('cycle'),
        ctaLabel: 'Далее',
        ctaDisabled: !state.cycle,
        onCta: () => go(state.cycle === 'sync' ? 'period' : 'norm'),
      }),
      h(Title, { title: 'Подстраивать меню под фазу цикла?', sub: 'Голод и тяга к сладкому меняются по дням — можем это учитывать.' }),
      h('div', { className: 'stack' }, options.map((o) =>
        h(OptionRow, { key: o.id, selected: state.cycle === o.id, onClick: () => set({ cycle: o.id }), emoji: o.emoji }, o.name)))
    );
  }

  function Period() {
    const today = new Date();
    const [view, setView] = React.useState(() => {
      if (state.periodDate) {
        const d = new Date(state.periodDate);
        return { y: d.getFullYear(), m: d.getMonth() };
      }
      return { y: today.getFullYear(), m: today.getMonth() };
    });
    const isCurrent = view.y === today.getFullYear() && view.m === today.getMonth();
    const firstWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [...Array.from({ length: firstWeekday }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const arrows = (delta, enabled) =>
      h(
        'button',
        {
          type: 'button',
          disabled: !enabled,
          onClick: enabled
            ? () => {
                const total = view.m + delta;
                setView({ y: view.y + Math.floor(total / 12), m: ((total % 12) + 12) % 12 });
              }
            : undefined,
          'aria-label': delta < 0 ? 'Прошлый месяц' : 'Следующий месяц',
          style: {
            width: 32, height: 32, borderRadius: '50%', border: 'none', flex: 'none',
            background: enabled ? 'var(--surface-3)' : 'transparent', cursor: enabled ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: enabled ? 'var(--muted)' : 'var(--muted-3)',
          },
        },
        delta < 0 ? '‹' : '›'
      );
    return h(
      Screen,
      qBase('period', {
        progress: qProgress('period'),
        ctaLabel: 'Далее',
        ctaDisabled: !state.periodDate,
        onCta: () => go('norm'),
      }),
      h(Title, { title: 'Когда начались последние месячные?', sub: 'Нужно, чтобы рассчитать фазы цикла.' }),
      h(
        Card,
        { compact: true },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
          arrows(-1, true),
          h('span', { style: { fontSize: 15, fontWeight: 900 } }, `${months[view.m]} ${view.y}`),
          arrows(1, !isCurrent)
        ),
        h(
          'div',
          { style: { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 } },
          ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) =>
            h('span', { key: d, style: { textAlign: 'center', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted-3)' } }, d)),
          cells.map((day, i) => {
            if (day == null) return h('span', { key: 'e' + i });
            const iso = `${view.y}-${String(view.m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const future = isCurrent && day > today.getDate();
            const selected = state.periodDate === iso;
            return h(
              'button',
              {
                key: iso,
                type: 'button',
                disabled: future,
                onClick: future ? undefined : () => set({ periodDate: iso }),
                style: {
                  aspectRatio: '1', borderRadius: 10, border: 'none', padding: 0,
                  fontSize: 13.5, fontWeight: selected ? 900 : 600,
                  cursor: future ? 'default' : 'pointer',
                  background: selected ? 'var(--grad)' : 'var(--surface-3)',
                  color: selected ? 'var(--accent-ink)' : future ? 'var(--muted-3)' : 'var(--ink-2)',
                  opacity: future ? 0.45 : 1,
                },
              },
              day
            );
          })
        )
      ),
      h('div', { className: 'spacer-10' }),
      h(
        Card,
        { compact: true },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } },
          h(
            'div',
            null,
            h('div', { style: { fontSize: 15, fontWeight: 800 } }, 'Длина цикла'),
            h('div', { style: { fontSize: 12.5, fontWeight: 500, color: 'var(--muted-2)', marginTop: 2 } }, 'Обычно 26–30 дней')
          ),
          h(MiniStep, { value: state.cycleLen, min: 20, max: 40, onChange: (v) => set({ cycleLen: v }), format: (v) => `${v} дней` })
        )
      ),
      h('div', { className: 'spacer-12' }),
      h(
        'button',
        {
          type: 'button',
          className: 'btn btn-ghost',
          onClick: () => { set({ periodDate: null }); go('norm'); },
        },
        'Позже'
      ),
      h('div', { style: { textAlign: 'center', fontSize: 12.5, fontWeight: 500, color: 'var(--muted-3)', marginTop: 10 } },
        'Меню соберём без учёта цикла — дату можно указать в настройках.')
    );
  }

  function Norm() {
    const kcal = dailyKcal(state);
    const protein = Math.round((kcal * 26) / 100 / 4);
    const fat = Math.round((kcal * 30) / 100 / 9);
    const carb = Math.max(0, Math.round((kcal - 4 * protein - 9 * fat) / 4));
    const totalPct = Math.min(100, Math.round(((4 * protein) / kcal) * 100));
    const fatPct = Math.min(100 - totalPct, Math.round(((9 * fat) / kcal) * 100));
    const conic = `conic-gradient(var(--accent-2) 0% ${totalPct}%, #FFC56F ${totalPct}% ${totalPct + fatPct}%, var(--line-2) ${totalPct + fatPct}% 100%)`;
    return h(
      Screen,
      qBase('norm', { progress: qProgress('norm'), ctaLabel: 'Всё верно, продолжить', onCta: () => go('coffee') }),
      h('h1', { className: 'title', style: { textAlign: 'center', marginBottom: 20 } }, 'Ваша дневная норма'),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } },
        h(
          'div',
          {
            style: {
              width: 186, height: 186, borderRadius: '50%', background: conic,
              boxShadow: 'var(--shadow-m)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            },
          },
          h(
            'div',
            {
              style: {
                width: 150, height: 150, borderRadius: '50%', background: 'var(--surface)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              },
            },
            h('span', { style: { fontSize: 38, fontWeight: 900, letterSpacing: '-1.4px', color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' } }, kcal),
            h('span', { style: { fontSize: 12, fontWeight: 700, color: 'var(--muted-3)' } }, 'ккал в день')
          )
        ),
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 } },
          [['−', -50], ['+', 50]].map(([sign, delta]) =>
            h(
              'button',
              {
                key: sign,
                type: 'button',
                onClick: () => set({ normAdjust: Math.max(-800, Math.min(1200, (state.normAdjust || 0) + delta)) }),
                'aria-label': delta > 0 ? 'Больше калорий' : 'Меньше калорий',
                style: {
                  width: 44, height: 44, borderRadius: '50%', border: 'none',
                  background: 'var(--accent-soft-2)', color: 'var(--accent)',
                  fontSize: 21, fontWeight: 800, cursor: 'pointer',
                },
              },
              sign
            )
          ),
          h('span', { style: { fontSize: 13, fontWeight: 700, color: 'var(--muted-3)' } }, 'подкрутить ±50')
        )
      ),
      h(
        'div',
        { style: { display: 'flex', justifyContent: 'space-around', marginTop: 22, marginBottom: 18 } },
        [['var(--accent-2)', 'Белки', protein], ['#FFC56F', 'Жиры', fat], ['var(--line-2)', 'Углеводы', carb]].map(([color, label, val]) =>
          h(
            'div',
            { key: label, style: { textAlign: 'center' } },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 } },
              h('span', { style: { width: 9, height: 9, borderRadius: '50%', background: color } }),
              h('span', { style: { fontSize: 22, fontWeight: 900, fontVariantNumeric: 'tabular-nums' } }, val),
              h('span', { style: { fontSize: 13, fontWeight: 700, color: 'var(--muted-3)' } }, 'г')
            ),
            h('div', { className: 'label-cap', style: { marginTop: 5, marginBottom: 0 } }, label)
          )
        )
      ),
      h(PillSwitch, {
        options: [
          { id: 'balance', name: 'Сбалансированно' },
          { id: 'protein', name: 'Больше белка' },
          { id: 'lowcarb', name: 'Меньше углеводов' },
        ],
        value: state.normMode,
        onChange: (v) => set({ normMode: v }),
      })
    );
  }

  function Coffee() {
    return h(
      Screen,
      qBase('coffee', {
        progress: qProgress('coffee'),
        ctaLabel: 'Далее',
        ctaDisabled: !state.coffee,
        onCta: () => go(state.coffee === 'yes' ? 'drinks' : 'repeat'),
      }),
      h(Title, { title: 'Есть привычка пить кофе, матчу или какао?', sub: 'Учтём калорийность напитков в дневной норме.' }),
      h(
        Grid,
        { cols: 2 },
        [['no', 'Нет'], ['yes', 'Да']].map(([id, label]) => {
          const selected = state.coffee === id;
          return h(
            'button',
            {
              key: id,
              type: 'button',
              className: 'opt' + (selected ? ' selected' : ''),
              onClick: () => set({ coffee: id }),
              style: { minHeight: 68 },
            },
            h('span', { className: 'opt-name', style: { fontSize: 17 } }, label)
          );
        })
      )
    );
  }

  function Drinks() {
    const DRINKS = [
      { id: 'latte', name: 'Латте', color: '#C9A07A' },
      { id: 'capp', name: 'Капучино', color: '#A8764C' },
      { id: 'amer', name: 'Американо', color: '#5A3A22' },
      { id: 'mtch', name: 'Матча', color: '#7FA05A' },
      { id: 'cacao', name: 'Какао', color: '#6B4430' },
      { id: 'flat', name: 'Флэт уайт', color: '#B98A5E' },
    ];
    const sugar = state.cups * state.spoons;
    return h(
      Screen,
      qBase('drinks', {
        progress: qProgress('drinks'),
        ctaLabel: 'Далее',
        ctaDisabled: state.drinks.length === 0,
        onCta: () => go('repeat'),
      }),
      h(Title, { title: 'Что именно пьёте?', sub: 'Отметьте всё, что бывает в течение дня.' }),
      h(
        Grid,
        { cols: 2, gap: 9 },
        DRINKS.map((d) => {
          const selected = state.drinks.includes(d.id);
          return h(
            'button',
            {
              key: d.id,
              type: 'button',
              className: 'opt' + (selected ? ' selected' : ''),
              onClick: () => toggleIn('drinks', d.id),
              style: { flexDirection: 'row', justifyContent: 'flex-start', gap: 11, padding: '15px 14px', minHeight: 54 },
            },
            h('span', { style: { width: 26, height: 26, borderRadius: '50%', background: d.color, boxShadow: 'inset 0 -4px 8px rgba(0,0,0,.14)', flex: 'none' } }),
            h('span', { className: 'opt-name', style: { fontSize: 14.5 } }, d.name)
          );
        })
      ),
      h('div', { className: 'spacer-16' }),
      h(Cap, null, 'Сколько чашек в день'),
      h('div', { style: { display: 'flex', gap: 8 } },
        [1, 2, 3, 4].map((n) => h(SegButton, { key: n, on: state.cups === n, onClick: () => set({ cups: n }) }, n))),
      h('div', { className: 'spacer-16' }),
      h(Cap, null, 'Сколько ложек сахара в чашке'),
      h('div', { style: { display: 'flex', gap: 8 } },
        [0, 1, 2, 3].map((n) => h(SegButton, { key: n, on: state.spoons === n, onClick: () => set({ spoons: n }) }, n === 0 ? 'Без' : n))),
      h('div', { className: 'spacer-12' }),
      h(Note, { emoji: '☕' },
        sugar === 0
          ? 'Без сахара — напитки почти не влияют на норму.'
          : `Учтём ${sugar} ${plural(sugar, 'ложку', 'ложки', 'ложек')} сахара в день — это ≈ ${20 * sugar} ккал.`)
    );
  }

  function Repeat() {
    const texts = [
      'Каждый день новое блюдо — вкусно, но дороже и дольше готовить.',
      'Готовим одно блюдо на два раза — золотая середина.',
      'Готовим большими порциями — самый экономный вариант.',
    ];
    return h(
      Screen,
      qBase('repeat', { progress: qProgress('repeat'), ctaLabel: 'Далее', onCta: () => go('days') }),
      h(Title, { title: 'Как часто блюдо может повторяться?', sub: 'Готовим сразу на несколько порций — так экономнее.' }),
      h('div', { style: { textAlign: 'center', margin: '18px 0 22px' } },
        h('span', { style: { fontSize: 70, fontWeight: 900, letterSpacing: '-3px', color: 'var(--accent)', lineHeight: 1 } }, state.repeat)),
      h(
        'div',
        { style: { display: 'flex', justifyContent: 'center', gap: 16 } },
        [1, 2, 3].map((n) => {
          const on = state.repeat === n;
          return h(
            'button',
            {
              key: n,
              type: 'button',
              onClick: () => set({ repeat: n }),
              style: {
                width: 64, height: 64, borderRadius: '50%', fontSize: 22, fontWeight: 900, cursor: 'pointer',
                border: on ? 'none' : '1.5px solid var(--line-2)',
                background: on ? 'var(--grad)' : 'var(--surface)',
                color: on ? 'var(--accent-ink)' : 'var(--muted)',
                boxShadow: on ? 'var(--shadow-accent)' : 'var(--shadow-s)',
              },
            },
            n
          );
        })
      ),
      h('div', { style: { textAlign: 'center', fontSize: 13.5, fontWeight: 600, color: 'var(--muted-2)', marginTop: 18, minHeight: 40 } }, texts[state.repeat - 1])
    );
  }

  function Days() {
    const fresh = React.useMemo(() => {
      const cook = WEEK_IDS.map((id, i) => (state.days.includes(id) ? i : -1)).filter((i) => i >= 0);
      return WEEK_IDS.map((_, day) => {
        if (!cook.length) return { kind: 'fresh' };
        if (cook.includes(day)) return { kind: 'cook' };
        let min = 8;
        for (const c of cook) {
          const diff = (day - c + 7) % 7;
          if (diff > 0) min = Math.min(min, diff);
        }
        return min >= 3 ? { kind: 'freeze' } : { kind: 'fresh' };
      });
    }, [state.days]);
    return h(
      Screen,
      qBase('days', {
        progress: qProgress('days'),
        ctaLabel: 'Готово',
        ctaDisabled: state.days.length === 0,
        onCta: () => ctx.finishQuestionnaire(),
      }),
      h(Title, { title: 'В какие дни готовите?', sub: 'Отметьте свободные дни — в них поставим готовку впрок.' }),
      h(
        'div',
        { style: { display: 'flex', gap: 6 } },
        WEEK_IDS.map((id, i) => {
          const on = state.days.includes(id);
          return h(
            'button',
            {
              key: id,
              type: 'button',
              onClick: () => toggleIn('days', id),
              style: {
                flex: 1, aspectRatio: '1', borderRadius: 14, cursor: 'pointer', padding: 0,
                fontSize: 14, fontWeight: 800, border: on ? 'none' : '1.5px solid var(--line-2)',
                background: on ? 'var(--grad)' : 'var(--surface)',
                color: on ? 'var(--accent-ink)' : 'var(--muted)',
              },
            },
            WEEKDAYS[i]
          );
        })
      ),
      h('div', { className: 'spacer-12' }),
      h(
        Card,
        { compact: true, style: { padding: 0, overflow: 'hidden' } },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' } },
          h('span', { style: { width: 34, height: 34, borderRadius: 11, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flex: 'none' } }, '🌿'),
          h('div', null,
            h('div', { style: { fontSize: 15, fontWeight: 800 } }, 'Расписание свежести'),
            h('div', { style: { fontSize: 12.5, fontWeight: 600, color: 'var(--muted-3)' } }, 'Что будет в эти дни'))
        ),
        h('div', { style: { height: 1, background: 'var(--line-3)' } }),
        h(
          'div',
          { style: { display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4, padding: '14px 10px 16px' } },
          fresh.map((f, i) => {
            const [emoji, label, bg, color] =
              f.kind === 'cook' ? ['🔥', 'Готовлю', 'var(--accent-soft-2)', 'var(--accent)']
                : f.kind === 'freeze' ? ['❄️', 'Замор.', 'var(--surface-3)', 'var(--muted)']
                : ['🌿', 'Свежее', 'var(--surface-3)', 'var(--muted-3)'];
            return h(
              'div',
              { key: i, style: { textAlign: 'center' } },
              h('div', { style: { fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: 'var(--muted-3)', marginBottom: 5 } }, WEEKDAYS[i]),
              h(
                'div',
                { style: { aspectRatio: '1', borderRadius: 11, background: bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 } },
                h('span', { style: { fontSize: 16 } }, emoji),
                h('span', { style: { fontSize: 8.5, fontWeight: 900, textTransform: 'uppercase', color } }, label)
              )
            );
          })
        )
      ),
      h('div', { className: 'spacer-12' }),
      h(Note, { emoji: '🍳' },
        state.days.length
          ? 'В отмеченные дни готовим впрок, в остальные — только разогреть.'
          : 'Отметьте хотя бы один день, чтобы спланировать готовку.')
    );
  }

  return {
    intro: Intro, people: People, meals: Meals, budget: Budget, sex: Sex, diet: Diet,
    tastes: Tastes, allergy: Allergy, kitchen: Kitchen, calc: Calc,
    age: Age, height: Height, weight: Weight, goal: Goal, target: Target, life: Life,
    cycle: Cycle, period: Period, norm: Norm, coffee: Coffee, drinks: Drinks,
    repeat: Repeat, days: Days,
  };
}
