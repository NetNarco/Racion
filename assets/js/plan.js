/**
 * Движок рациона: КБЖУ → недельное меню → список покупок → бюджет.
 * Работает полностью на клиенте, без сети и без оплаты.
 */

import { PRODUCTS, BY_ID, PANTRY, AISLES, productAllowed, DIET_RANK } from './products.js';
import { RECIPES } from './recipes.js';

export const MEALS = [
  { id: 'breakfast', name: 'Завтрак', emoji: '☕', famName: 'Общие завтраки', share: 0.24 },
  { id: 'lunch', name: 'Обед', emoji: '🍜', famName: 'Общие обеды', share: 0.32 },
  { id: 'dinner', name: 'Ужин', emoji: '🍽', famName: 'Общие ужины', share: 0.29 },
  { id: 'snack', name: 'Перекус', emoji: '🍎', famName: 'Общие перекусы', share: 0.15 },
];

/**
 * Магазины, по которым считаем цены. Выбор магазина из квиза убран:
 * считаем среднее по этой базовой корзине сетей.
 */
export const STORES = [
  { id: 'mag', name: 'Магнит', logo: 'magnit.webp', index: 1 },
  { id: 'p5', name: 'Пятёрочка', logo: 'pyaterochka.webp', index: 0.97 },
  { id: 'lenta', name: 'Лента', logo: 'lenta.webp', index: 1 },
  { id: 'auchan', name: 'Ашан', logo: 'auchan.webp', index: 1 },
  { id: 'perek', name: 'Перекрёсток', logo: 'perekrestok.webp', index: 1.1 },
];

/** Набор магазинов по умолчанию — используется во всех расчётах. */
export const DEFAULT_STORES = STORES.map((s) => s.id);

export const DIETS = [
  { id: 'omni', emoji: '🥩', name: 'Всеядный', sub: 'Ем всё', rank: 3 },
  { id: 'pesc', emoji: '🐟', name: 'Пескетарианец', sub: 'Рыба и морепродукты', rank: 2 },
  { id: 'veget', emoji: '🥗', name: 'Вегетарианец', sub: 'Без мяса и рыбы', rank: 1 },
  { id: 'vegan', emoji: '🌱', name: 'Веган', sub: 'Только растительное', rank: 0 },
];

export const ALLERGENS = [
  { id: 'nuts', emoji: '🌰', name: 'Орехи' },
  { id: 'glut', emoji: '🌾', name: 'Глютен' },
  { id: 'lact', emoji: '🥛', name: 'Лактоза' },
  { id: 'pnut', emoji: '🥜', name: 'Арахис' },
  { id: 'sea', emoji: '🦐', name: 'Морепродукты' },
  { id: 'eggs', emoji: '🥚', name: 'Яйца' },
  { id: 'hony', emoji: '🍯', name: 'Мёд' },
  { id: 'soy', emoji: '🫘', name: 'Соя' },
  { id: 'fish', emoji: '🐟', name: 'Рыба' },
  { id: 'citr', emoji: '🍊', name: 'Цитрусовые' },
  { id: 'ses', emoji: '🫓', name: 'Кунжут' },
];

export const DISLIKES = [
  { id: 'mush', emoji: '🍄', name: 'Грибы' },
  { id: 'onio', emoji: '🧅', name: 'Лук' },
  { id: 'garl', emoji: '🧄', name: 'Чеснок' },
  { id: 'oliv', emoji: '🫒', name: 'Оливки' },
  { id: 'eggp', emoji: '🍆', name: 'Баклажаны' },
  { id: 'cila', emoji: '🌿', name: 'Кинза' },
  { id: 'spic', emoji: '🌶', name: 'Острое' },
  { id: 'sugr', emoji: '🍬', name: 'Сахар' },
  { id: 'pork', emoji: '🥓', name: 'Свинина' },
  { id: 'beef', emoji: '🥩', name: 'Красное мясо' },
  { id: 'caff', emoji: '☕', name: 'Кофеин' },
  { id: 'tofu', emoji: '🧊', name: 'Тофу' },
];

export const KITCHEN = [
  { id: 'stove', emoji: '🔥', name: 'Плита' },
  { id: 'oven', emoji: '🥧', name: 'Духовка' },
  { id: 'micro', emoji: '⏲️', name: 'Микроволновка' },
  { id: 'multi', emoji: '🍲', name: 'Мультиварка' },
  { id: 'air', emoji: '🌀', name: 'Аэрогриль' },
  { id: 'blend', emoji: '🥤', name: 'Блендер' },
  { id: 'steam', emoji: '♨️', name: 'Пароварка' },
  { id: 'grill', emoji: '🍳', name: 'Сковорода-гриль' },
];

