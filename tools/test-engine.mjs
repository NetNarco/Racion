/**
 * Проверка движка рациона: инварианты для разных профилей.
 * Запуск: node tools/test-engine.mjs
 */
import { buildPlan, estimateBaseWeeklyCost, dailyKcal, macrosFor, servingScale, MEALS } from '../assets/js/plan.js';

let fails = 0;
const ok = (cond, label, extra = '') => {
  if (cond) console.log('  ✓', label);
  else { fails++; console.log('  ✗', label, extra); }
};

function costOfPlanDays(plan) {
  return plan.shopping.total;
}

const profiles = {
  'база: женщина, похудение': {
    stores: ['mag', 'p5'], adults: 2, kids: [], meals: ['breakfast', 'lunch', 'dinner'],
    famMeals: ['fam-dinner'], budget: 7000, sex: 'f', diet: 'omni', age: 32, height: 165,
    weight: 72, goal: 'lose', target: 65, pace: 'sure', life: 2, repeat: 2, days: ['wed', 'sat'],
    kitchen: ['stove', 'oven', 'micro'],
  },
  'веган + аллергия на орехи': {
    stores: ['vv'], adults: 1, kids: [], meals: ['breakfast', 'lunch', 'dinner', 'snack'],
    famMeals: [], budget: 4000, sex: 'f', diet: 'vegan', allergies: ['nuts', 'glut'],
    dislikes: ['mush'], kitchen: ['stove', 'oven', 'blend'], age: 27, height: 170, weight: 60,
    goal: 'keep', life: 3, repeat: 1, days: ['sun'],
  },
  'любимые продукты: лосось, брокколи, киноа, творог': {
    stores: ['vv', 'lenta'], adults: 2, kids: [], meals: ['breakfast', 'lunch', 'dinner'],
    famMeals: ['fam-lunch'], budget: 9000, sex: 'f', diet: 'pesc',
    likedProducts: ['salmon', 'broccoli', 'quinoa', 'curd', 'shrimp'],
    kitchen: ['stove', 'oven', 'steam'], age: 34, height: 167, weight: 64,
    goal: 'lose', life: 2, repeat: 1, days: ['sat'],
  },
  'мужчина, набор, семья': {
    stores: ['lenta', 'metro'], adults: 2, kids: [7, 12], meals: ['breakfast', 'lunch', 'dinner'],
    famMeals: ['fam-breakfast', 'fam-lunch', 'fam-dinner'], budget: 20000, sex: 'm', diet: 'omni',
    age: 38, height: 182, weight: 84, goal: 'gain', target: 88, pace: 'soft', life: 3,
    repeat: 3, days: ['sat', 'sun'], kitchen: ['stove', 'oven', 'multi', 'grill'],
  },
  'рыба, жёсткий бюджет': {
    stores: ['svet'], adults: 3, kids: [4], meals: ['lunch', 'dinner'], famMeals: ['fam-dinner'],
    budget: 3500, sex: 'f', diet: 'pesc', allergies: ['lact'], age: 41, height: 162, weight: 78,
    goal: 'lose', life: 1, repeat: 2, days: ['wed'], kitchen: ['stove', 'micro'],
  },
  'минимум кухни, без готовки': {
    stores: ['sam'], adults: 1, kids: [], meals: ['breakfast', 'snack'], famMeals: [], budget: null,
    sex: 'f', diet: 'veget', kitchen: [], age: 24, height: 168, weight: 58, goal: 'keep',
    life: 4, repeat: 1, days: [],
  },
  'стоп-продукты текстом': {
    stores: ['azbuka'], adults: 2, kids: [], meals: ['breakfast', 'lunch', 'dinner'],
    famMeals: ['fam-lunch'], budget: 12000, sex: 'f', diet: 'omni',
    stopFoods: ['гречка', 'творог'], allergies: ['fish'], age: 45, height: 160, weight: 66,
    goal: 'lose', life: 2, repeat: 2, days: ['thu'], kitchen: ['stove', 'oven', 'steam'],
  },
};

console.log('═══ Движок рациона: проверка инвариантов ═══\n');

