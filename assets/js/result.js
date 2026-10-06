/**
 * Экран результата: полный рацион на неделю, список покупок, план активности.
 * Никакой оплаты — всё, что в оригинале открывалось по подписке, здесь сразу.
 */

import {
  h, Fragment, Card, Cap, Note, rub, people, plural, ingredientLines, recipeSteps,
  Button, Dock, Screen, WideTrack, Shell, TopBar, SideSteps, asset,
} from './ui.js';
import { dishArtDataUri } from './dishart.js';
import { MEALS, alternativesFor, dishNutrition, STORES, sexLabel } from './plan.js';
import { productEmoji } from './recipes.js';
import { BY_ID } from './products.js';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WEEK_IDS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function useToast() {
  const [msg, setMsg] = React.useState(null);
  const show = React.useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2200);
  }, []);
  return [msg, show];
}

/* ── Рецепт блюда ──────────────────────────────────────────────────────── */
function RecipeCard({ meal, plan, open, onToggle, onSwap }) {
  const r = meal.recipe;
  const lines = ingredientLines(r, 1, Math.max(1, Math.round(meal.cookPortions)));
  const steps = recipeSteps(r);
  const nut = meal.nutrition;
  const alts = open ? alternativesFor(plan, r, 4) : [];
  const isFam = meal.scope === 'fam';
  return h(
    'div',
    { className: 'recipe' + (open ? ' open' : '') },
    h(
      'button',
      { type: 'button', className: 'recipe-head', onClick: onToggle },
      h('img', { src: dishArtDataUri(r, 120), alt: '', width: 56, height: 56 }),
      h(
        'div',
        { style: { minWidth: 0 } },
        h('div', { className: 'rt' }, r.name),
        h(
          'div',
          { className: 'rs' },
          `${meal.mealName} · ${nut.kcal} ккал · Б ${nut.p} / Ж ${nut.f} / У ${nut.c}`,
          isFam ? ` · на ${meal.cookPortions} порц.` : ''
        )
      ),
      h('span', { className: 'chev-down' })
    ),
    open ? h(
      'div',
      { className: 'recipe-body' },
      h(
        'div',
        { className: 'recipe-cols' },
        h(
          'div',
          null,
          h(Cap, { mb: 6 }, `Продукты на ${Math.max(1, Math.round(meal.cookPortions))} порц.`),
          h('ul', { className: 'ing-list' },
            lines.map((l) => h('li', { key: l.id }, h('span', null, l.name), h('b', null, l.amount))))
        ),
        h('div', null, h(Cap, { mb: 6 }, 'Как готовить'), h('ol', { className: 'steps' }, steps.map((s, i) => h('li', { key: i }, s))))
      ),
      h(
        'div',
        { className: 'nutri-line' },
        h('span', null, 'Порция: ', h('b', null, `${nut.kcal} ккал`)),
        h('span', null, 'Белок ', h('b', null, `${nut.p} г`)),
        h('span', null, 'Жиры ', h('b', null, `${nut.f} г`)),
        h('span', null, 'Углеводы ', h('b', null, `${nut.c} г`)),
        h('span', null, '≈ ', h('b', null, rub(meal.cost)), ' за порцию')
      ),
      alts.length > 0 && h(
        Fragment,
        null,
        h('div', { style: { marginTop: 12, fontSize: 12.5, fontWeight: 700, color: 'var(--muted-3)' } }, 'Заменить на похожее блюдо:'),
        h(
          'div',
          { className: 'alt-row' },
          alts.map((a) =>
            h('button', { key: a.id, type: 'button', className: 'alt-chip', onClick: () => onSwap(meal.meal, a) },
              `${a.name} · ${dishNutrition(a, 1).kcal} ккал`))
        )
      )
    ) : null
  );
}

/* ── Список покупок ────────────────────────────────────────────────────── */
/** Количество в человекочитаемом виде: штуки, упаковки, килограммы. */
function quantText(it) {
  if (it.unit === 'шт') {
    const packs = it.packs > 1 ? ` · ${it.packs} ${plural(it.packs, 'упаковка', 'упаковки', 'упаковок')}` : '';
    return `${it.amount} шт${packs}`;
  }
  if (it.amount >= 1000) return `${(it.amount / 1000).toFixed(2).replace('.', ',')} кг`;
  return `${it.amount} г`;
}