export const LIFESTYLES = [
  { emoji: '🛋', name: 'Сидячий', sub: 'Работа за столом, мало шагов', k: 1.2 },
  { emoji: '🚶', name: 'Спокойный', sub: 'Прогулки и лёгкая нагрузка', k: 1.375 },
  { emoji: '🏃', name: 'Умеренный', sub: '2–3 тренировки в неделю', k: 1.46 },
  { emoji: '🚴', name: 'Активный', sub: 'Спорт 4–5 раз в неделю', k: 1.55 },
  { emoji: '🔥', name: 'Очень активный', sub: 'Ежедневные нагрузки', k: 1.72 },
];

export const GOALS = [
  { id: 'lose', emoji: '⚖️', name: 'Похудеть' },
  { id: 'keep', emoji: '🤍', name: 'Поддерживать вес' },
  { id: 'gain', emoji: '💪', name: 'Набрать мышцы' },
];

export const PACES = [
  { id: 'soft', name: 'Бережно', kg: 0.3 },
  { id: 'sure', name: 'Уверенно', kg: 0.5 },
  { id: 'fast', name: 'Активно', kg: 0.7 },
];

export const NORM_MODES = [
  { id: 'balance', name: 'Сбалансированно', p: 26, f: 30 },
  { id: 'protein', name: 'Больше белка', p: 34, f: 30 },
  { id: 'lowcarb', name: 'Меньше углеводов', p: 30, f: 38 },
];

/** Сколько порций одной готовки хватает: база + рост на каждого едока. */
export function servingScale(adults, kidsCount) {
  return Math.max(1, adults) + 0.6 * Math.min(Math.max(0, kidsCount), 8);
}

const r2 = (n, step) => step * Math.round(n / step);

/**
 * Базовый обмен веществ. Пол «both» — семья из двух человек разного пола:
 * считаем среднее между женской и мужской формулой.
 */
export function bmr(sex, weight, height, age) {
  const f = 655 + 9.6 * weight + 1.8 * height - 4.7 * age;
  const m = 66 + 13.7 * weight + 5 * height - 6.8 * age;
  if (sex === 'm') return m;
  if (sex === 'both') return (f + m) / 2;
  return f;
}

/** Основа расчёта — для подписи на экране нормы. */
export const SEX_OPTIONS = [
  { id: 'f', emoji: '👩', name: 'Женский', sub: 'Формула для женщин' },
  { id: 'm', emoji: '👨', name: 'Мужской', sub: 'Формула для мужчин' },
  { id: 'both', emoji: '👫', name: 'Оба пола', sub: 'Средняя норма на двоих' },
];

export function sexLabel(sex) {
  return SEX_OPTIONS.find((s) => s.id === sex)?.name || 'Женский';
}

/** Суточная норма с учётом образа жизни и поправки пользователя. */
export function dailyKcal(profile) {
  const k = LIFESTYLES[Math.min(LIFESTYLES.length - 1, Math.max(0, profile.life ?? 2))].k;
  const base = bmr(profile.sex, profile.weight, profile.height, profile.age) * k - 350;
  const adjust = profile.normAdjust ?? 0;
  return Math.max(900, Math.round((base + adjust) / 10) * 10);
}

export function macrosFor(kcal, mode) {
  const m = NORM_MODES.find((x) => x.id === mode) || NORM_MODES[0];
  const protein = Math.round((kcal * m.p) / 100 / 4);
  const fat = Math.round((kcal * m.f) / 100 / 9);
  const carb = Math.max(0, Math.round((kcal - 4 * protein - 9 * fat) / 4));
  return { p: protein, f: fat, c: carb };
}

/** КБЖУ блюда на одну порцию заданного размера. */
export function dishNutrition(recipe, portion = 1) {
  let kcal = 0, p = 0, f = 0, c = 0, grams = 0;
  for (const [id, g] of recipe.items) {
    const prod = BY_ID.get(id);
    if (!prod) continue;
    const k = (g * portion) / 100;
    kcal += prod.kcal * k;
    p += prod.prot * k;
    f += prod.fat * k;
    c += prod.carb * k;
    grams += g * portion;
  }
  return {
    kcal: Math.round(kcal),
    p: Math.round(p),
    f: Math.round(f),
    c: Math.round(c),
    grams: Math.round(grams),
  };
}