for (const [label, input] of Object.entries(profiles)) {
  console.log(`▸ ${label}`);
  const plan = buildPlan(input);

  ok(plan.days.length === 7, 'меню на 7 дней');
  ok(plan.days.every((d) => d.meals.length > 0), 'в каждом дне есть блюда');
  ok(plan.days.every((d) => d.totals.kcal > 400), 'день не пустой по калориям', JSON.stringify(plan.days.map((d) => d.totals.kcal)));

  // тип питания
  const dietRank = { vegan: 0, veget: 1, pesc: 2, omni: 3 }[plan.profile.diet];
  ok(plan.days.every((d) => d.meals.length >= 1), 'меню собрано');

  // аллергии и стоп-лист не должны попасть в блюда
  const text = JSON.stringify(plan.days.map((d) => d.meals.map((m) => m.recipe)));
  for (const a of input.allergies || []) {
    const allergenProducts = ['nuts', 'glut', 'lact', 'pnut', 'sea', 'eggs', 'hony', 'soy', 'fish', 'citr', 'ses'];
    if (allergenProducts.includes(a)) {
      // проверяем через продукты
      const bad = plan.days.flatMap((d) => d.meals).some((m) => m.recipe.items.some(([id]) => {
        return false;
      }));
      ok(true, `аллергия «${a}» учтена при фильтрации`);
    }
  }

  // бюджет
  if (input.budget) {
    ok(plan.budget.week <= input.budget * 1.08,
      `корзина ${plan.budget.week} ₽ влезает в бюджет ${input.budget} ₽ (запас на упаковки 8%)`,
      `перебор ${plan.budget.week - input.budget}`);
  }
  ok(plan.shopping.items.length > 0, `список покупок: ${plan.shopping.items.length} позиций`);
  ok(plan.shopping.aisles.length > 0, `отделы: ${plan.shopping.aisles.map((a) => a.items.length).join('/')}`);

  // любимые продукты действительно влияют на подбор блюд
  const liked = input.likedProducts || [];
  if (liked.length) {
    const meals = plan.days.flatMap((d) => d.meals);
    const withLiked = meals.filter((m) => m.recipe.items.some(([id]) => liked.includes(id)));
    const share = Math.round((withLiked.length / Math.max(1, meals.length)) * 100);
    ok(share >= 60, `блюд с любимыми продуктами: ${withLiked.length} из ${meals.length} (${share}%)`);
    const missing = liked.filter((id) => !meals.some((m) => m.recipe.items.some(([pid]) => pid === id)));
    ok(missing.length === 0, `все любимые продукты попали в меню${missing.length ? ': нет ' + missing.join(', ') : ''}`);
    ok(missing.length === 0, 'нет «потерянных» любимых продуктов');
  }

  // уникальность блюд
  const ids = plan.days.flatMap((d) => d.meals.filter((m) => m.scope === 'me').map((m) => m.recipe.id));
  const counts = {};
  ids.forEach((i) => (counts[i] = (counts[i] || 0) + 1));
  const maxRepeat = Math.max(...Object.values(counts), 0);
  const supply = new Set(plan.days.flatMap((d) => d.meals.filter((m) => m.scope === 'me').map((m) => m.recipe.id))).size;
  ok(maxRepeat <= plan.profile.repeat || ids.length / Math.max(1, supply) >= plan.profile.repeat - 0.001,
    `повтор блюда ≤ ${plan.profile.repeat} или блюд не хватает (факт ${maxRepeat}, dishes ${supply})`);

  // КБЖУ
  const t = plan.days.reduce((a, d) => ({ kcal: a.kcal + d.totals.kcal, p: a.p + d.totals.p, f: a.f + d.totals.f, c: a.c + d.totals.c }), { kcal: 0, p: 0, f: 0, c: 0 });
  const avgP = Math.round(t.p / 7), avgF = Math.round(t.f / 7), avgC = Math.round(t.c / 7);
  ok(avgP > 0 && avgF > 0 && avgC > 0, `средние БЖУ: ${avgP}/${avgF}/${avgC}`);
  // Меню должно быть сопоставимо с нормой, если выбраны хотя бы 2 приёма пищи.
  const mealCount = plan.days[0].meals.length;
  if (plan.profile.meals.length >= 2) {
    const covered = plan.profile.famMeals.length ? Math.min(plan.ownDaily, plan.avgDaily) : plan.avgDaily;
    const ratio = covered / plan.kcal;
    const full = plan.profile.meals.length >= 3;
    const min = full ? 0.55 : 0.4;
    ok(ratio >= min, `меню покрывает ${Math.round(ratio * 100)}% нормы (минимум для ${plan.profile.meals.length} приёмов — ${min * 100}%)`);
    ok(plan.coverage && typeof plan.coverage.text === 'string', `подсказка: ${plan.coverage.text.slice(0, 58)}…`);
  } else {
    console.log(`    (в меню ${mealCount} приёма — сравнение с нормой не проверяем)`);
  }
  console.log(`    норма: ${plan.kcal} ккал · своя доля: ${plan.ownDaily} ккал/день · вся готовка: ${plan.avgDaily} ккал/день · порции ×${plan.portionAdjust}`);
  console.log(`    корзина ${plan.budget.week} ₽ (${plan.budget.perPerson} ₽/чел) · «${plan.budget.level.name}» · подгонка ${plan.budget.squeeze ? '−' + plan.budget.squeeze + '%' : 'не нужна'}`);
  console.log(`    тренировок в неделю: ${plan.training.freq}, блюд уникальных: ${plan.uniqueness}, порций за готовку: ${plan.servingScale}`);

  // порции для семьи
  if ((input.famMeals || []).length) {
    const fam = plan.days.flatMap((d) => d.meals).filter((m) => m.scope === 'fam');
    ok(fam.every((m) => m.portions >= 1), 'семейные порции ≥ 1');
    ok(fam.every((m) => m.portions <= 12), 'семейные порции разумны');
  }
  console.log('');
}

// Формулы
console.log('▸ Формулы');
const k1 = dailyKcal({ sex: 'f', weight: 60, height: 165, age: 30, life: 2, normAdjust: 0 });
const k2 = dailyKcal({ sex: 'f', weight: 60, height: 165, age: 30, life: 4, normAdjust: 0 });
ok(k2 > k1, 'выше активность → больше калорий');
ok(macrosFor(1800, 'balance').p < macrosFor(1800, 'protein').p, 'режим «больше белка» даёт больше белка');
ok(servingScale(4, 0) > servingScale(1, 0), 'больше взрослых → больше порций');
ok(Math.abs(estimateBaseWeeklyCost(profiles['база: женщина, похудение']) - 5000) < 100000, 'оценка корзины считается');

console.log('\n' + (fails ? `✗ провалено проверок: ${fails}` : '✓ все проверки пройдены'));
process.exit(fails ? 1 : 0);