function ShoppingList({ plan, onToast }) {
  const [checked, setChecked] = React.useState({});
  const toggle = (id) => {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
    onToast('Отмечайте купленное — список пригодится в магазине');
  };
  return h(
    Fragment,
    null,
    plan.shopping.aisles.map((aisle) =>
      h(
        'div',
        { className: 'shop-group', key: aisle.id },
        h('div', { className: 'aisle' },
          h('span', null, aisle.emoji),
          h('span', null, aisle.name),
          h('span', { className: 'sum' }, rub(aisle.sum))),
        aisle.items.map((it) =>
          h(
            'button',
            {
              key: it.id,
              type: 'button',
              className: 'shop-item' + (checked[it.id] ? ' done' : ''),
              onClick: () => toggle(it.id),
            },
            h(
              'div',
              { style: { minWidth: 0 } },
              h('div', { className: 'nm' }, it.name),
              h('div', { className: 'qt' }, quantText(it))
            ),
            it.note ? h('span', { className: 'nt' }, it.note) : null,
            h('span', { className: 'pr' }, rub(it.price))
          )
        )
      )
    ),
    plan.shopping.pantryItems.length > 0 && h('div', { style: { marginTop: 14, fontSize: 12.5, fontWeight: 500, lineHeight: 1.6, color: 'var(--muted-3)' } },
      'Почти всегда есть дома, в список не считаем: ',
      plan.shopping.pantryItems.map((i) => i.name.toLowerCase()).join(', '),
      '. На них уйдёт ещё ≈ ', rub(plan.shopping.pantryCost), '.'),
    h(
      'div',
      { className: 'shop-total' },
      h('div', null,
        h('div', { className: 'lbl' }, 'Итого на неделю'),
        h('div', { style: { fontSize: 12, fontWeight: 700, opacity: 0.78, marginTop: 2 } },
          `${plan.shopping.items.length} ${plural(plan.shopping.items.length, 'позиция', 'позиции', 'позиций')} · ≈ ${rub(plan.budget.daily)} в день`)),
      h('div', { className: 'val' }, rub(plan.budget.week))
    )
  );
}