function dietRankOf(recipe) {
  let rank = 3;
  for (const [id] of recipe.items) {
    const prod = BY_ID.get(id);
    if (!prod) continue;
    rank = Math.min(rank, DIET_RANK[prod.diet]);
  }
  return rank;
}

/** Можно ли блюдо этому профилю: тип питания, аллергии, «не люблю», техника. */
function recipeAllowed(recipe, prefs) {
  const diet = DIETS.find((d) => d.id === prefs.diet) || DIETS[0];
  if (dietRankOf(recipe) > diet.rank) return false;
  for (const id of prefs.allergies || []) {
    if (recipe.items.some(([pid]) => BY_ID.get(pid)?.[id])) return false;
  }
  for (const id of prefs.dislikes || []) {
    if (recipe.items.some(([pid]) => BY_ID.get(pid)?.dislike === id)) return false;
  }
  const stop = (prefs.stopFoods || []).map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (stop.length) {
    const hay = [
      recipe.name.toLowerCase(),
      ...recipe.items.map(([pid]) => (BY_ID.get(pid)?.name || '').toLowerCase()),
    ];
    for (const s of stop) if (hay.some((h) => h.includes(s))) return false;
  }
  const equip = recipe.equip || [];
  const kitchen = prefs.kitchen || [];
  const usable = equip.every((e) => kitchen.includes(e) || kitchen.length === 0);
  if (!usable) return false;
  return true;
}

/** Цена одной порции блюда в базовых ценах (без индекса магазина). */
function portionCost(recipe, portion) {
  let sum = 0;
  for (const [id, g] of recipe.items) {
    const prod = BY_ID.get(id);
    if (!prod) continue;
    sum += (prod.price * g * portion) / 1000;
  }
  return sum;
}

/** Средний индекс цен выбранных магазинов. */
export function storeIndex(storeIds) {
  const picked = STORES.filter((s) => storeIds.includes(s.id));
  if (!picked.length) return 1;
  return picked.reduce((a, s) => a + s.index, 0) / picked.length;
}

/** Базовый недельный минимум: сколько стоит собрать меню «как есть». */
export function estimateBaseWeeklyCost(prefs) {
  const scale = servingScale(prefs.adults, prefs.kids.length);
  const days = 7;
  let sum = 0;
  for (const meal of MEALS) {
    const isMine = prefs.meals.includes(meal.id);
    const isFam = prefs.famMeals.includes('fam-' + meal.id);
    if (!isMine && !isFam) continue;
    const list = RECIPES.filter((r) => r.meal === meal.id && recipeAllowed(r, prefs));
    if (!list.length) continue;
    const avg = list.reduce((a, r) => a + portionCost(r, 1), 0) / list.length;
    sum += avg * days * (isFam ? scale : 1);
  }
  return sum * storeIndex(prefs.stores);
}

/** Стоимость собранного меню в базовых ценах: то, что реально уйдёт за неделю. */
function menuBaseCost(days) {
  let sum = 0;
  for (const d of days) {
    for (const m of d.meals) {
      const use = Math.max(m.cookPortions ?? m.portions, m.eatPortions);
      sum += portionCost(m.recipe, use);
    }
  }
  return sum;
}

export function budgetLevel(perPerson) {
  if (perPerson < 1500) return { name: 'Очень экономно', sub: 'Крупы, сезонные овощи, курица и яйца', tone: 'warn' };
  if (perPerson < 2600) return { name: 'Экономно', sub: 'Простые блюда, мясо несколько раз в неделю', tone: 'warn' };
  if (perPerson < 4000) return { name: 'Сбалансированно', sub: 'Мясо, рыба и овощи каждый день', tone: 'ok' };
  if (perPerson < 6000) return { name: 'Комфортно', sub: 'Больше разнообразия, рыба и фрукты без оглядки', tone: 'ok' };
  return { name: 'Свободно', sub: 'Любые продукты, без ограничений', tone: 'ok' };
}

/** «Волшебное» число для сходства с оригиналом: сид, продукты. */
export function makeSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Средняя «своя» калорийность дня: по порции каждого блюда на человека. */
function ownDailyFrom(days) {
  const perDay = days.reduce(
    (a, d) =>
      a + d.meals.reduce((b, m) => b + dishNutrition(m.recipe, Math.min(1, m.eatPortions)).kcal, 0),
    0
  );
  return Math.round(perDay / Math.max(1, days.length));
}

/** Меню на 7 дней: без повторов внутри лимита, с учётом любимых продуктов. */
function buildMenu(prefs, rand, portionAdjust = 1) {
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const requestedRepeat = Math.max(1, Math.min(3, prefs.repeat || 2));
  const scale = servingScale(prefs.adults, prefs.kids.length);
  const activeMeals = MEALS.filter(
    (meal) => prefs.meals.includes(meal.id) || prefs.famMeals.includes('fam-' + meal.id)
  );

  const liked = prefs.likedProducts || [];
  const pools = {};
  for (const meal of activeMeals) {
    const allowed = RECIPES.filter((r) => r.meal === meal.id && recipeAllowed(r, prefs));
    // Блюда, где больше любимых продуктов, стоят в начале очереди — они чаще в меню.
    const scored = allowed.map((r) => ({
      r,
      score: liked.reduce((a, id) => a + (r.items.some(([pid]) => pid === id) ? 1 : 0), 0),
    }));
    const likedBlock = shuffle(scored.filter((x) => x.score > 0), rand)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.r);
    const tail = shuffle(scored.filter((x) => x.score === 0).map((x) => x.r), rand);
    const queue = liked.length > 0 && likedBlock.length > 0 ? likedBlock : [...likedBlock, ...tail];
    pools[meal.id] = { queue, counts: new Map(), cursor: 0 };
    // Реальный лимит повторов: нельзя требовать 1 повтор, если блюд всего два.
    const supply = Math.max(1, Math.ceil(queue.length / 7));
    pools[meal.id].limit = Math.max(1, Math.min(requestedRepeat, supply));
  }

  const cookDays = new Set(
    (prefs.days || []).map((d) => weekdays.indexOf(d.charAt(0).toUpperCase() + d.slice(1, 3).toLowerCase())).filter((i) => i >= 0)
  );

  function pick(mealId, slotIndex) {
    const pool = pools[mealId];
    if (!pool || !pool.queue.length) return null;
    if (pool.cursor >= pool.queue.length) pool.cursor = 0; // круг замкнулся — идём по второму кругу
    const wantMore = slotIndex === 5 || slotIndex === 6; // выходные — блюдо посложнее
    const rank = (r) => (r.special ? 2 : r.tags.includes('быстро') ? 0 : 1);
    for (let pass = 0; pass < 3; pass++) {
      const from = pool.cursor;
      for (let i = 0; i < pool.queue.length; i++) {
        const idx = (from + i) % pool.queue.length;
        const r = pool.queue[idx];
        const n = pool.counts.get(r.id) || 0;
        if (n >= pool.limit) continue;
        if (pass === 0 && wantMore && rank(r) === 0) continue;
        if (pass === 0 && !wantMore && rank(r) === 2) continue;
        pool.counts.set(r.id, n + 1);
        pool.cursor = (idx + 1) % pool.queue.length;
        return r;
      }
    }
    return pool.queue[pool.cursor];
  }

  const days = [];
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const isCook = cookDays.has(dayIndex);
    const meals = [];
    for (const meal of activeMeals) {
      const recipe = pick(meal.id, dayIndex);
      if (!recipe) continue;
      const isMine = prefs.meals.includes(meal.id);
      const isFam = prefs.famMeals.includes('fam-' + meal.id);
      const scope = isFam ? 'fam' : 'me';
      // Едим каждый свою порцию: общее блюдо — это не «порция на всех».
      const eatPortions = (isFam ? scale : 1) * portionAdjust;
      // В день готовки партия уходит впрок, в остальные — ровно на этот приём.
      const batch = scope === 'fam' && isCook ? scale * portionAdjust : eatPortions;
      meals.push({
        meal: meal.id,
        mealName: meal.name,
        emoji: meal.emoji,
        scope,
        scopeName: isFam ? meal.famName : meal.name,
        portions: Math.round(batch * 10) / 10,
        cookPortions: Math.round(batch * 10) / 10,
        eatPortions: Math.round(eatPortions * 10) / 10,
        mode: scope === 'fam' && !isCook && cookDays.size ? 'reheat' : 'cook',
        recipe,
      });
    }
    days.push({ index: dayIndex, name: weekdays[dayIndex], isCook, meals });
  }
  return days;
}

/**
 * Список покупок: складываем столько продукта, сколько реально съедят
 * (своя порция + порция на каждого, если блюдо общее).
 */