/* ── Основной экран результата ─────────────────────────────────────────── */
export function ResultScreen({ plan, onRestart, onRefine, theme, onToggleTheme, steps, onGo }) {
  const [day, setDay] = React.useState(0);
  const [openRecipe, setOpenRecipe] = React.useState(null);
  const [toast, showToast] = useToast();
  const [swaps, setSwaps] = React.useState({});
  const [showPlan, setShowPlan] = React.useState(true);

  const days = React.useMemo(
    () =>
      plan.days.map((d) => ({
        ...d,
        meals: d.meals.map((m, idx) => {
          const sw = swaps[`${d.index}-${m.meal}-${idx}`];
          if (!sw) return m;
          return { ...m, recipe: sw, nutrition: dishNutrition(sw, m.eatPortions) };
        }),
      })),
    [plan, swaps]
  );

  const current = days[day];
  const famCount = plan.profile.adults + plan.profile.kids.length;
  const hasFam = plan.profile.famMeals.length > 0;

  const swap = (mealId, recipe) => {
    const idx = current.meals.findIndex((m) => m.meal === mealId);
    setSwaps((s) => ({ ...s, [`${current.index}-${mealId}-${idx}`]: recipe }));
    setOpenRecipe(null);
    showToast('Блюдо заменено — состав и КБЖУ пересчитаны');
  };

  const kcalPercent = Math.min(100, Math.round((plan.kcal / 2600) * 100));

  /* Содержимое разделов: используется и в потоке, и в оглавлении. */
  const sections = [
    { id: 'menu', label: 'Меню на неделю' },
    { id: 'recipes', label: 'Рецепты и замены' },
    { id: 'shopping', label: 'Список покупок' },
  ];

  const side = h(
    Fragment,
    null,
    steps && steps.length ? h(
      'div',
      { className: 'side-card' },
      h('div', { className: 'side-title' }, 'Шаги'),
      h(SideSteps, { steps, current: steps.length, onGo, title: '' })
    ) : null,
    h(
      'div',
      { className: 'side-card' },
      h('div', { className: 'side-title' }, 'Итог'),
      h('div', { className: 'row' }, h('span', { className: 'k' }, 'Корзина на неделю'), h('span', { className: 'v' }, rub(plan.budget.week))),
      h('div', { className: 'row' }, h('span', { className: 'k' }, 'На человека'), h('span', { className: 'v' }, rub(plan.budget.perPerson))),
      h('div', { className: 'row' }, h('span', { className: 'k' }, 'Норма в день'), h('span', { className: 'v' }, `${plan.kcal} ккал`)),
      h('div', { className: 'row' }, h('span', { className: 'k' }, 'Б / Ж / У'), h('span', { className: 'v' }, `${plan.macros.p}/${plan.macros.f}/${plan.macros.c}`)),
      h('div', { className: 'row' }, h('span', { className: 'k' }, 'Приёмов пищи'), h('span', { className: 'v' }, days.reduce((a, d) => a + d.meals.length, 0))),
      h('div', { className: 'row' }, h('span', { className: 'k' }, 'Уникальных блюд'), h('span', { className: 'v' }, plan.uniqueness))
    ),
    h(
      'div',
      { className: 'side-card' },
      h('div', { className: 'side-title' }, 'Разделы'),
      h(
        'div',
        { className: 'side-nav' },
        sections.map((s) => h('a', { key: s.id, href: `#${s.id}` }, s.label))
      )
    )
  );

  return h(
    Shell,
    {
      side,
      topbar: h(TopBar, { theme, onToggleTheme, onRestart }),
      dock: h(
        Dock,
        null,
        h(Button, { onClick: () => window.print() }, 'Сохранить в PDF')
      ),
    },
    h(
      Fragment,
      null,
      h(
        'div',
        { className: 'result-head' },
        h('div', { className: 'kicker' }, 'РАЦИОН ГОТОВ · БЕСПЛАТНО'),
        h('h1', null, 'Ваш рацион на неделю'),
        h('p', null, `${days.reduce((a, d) => a + d.meals.length, 0)} приёмов пищи · ${plan.uniqueness} ${plural(plan.uniqueness, 'блюдо', 'блюда', 'блюд')} · ${people(famCount)} · ${sexLabel(plan.profile.sex).toLowerCase()}`)
      ),

      h(
        'div',
        { className: 'kpi-row' },
        h('div', { className: 'kpi' },
          h('div', { className: 'kpi-label' }, 'Корзина на неделю'),
          h('div', { className: 'kpi-value' }, rub(plan.budget.week)),
          h('div', { className: 'kpi-sub' }, `${rub(plan.budget.perPerson)} на человека · ${plan.budget.level.name.toLowerCase()}`)),
        h('div', { className: 'kpi' },
          h('div', { className: 'kpi-label' }, 'Норма в день'),
          h('div', { className: 'kpi-value' }, `${plan.kcal}`),
          h('div', { className: 'kpi-sub' }, `ккал · меню даёт ${plan.avgDaily}`)),
        h('div', { className: 'kpi wide' },
          h('div', { className: 'kpi-label' }, 'Порции и готовка'),
          h('div', { className: 'kpi-value', style: { fontSize: 19 } },
            plan.servingScale > 1.05 ? `${plan.servingScale} порции за одну готовку` : 'Готовим ровно на приём'),
          h('div', { className: 'kpi-sub' }, plan.profile.days.length
            ? `Дни готовки: ${plan.profile.days.map((d) => WEEKDAYS[WEEK_IDS.indexOf(d)]).join(', ')}`
            : 'Меню из блюд без готовки')),
      ),

      h(
        'div',
        { className: 'macros' },
        [['var(--accent-2)', 'Белки', plan.macros.p], ['#FFC56F', 'Жиры', plan.macros.f], ['var(--line-2)', 'Углеводы', plan.macros.c]].map(([color, label, val]) =>
          h('div', { className: 'macro', key: label },
            h('div', { className: 'num' }, h('span', { className: 'dot', style: { background: color } }), val, ' г'),
            h('div', { className: 'cap' }, label))
        )
      ),
      h('div', { style: { marginTop: 12 } }, h(WideTrack, { percent: kcalPercent })),

      h(
        'div',
        { className: 'section' },
        h('div', { className: 'section-head' }, h('h2', null, 'Что учтено')),
        h('div',
          { style: { marginBottom: 10 } },
          plan.coverage.ok
            ? h(Note, { emoji: '✅' }, plan.coverage.text)
            : h(Note, { emoji: '➕', title: 'Можно дотянуть до нормы' }, plan.coverage.text)),
        plan.budget.squeeze > 0 && h('div', { style: { marginBottom: 10 } }, h(Note, { emoji: '📉' },
          `Под бюджет порции уменьшены на ${plan.budget.squeeze}%. Овощи и крупы оставили полностью.`)),
        plan.actions.map((a, i) => h('div', { className: 'action', key: i },
          h('span', { className: 'emoji' }, a.emoji),
          h('div', null, h('div', { className: 'at' }, a.title), h('div', { className: 'ad' }, a.text))))
      ),

      plan.profile.likedProducts.length > 0 && h(
        'div',
        { className: 'section' },
        h('div', { className: 'section-head' },
          h('h2', null, 'Ваши любимые продукты'),
          h('span', { className: 'meta' }, `${plan.profile.likedProducts.length} ${plural(plan.profile.likedProducts.length, 'позиция', 'позиции', 'позиций')}`)),
        h('div', { className: 'section-note' }, 'Блюда с этими продуктами стоят в меню первыми — поэтому они и попали на неделю.'),
        h('div', { className: 'fav-chips' },
          plan.profile.likedProducts.map((id) => {
            const prod = BY_ID.get(id);
            return h('span', { className: 'fav-chip', key: id },
              prod ? productEmoji(id) : '🛒', ' ', prod?.name || id);
          }))
      ),

      h(
        'div',
        { className: 'print-all-days', style: { display: 'none' } },
        h('h2', { style: { fontSize: 22, fontWeight: 900, marginBottom: 14 } }, 'Меню на все 7 дней недели'),
        days.map((d) =>
          h('div', { key: d.name, style: { marginBottom: 16, pageBreakInside: 'avoid' } },
            h('h3', { style: { fontSize: 16, fontWeight: 800, margin: '10px 0 6px', color: '#E8763A' } }, `${d.name} (${d.isCook ? 'День готовки' : 'Разогрев'})`),
            d.meals.map((m, i) =>
              h('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #ddd', fontSize: 13.5 } },
                h('span', null, `${m.emoji} ${m.mealName}: `, h('b', null, m.recipe.name)),
                h('span', { style: { fontWeight: 700 } }, `${m.nutrition.kcal} ккал`)
              )
            )
          )
        )
      ),

      h(
        'div',
        { className: 'section', id: 'menu' },
        h('div', { className: 'section-head' },
          h('h2', null, 'Меню на неделю'),
          h('span', { className: 'meta' }, `${current.totals.kcal} ккал · ${rub(current.cost)}`)),
        h('div', { className: 'section-note' }, hasFam
          ? 'Ккал — на одну порцию, общие блюда едим все вместе.'
          : 'Ккал и БЖУ посчитаны на вашу порцию.'),
        h(
          'div',
          { className: 'day-nav' },
          days.map((d, i) =>
            h(
              'button',
              {
                key: d.name,
                type: 'button',
                className: 'day-tab' + (i === day ? ' on' : ''),
                onClick: () => { setDay(i); setOpenRecipe(null); },
              },
              d.name,
              h('small', null, d.isCook ? 'готовим' : `${d.totals.kcal}`)
            )
          )
        ),
        current.meals.map((m, i) =>
          h(
            'div',
            { className: 'meal-row', key: m.meal + i },
            h('span', { className: 'tag' }, `${m.emoji} ${m.mealName}`),
            h(
              'div',
              { style: { flex: 1, minWidth: 0, cursor: 'pointer' }, onClick: () => setOpenRecipe(openRecipe === i ? null : i) },
              h('div', { className: 'dish' }, m.recipe.name),
              h(
                'div',
                { className: 'dish-meta' },
                m.scope === 'fam'
                  ? h('span', { className: 'badge-mode badge-fam' }, `На всех · ${m.cookPortions} порц.`)
                  : h('span', { className: 'badge-mode ' + (m.mode === 'cook' ? 'badge-cook' : 'badge-warm') },
                      m.mode === 'cook' ? 'Готовим' : 'Разогреть'),
                m.recipe.tags?.length ? ` · ${m.recipe.tags.slice(0, 2).join(', ')}` : ''
              )
            ),
            h('span', { className: 'kcal' }, `${m.nutrition.kcal} ккал`),
            h('button', {
              type: 'button',
              onClick: () => setOpenRecipe(openRecipe === i ? null : i),
              'aria-label': 'Открыть рецепт',
              style: { border: 'none', background: 'transparent', cursor: 'pointer', padding: 4, flex: 'none' },
            }, h('span', {
              style: {
                display: 'block', width: 8, height: 8, borderRight: '2px solid var(--muted-3)',
                borderBottom: '2px solid var(--muted-3)',
                transform: openRecipe === i ? 'rotate(-135deg)' : 'rotate(45deg)',
              },
            }))
          )
        ),
        h('div', { className: 'totals' },
          h('span', null, `Итого за ${current.name}: ${current.totals.kcal} ккал`),
          h('span', null, `Б ${current.totals.p} · Ж ${current.totals.f} · У ${current.totals.c}`),
          h('span', null, rub(current.cost))),
        openRecipe != null && current.meals[openRecipe] && h('div', { style: { marginTop: 10 } },
          h(RecipeCard, {
            meal: current.meals[openRecipe],
            plan,
            open: true,
            onToggle: () => setOpenRecipe(null),
            onSwap: swap,
          }))
      ),

      h(
        'div',
        { className: 'section', id: 'recipes' },
        h('div', { className: 'section-head' },
          h('h2', null, 'Рецепты и замены'),
          h('button', {
            type: 'button',
            onClick: () => setShowPlan((v) => !v),
            style: { border: 'none', background: 'transparent', fontSize: 13, fontWeight: 800, color: 'var(--accent)', cursor: 'pointer' },
          }, showPlan ? 'свернуть' : 'показать')),
        showPlan ? h(
          Fragment,
          null,
          h('div', { className: 'section-note' }, 'Нажмите на блюдо — увидите состав, шаги и варианты замены.'),
          days.flatMap((d) =>
            d.meals.map((m, idx) => {
              const key = `${d.index}-${m.meal}-${idx}`;
              return h(RecipeCard, {
                key,
                meal: m,
                plan,
                open: openRecipe === key,
                onToggle: () => setOpenRecipe(openRecipe === key ? null : key),
                onSwap: swap,
              });
            })
          )
        ) : null
      ),

      h(
        'div',
        { className: 'section', id: 'shopping' },
        h('div', { className: 'section-head' },
          h('h2', null, 'Список покупок'),
          h('span', { className: 'meta' }, `${plan.shopping.items.length} позиций`)),
        h('div', { className: 'section-note' },
          `Цены — средние по сетям: ${STORES.map((s) => s.name).join(', ')}, с округлением до упаковок.`),
        h(ShoppingList, { plan, onToast: showToast })
      ),

      plan.substitutions.length > 0 && h(
        'div',
        { className: 'section' },
        h('div', { className: 'section-head' }, h('h2', null, 'Как сэкономить')),
        plan.substitutions.map((s) =>
          h('div', { className: 'action', key: s.label },
            h('span', { className: 'emoji' }, '💸'),
            h('div', null,
              h('div', { className: 'at' }, s.label),
              h('div', { className: 'ad' }, `Разница в цене до ${rub(s.saves)} за килограмм — на неделе это заметно.`))))
      ),

      h(
        'div',
        { className: 'section' },
        h('div', { className: 'section-head' }, h('h2', null, 'Что дальше')),
        h(Note, { emoji: '🧾' }, 'Закупитесь по списку, в дни готовки сделайте сразу партию — остальное только разогреть.'),
        h('div', { className: 'footer-actions' },
          h(Button, { variant: 'btn-ghost', onClick: onRefine }, 'Уточнить КБЖУ'),
          h(Button, { variant: 'btn-ghost', onClick: onRestart }, 'Начать сначала')),
        h('p', { className: 'footer-note' },
          'Это копия квиза «Рацион на неделю» без оплаты: весь рацион, список покупок и план активности доступны сразу. ',
          'Калорийность и цены — расчётные ориентиры, не медицинская рекомендация.')
      )
    ),
    toast ? h('div', { className: 'toast' }, toast) : null
  );
}