function buildShoppingList(days, prefs, factor = 1) {
  const totals = new Map();
  for (const day of days) {
    for (const m of day.meals) {
      // Покупаем ровно то, что уйдёт за неделю: партию в день готовки
      // либо порции на всех едоков в обычный день.
      const use = Math.max(m.cookPortions ?? m.portions, m.eatPortions) * factor;
      for (const [id, g] of m.recipe.items) {
        totals.set(id, (totals.get(id) || 0) + g * use);
      }
    }
  }

  const storeIds = prefs.stores.length ? prefs.stores : ['mag'];
  const index = storeIndex(storeIds);
  const unavailable = new Set();
  for (const s of STORES) {
    if (!storeIds.includes(s.id)) continue;
    for (const id of s.no || []) unavailable.add(id);
  }
  const multis = storeIds.length > 1;

  const items = [];
  let total = 0;
  let pantryCost = 0;
  for (const [id, grams] of totals) {
    const prod = BY_ID.get(id);
    if (!prod) continue;
    const rounded = roundPack(prod, grams, prefs.adults + prefs.kids.length);
    let price = (prod.price * rounded.buy) / 1000;
    const notEverywhere = unavailable.has(id);
    if (notEverywhere && multis) price *= 1.06; // придётся искать в другом магазине
    const isPantry = PANTRY.includes(id);
    if (isPantry) pantryCost += price;
    total += price;
    items.push({
      id,
      name: prod.name,
      type: prod.type,
      amount: rounded.amount,
      unit: rounded.unit,
      packs: rounded.packs,
      buy: rounded.buy,
      price: Math.round(price),
      pantry: isPantry,
      note: notEverywhere && multis ? 'не во всех выбранных магазинах' : undefined,
    });
  }
  items.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name, 'ru'));

  const aisles = AISLES.map((a) => ({
    ...a,
    items: items.filter((i) => i.type === a.id && !i.pantry),
    sum: items.filter((i) => i.type === a.id && !i.pantry).reduce((s, i) => s + i.price, 0),
  })).filter((a) => a.items.length);

  return {
    items: items.filter((i) => !i.pantry),
    pantryItems: items.filter((i) => i.pantry),
    aisles,
    total: Math.round(total),
    pantryCost: Math.round(pantryCost),
    grossTotal: Math.round(total),
    index,
    unavailable: [...unavailable],
  };
}

/** Округляем до реальной упаковки: яйца — десятками, крупы — по 100 г и т.п. */
function roundPack(prod, grams, people) {
  const g = Math.max(1, Math.ceil(grams));
  if (prod.unit === 'шт' && prod.unitG) {
    const count = Math.max(1, Math.round(g / prod.unitG));
    const packs = Math.max(1, Math.ceil(count / 10));
    return { amount: count, unit: 'шт', buy: packs * 10 * prod.unitG, packs };
  }
  if (g >= 1000) {
    const buy = Math.ceil(g / 100) * 100;
    return { amount: Math.round(buy / 10) * 10, unit: 'г', buy };
  }
  if (prod.type === 'other' && g < 120) {
    const buy = Math.ceil(g / 10) * 10;
    return { amount: buy, unit: 'г', buy };
  }
  const step = people > 2 ? 100 : 50;
  const buy = Math.max(step, Math.ceil(g / step) * step);
  return { amount: buy, unit: 'г', buy };
}

/** Сжимаем порции, если корзина не влезает в бюджет. */
function fitToBudget(days, budget, baseCost) {
  if (!budget || budget >= baseCost) return { factor: 1, over: false };
  // Оставляем запас на округление упаковок: в магазине всё равно берём целыми.
  const factor = Math.max(0.45, Math.min(1, (budget * 0.9) / baseCost));
  return { factor, over: budget < baseCost * 0.55 };
}

export function buildPlan(input) {
  const prefs = {
    stores: input.stores?.length ? input.stores : ['mag'],
    adults: Math.max(1, input.adults ?? 2),
    kids: input.kids ?? [],
    meals: input.meals?.length ? input.meals : ['breakfast', 'lunch', 'dinner'],
    famMeals: input.famMeals ?? [],
    sex: input.sex ?? 'f',
    diet: input.diet ?? 'omni',
    likedProducts: input.likedProducts ?? [],
    allergies: input.allergies ?? [],
    dislikes: input.dislikes ?? [],
    stopFoods: input.stopFoods ?? [],
    kitchen: input.kitchen?.length ? input.kitchen : ['stove'],
    age: input.age ?? 30,
    height: input.height ?? 168,
    weight: input.weight ?? 68,
    goal: input.goal ?? 'lose',
    target: input.target ?? (input.weight ?? 68) - 5,
    pace: input.pace ?? 'sure',
    life: input.life ?? 2,
    cycle: input.cycle ?? null,
    cycleLen: input.cycleLen ?? 28,
    periodDate: input.periodDate ?? null,
    normMode: input.normMode ?? 'balance',
    normAdjust: input.normAdjust ?? 0,
    coffee: input.coffee ?? null,
    drinks: input.drinks ?? [],
    cups: input.cups ?? 0,
    spoons: input.spoons ?? 0,
    repeat: input.repeat ?? 2,
    days: input.days ?? ['wed', 'sat'],
  };

  const seed = makeSeed(
    [
      prefs.stores.join(','), prefs.adults, prefs.kids.join(','), prefs.meals.join(','),
      prefs.famMeals.join(','), prefs.sex, prefs.diet, prefs.likedProducts.join(','),
      prefs.allergies.join(','), prefs.dislikes.join(','), prefs.stopFoods.join(','),
      prefs.kitchen.join(','), prefs.repeat, prefs.days.join(','),
    ].join('|')
  );
  const rand = rng(seed);

  const kcal = dailyKcal(prefs);
  const macros = macrosFor(kcal, prefs.normMode);

  // Подбираем размер порций так, чтобы меню дотягивало до дневной нормы.
  const probeMenu = buildMenu(prefs, rand);
  const probeOwn = ownDailyFrom(probeMenu);
  const portionAdjust = Math.max(0.8, Math.min(1.6, Math.round((kcal / Math.max(1, probeOwn)) * 20) / 20));
  const days = portionAdjust === 1 ? probeMenu : buildMenu(prefs, rng(seed), portionAdjust);

  const index = storeIndex(prefs.stores);
  const baseWeekly = Math.round(menuBaseCost(days) * index);
  const budget = input.budget && input.budget > 0 ? input.budget : null;
  let fit = fitToBudget(days, budget, baseWeekly);
  // Упаковки округляются вверх, поэтому одной прикидки мало: подгоняем точнее.
  const shoppingProbe = buildShoppingList(days, prefs, fit.factor);
  if (budget && shoppingProbe.total > budget) {
    const corrected = Math.max(0.4, fit.factor * (budget / shoppingProbe.total));
    fit = { factor: corrected, over: fit.over };
  }

  const menu = days.map((d) => {
    const meals = d.meals.map((m) => {
      // КБЖУ — на то, что съедает человек за столом; корзина — на всю партию.
      const eat = m.eatPortions * fit.factor;
      const nut = dishNutrition(m.recipe, eat);
      const batch = (m.cookPortions ?? m.portions) * fit.factor;
      return {
        ...m,
        portions: Math.round(batch * 10) / 10,
        cookPortions: Math.round(batch * 10) / 10,
        eatPortions: Math.round(eat * 10) / 10,
        nutrition: nut,
        // Цена съеденной порции этого блюда.
        cost: Math.round(portionCost(m.recipe, eat) * storeIndex(prefs.stores)),
      };
    });
    const totals = meals.reduce(
      (a, m) => ({
        kcal: a.kcal + m.nutrition.kcal,
        p: a.p + m.nutrition.p,
        f: a.f + m.nutrition.f,
        c: a.c + m.nutrition.c,
      }),
      { kcal: 0, p: 0, f: 0, c: 0 }
    );
    const batchKcal = meals.reduce(
      (a, m) => a + dishNutrition(m.recipe, m.cookPortions).kcal,
      0
    );
    return {
      ...d,
      meals,
      totals: {
        kcal: Math.round(totals.kcal),
        p: Math.round(totals.p),
        f: Math.round(totals.f),
        c: Math.round(totals.c),
      },
      batchKcal: Math.round(batchKcal),
      cost: meals.reduce((a, m) => a + m.cost, 0),
    };
  });

  const shopping = buildShoppingList(days, prefs, fit.factor);
  const weekCost = Math.round(shopping.total);
  // Показываем уровень по тому, что человек реально ввёл, а не по расчётному минимуму.
  const budgetForLevel = budget && budget < weekCost ? budget : weekCost;
  const people = prefs.adults + prefs.kids.length;
  const perPerson = Math.round(budgetForLevel / Math.max(1, people));
  const level = budgetLevel(perPerson);

  const plan = {
    profile: prefs,
    seed,
    kcal,
    macros,
    days: menu,
    shopping,
    budget: {
      entered: budget,
      week: weekCost,
      min: Math.round(baseWeekly),
      comfortable: Math.round(Math.max(baseWeekly, 2800 * prefs.adults + 1900 * prefs.kids.length)),
      perPerson,
      level,
      squeeze: fit.factor < 1 ? Math.round((1 - fit.factor) * 100) : 0,
      fits: !budget || weekCost <= budget * 1.02,
      daily: Math.round(weekCost / 7),
    },
    avgDaily: Math.round(menu.reduce((a, d) => a + d.totals.kcal, 0) / Math.max(1, menu.length)),
    // «Свои» калории: своя порция каждого блюда, включая общие (одна порция).
    ownDaily: ownDailyFrom(menu),
    portionAdjust,
    uniqueness: new Set(menu.flatMap((d) => d.meals.map((m) => m.recipe.id))).size,
    servingScale: Math.round(servingScale(prefs.adults, prefs.kids.length) * 10) / 10,
  };
  plan.training = buildTraining(prefs);
  plan.actions = buildActions(plan);
  plan.substitutions = buildSubstitutions(plan);
  plan.coverage = buildCoverage(plan);
  return plan;
}

/** Хватает ли меню на дневную норму; если нет — что включить. */
function buildCoverage(plan) {
  const p = plan.profile;
  // Если в плане есть общие блюда, ориентир — своя доля; иначе общий объём.
  const covered = p.famMeals.length ? Math.min(plan.ownDaily, plan.avgDaily) : plan.avgDaily;
  const ratio = covered / plan.kcal;
  const picked = [...p.meals, ...p.famMeals.map((f) => f.replace('fam-', ''))];
  const missing = MEALS.filter((m) => !picked.includes(m.id));
  if (ratio >= 0.92) {
    return { ok: true, text: `Меню закрывает ${Math.round(ratio * 100)}% дневной нормы — можно есть как есть.` };
  }
  const missingNames = missing.map((m) => m.name.toLowerCase()).join(', ');
  return {
    ok: false,
    ratio,
    missingNames,
    text: missing.length
      ? `Меню закрывает ${Math.round(ratio * 100)}% нормы: не отмечены ${missingNames}. Включите их на шаге «Сколько приёмов пищи» — рацион дотянется до ${plan.kcal} ккал.`
      : `Меню закрывает ${Math.round(ratio * 100)}% нормы: калорий маловато. Добавьте перекус или уменьшите поправку нормы.`,
    addKcal: Math.max(0, plan.kcal - covered),
  };
}

/** Чем заменить продукт, если он не влез в бюджет или не нашёлся. */
function buildSubstitutions(plan) {
  const map = [
    ['salmon', 'pink', 'лосось → горбуша'],
    ['beef', 'chicken', 'говядина → курица'],
    ['turkey', 'chicken', 'индейка → курица'],
    ['quinoa', 'buckwheat', 'киноа → гречка'],
    ['almond', 'peanut', 'миндаль → арахис'],
    ['feta', 'curd', 'фета → творог'],
    ['cream', 'milk', 'сливки → молоко 2,5%'],
    ['cheese', 'curd', 'твёрдый сыр → творог'],
    ['shrimp', 'pollock', 'креветки → минтай'],
    ['tofu', 'chickpea', 'тофу → нут'],
  ];
  const inPlan = new Set(plan.shopping.items.map((i) => i.id));
  return map
    .filter(([from, to]) => inPlan.has(from) && BY_ID.has(to))
    .map(([from, to, label]) => ({
      label,
      from: BY_ID.get(from).name,
      to: BY_ID.get(to).name,
      saves: Math.max(0, Math.round(BY_ID.get(from).price - BY_ID.get(to).price)),
    }))
    .sort((a, b) => b.saves - a.saves)
    .slice(0, 6);
}

/** План активности — отдаём бесплатно, как и рацион. */
function buildTraining(prefs) {
  const goal = prefs.goal;
  const level = Math.min(4, Math.max(0, prefs.life));
  const freq = level <= 1 ? 2 : level === 2 ? 3 : level === 3 ? 4 : 5;
  const week = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const blocks = {
    lose: [
      { title: 'Интервальная ходьба', detail: '30–40 мин: 3 мин быстро / 3 мин спокойно', kcal: 240 },
      { title: 'Силовая на всё тело', detail: 'приседания, тяга, отжимания от опоры — 3 круга', kcal: 260 },
      { title: 'Кардио + пресс', detail: '20 мин кардио, затем 3×30 сек планка', kcal: 220 },
      { title: 'Прогулка быстрым шагом', detail: '45–60 мин в комфортном темпе', kcal: 200 },
    ],
    keep: [
      { title: 'Силовая на всё тело', detail: 'базовые движения, 3 подхода по 10–12', kcal: 240 },
      { title: 'Мобильность и растяжка', detail: '20–25 мин, дыхание и мягкие наклоны', kcal: 120 },
      { title: 'Кардио по самочувствию', detail: '25–35 мин: велосипед, эллипс или ходьба', kcal: 220 },
    ],
    gain: [
      { title: 'Силовая: верх тела', detail: 'жим, тяга, отжимания — 4 подхода по 8–10', kcal: 280 },
      { title: 'Силовая: низ тела', detail: 'приседания, выпады, ягодичный мост — 4×8–10', kcal: 300 },
      { title: 'Силовая: всё тело + кор', detail: '3 круга по 6 упражнений', kcal: 300 },
      { title: 'Восстановление', detail: 'прогулка 30–40 мин и растяжка', kcal: 140 },
    ],
  }[goal];
  const out = [];
  let b = 0;
  for (let i = 0; i < 7; i++) {
    const isTraining = (i * 2) % 7 < freq * 2 && i !== 3;
    if (isTraining) {
      const blk = blocks[b % blocks.length];
      out.push({ day: week[i], ...blk, type: 'training' });
      b++;
    } else {
      out.push({
        day: week[i],
        title: i === 3 ? 'День отдыха' : 'Шаги и разгрузка',
        detail: i === 3 ? 'Ничего не планируем — восстановление' : '8–10 тысяч шагов, вода, сон 7–8 часов',
        kcal: i === 3 ? 0 : 120,
        type: 'rest',
      });
    }
  }
  return {
    freq,
    week: out,
    weeklyKcal: out.reduce((a, x) => a + x.kcal, 0),
    note:
      goal === 'lose'
        ? 'Силовые сохраняют мышцы, пока вес идёт вниз. Кардио — добавка, не наказание.'
        : goal === 'gain'
        ? 'Главное — прогрессия нагрузки и белок 1,6–2 г на кг веса.'
        : 'Задача — держать тонус и не перегружаться: 2 силовые и движение каждый день.',
  };
}

/** Что делать с рационом: замены, заготовки, экономия. */
function buildActions(plan) {
  const out = [];
  const cook = plan.days.filter((d) => d.isCook);
  if (cook.length) {
    out.push({
      emoji: '🍳',
      title: `Готовим впрок: ${cook.map((d) => d.name).join(', ')}`,
      text: `В эти дни делаем сразу ${plan.servingScale} порции — на ${cook.length > 1 ? 'последующие дни' : 'следующий день'} останется только разогреть.`,
    });
  }
  const top = plan.shopping.items.slice(0, 3);
  if (top.length) {
    out.push({
      emoji: '🛒',
      title: `Главные траты: ${top.map((i) => i.name.toLowerCase()).join(', ')}`,
      text: `Это ${Math.round((top.reduce((a, i) => a + i.price, 0) / Math.max(1, plan.shopping.total)) * 100)}% корзины. Берите эти позиции на акциях или в другом магазине — сэкономите до ${Math.round(top.reduce((a, i) => a + i.price, 0) * 0.2)} ₽.`,
    });
  }
  out.push({
    emoji: '🥶',
    title: 'Что можно заморозить',
    text: 'Котлеты, рагу, супы и запеканки спокойно живут в морозилке 2–3 недели. Замораживайте порциями — не придётся готовить каждый день.',
  });
  out.push({
    emoji: '⚖️',
    title: `Держим ${plan.kcal} ккал в день`,
    text: `Белки ${plan.macros.p} г · жиры ${plan.macros.f} г · углеводы ${plan.macros.c} г. Меню собрано примерно на столько же — можно есть как есть, без взвешивания каждой крошки.`,
  });
  if (plan.budget.squeeze) {
    out.push({
      emoji: '📉',
      title: `Бюджет впритык: порции уменьшены на ${plan.budget.squeeze}%`,
      text: 'Овощи и крупы оставили в полном объёме, урезали дорогой белок — так сытнее при той же сумме.',
    });
  }
  return out;
}

/** Замены для блюда: тот же приём пищи, похожая калорийность. */
export function alternativesFor(plan, recipe, limit = 5) {
  const base = dishNutrition(recipe, 1);
  return RECIPES.filter((r) => r.id !== recipe.id && r.meal === recipe.meal)
    .filter((r) => recipeAllowed(r, plan.profile))
    .map((r) => ({ r, d: Math.abs(dishNutrition(r, 1).kcal - base.kcal) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => x.r);
}

export { recipeAllowed, portionCost };
