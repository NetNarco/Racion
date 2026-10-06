/**
 * Продуктовая база: цены (≈₽/кг), КБЖУ на 100 г, отдел магазина,
 * теги для фильтрации рациона (диета, аллергены, «не люблю»).
 * Значения — усреднённые по рознице РФ, используются для расчёта
 * корзины и суточной нормы.
 */

// тип: 'prot' | 'veg' | 'grain' | 'dairy' | 'fruit' | 'other'
// d: 'any' | 'pesc' | 'veget' | 'vegan' — минимально допустимый тип питания
export const PRODUCTS = [
  // ── Белок ───────────────────────────────────────────────────────────────
  p('chicken', 'Курица (бедро)', 'prot', 289, 185, 20.1, 11.2, 0, { d: 'any' }),
  p('chicken_f', 'Куриная грудка', 'prot', 349, 137, 29.8, 1.8, 0, { d: 'any' }),
  p('turkey', 'Индейка (филе)', 'prot', 429, 144, 24.0, 4.5, 0, { d: 'any' }),
  p('beef', 'Говядина (лопатка)', 'prot', 549, 218, 20.5, 14.8, 0, { d: 'any', dislike: 'beef' }),
  p('pork', 'Свинина (шея)', 'prot', 469, 286, 17.5, 23.4, 0, { d: 'any', dislike: 'pork' }),
  p('mince', 'Фарш домашний', 'prot', 419, 236, 18.2, 17.4, 0, { d: 'any', dislike: 'beef' }),
  p('cod', 'Треска (филе)', 'prot', 459, 82, 17.8, 0.7, 0, { d: 'pesc', fish: 1 }),
  p('pollock', 'Минтай (филе)', 'prot', 329, 72, 16.9, 0.7, 0, { d: 'pesc', fish: 1 }),
  p('salmon', 'Лосось (стейк)', 'prot', 1190, 208, 20.4, 13.6, 0, { d: 'pesc', fish: 1 }),
  p('mackerel', 'Скумбрия', 'prot', 379, 191, 18.0, 13.2, 0, { d: 'pesc', fish: 1 }),
  p('herring', 'Сельдь слабосолёная', 'prot', 429, 217, 17.3, 15.8, 0, { d: 'pesc', fish: 1 }),
  p('pink', 'Горбуша (филе)', 'prot', 449, 116, 21.0, 3.2, 0, { d: 'pesc', fish: 1 }),
  p('shrimp', 'Креветки', 'prot', 890, 87, 18.3, 1.2, 0, { d: 'pesc', sea: 1 }),
  p('squid', 'Кальмар', 'prot', 419, 92, 16.5, 1.4, 2, { d: 'pesc', sea: 1 }),
  p('egg', 'Яйцо куриное', 'prot', 129, 143, 12.7, 9.5, 0.7, { d: 'veget', eggs: 1, unit: 'шт', unitG: 55 }),
  p('tofu', 'Тофу', 'prot', 389, 122, 12.5, 7.2, 1.5, { d: 'vegan', soy: 1, dislike: 'tofu' }),
  p('chickpea', 'Нут', 'prot', 219, 364, 19.0, 6.0, 61.0, { d: 'vegan' }),
  p('lentil', 'Чечевица', 'prot', 189, 352, 24.0, 1.5, 60.0, { d: 'vegan' }),
  p('beans', 'Фасоль красная', 'prot', 199, 333, 21.0, 2.0, 60.0, { d: 'vegan' }),
  p('liver', 'Куриная печень', 'prot', 379, 140, 20.4, 5.9, 1.1, { d: 'any' }),
  p('sausage', 'Колбаса варёная', 'prot', 459, 257, 12.8, 22.8, 1.5, { d: 'any' }),

  // ── Овощи ──────────────────────────────────────────────────────────────
  p('potato', 'Картофель', 'veg', 49, 77, 2.0, 0.4, 17.0, { d: 'vegan' }),
  p('broccoli', 'Брокколи', 'veg', 349, 34, 2.8, 0.4, 6.6, { d: 'vegan' }),
  p('cauli', 'Цветная капуста', 'veg', 249, 25, 1.9, 0.3, 5.0, { d: 'vegan' }),
  p('zucchini', 'Кабачок', 'veg', 159, 24, 0.6, 0.3, 4.6, { d: 'vegan' }),
  p('eggplant', 'Баклажан', 'veg', 229, 25, 1.2, 0.1, 5.8, { d: 'vegan', dislike: 'eggp' }),
  p('tomato', 'Помидоры', 'veg', 229, 20, 1.1, 0.2, 3.7, { d: 'vegan' }),
  p('cucumber', 'Огурцы', 'veg', 199, 15, 0.8, 0.1, 2.8, { d: 'vegan' }),
  p('pepper', 'Перец болгарский', 'veg', 279, 27, 1.3, 0.1, 5.3, { d: 'vegan' }),
  p('carrot', 'Морковь', 'veg', 59, 35, 1.3, 0.1, 6.9, { d: 'vegan' }),
  p('onion', 'Лук репчатый', 'veg', 59, 41, 1.4, 0.2, 8.2, { d: 'vegan', dislike: 'onio' }),
  p('garlic', 'Чеснок', 'veg', 359, 149, 6.5, 0.5, 29.9, { d: 'vegan', dislike: 'garl' }),
  p('cabbage', 'Капуста белокочанная', 'veg', 39, 28, 1.8, 0.1, 4.7, { d: 'vegan' }),
  p('caulibroc', 'Капуста брюссельская', 'veg', 379, 43, 3.4, 0.3, 9.0, { d: 'vegan' }),
  p('spinach', 'Шпинат', 'veg', 449, 23, 2.9, 0.4, 2.0, { d: 'vegan' }),
  p('lettuce', 'Салат листовой', 'veg', 399, 15, 1.4, 0.2, 2.9, { d: 'vegan' }),
  p('mush', 'Шампиньоны', 'veg', 329, 27, 4.3, 1.0, 0.1, { d: 'vegan', dislike: 'mush' }),
  p('beet', 'Свёкла', 'veg', 59, 43, 1.6, 0.2, 9.6, { d: 'vegan' }),
  p('pumpkin', 'Тыква', 'veg', 89, 26, 1.0, 0.1, 4.9, { d: 'vegan' }),
  p('greenpea', 'Горошек зелёный', 'veg', 199, 73, 5.0, 0.2, 13.8, { d: 'vegan' }),
  p('corn', 'Кукуруза', 'veg', 179, 86, 3.2, 1.2, 19.0, { d: 'vegan' }),
  p('olive', 'Оливки', 'veg', 749, 145, 1.0, 15.3, 3.8, { d: 'vegan', dislike: 'oliv' }),
  p('greens', 'Зелень (укроп/петрушка)', 'veg', 449, 36, 3.0, 0.5, 6.3, { d: 'vegan' }),
  p('cilantro', 'Кинза', 'veg', 399, 23, 2.1, 0.5, 3.7, { d: 'vegan', dislike: 'cila' }),
  p('sauerkraut', 'Капуста квашеная', 'veg', 149, 19, 1.8, 0.1, 3.0, { d: 'vegan' }),
  p('seaweed', 'Морская капуста', 'veg', 349, 25, 0.9, 0.2, 3.0, { d: 'vegan' }),

  // ── Крупы и гарниры ────────────────────────────────────────────────────
  p('buckwheat', 'Гречка', 'grain', 119, 343, 12.6, 3.3, 62.0, { d: 'vegan' }),
  p('millet', 'Пшено', 'grain', 99, 348, 11.5, 3.3, 69.3, { d: 'vegan' }),
  p('flour_oats', 'Мука овсяная', 'grain', 179, 369, 13.0, 6.8, 61.0, { d: 'vegan', glut: 1 }),
  p('flour_wheat', 'Мука пшеничная', 'grain', 69, 342, 10.3, 1.1, 70.6, { d: 'vegan', glut: 1 }),
  p('rice', 'Рис длиннозёрный', 'grain', 129, 344, 6.7, 0.7, 78.9, { d: 'vegan' }),
  p('brown_rice', 'Рис бурый', 'grain', 179, 337, 7.4, 1.8, 72.9, { d: 'vegan' }),
  p('oats', 'Овсяные хлопья', 'grain', 99, 366, 12.3, 6.1, 59.5, { d: 'vegan' }),
  p('pasta', 'Паста из твёрдых сортов', 'grain', 179, 350, 12.5, 1.5, 70.0, { d: 'vegan', glut: 1 }),
  p('noodles', 'Лапша пшеничная', 'grain', 159, 348, 11.0, 1.2, 71.0, { d: 'vegan', glut: 1 }),
  p('couscous', 'Кускус', 'grain', 219, 376, 12.8, 0.6, 77.4, { d: 'vegan', glut: 1 }),
  p('bulgur', 'Булгур', 'grain', 169, 342, 12.3, 1.3, 63.4, { d: 'vegan', glut: 1 }),
  p('quinoa', 'Киноа', 'grain', 549, 368, 14.1, 6.1, 57.2, { d: 'vegan' }),
  p('bread', 'Хлеб цельнозерновой', 'grain', 149, 247, 8.5, 3.3, 41.0, { d: 'vegan', glut: 1, unit: 'г', unitG: 30 }),
  p('lavash', 'Лаваш тонкий', 'grain', 159, 275, 9.0, 1.0, 56.0, { d: 'vegan', glut: 1 }),

  // ── Молочное ───────────────────────────────────────────────────────────
  p('milk', 'Молоко 2,5%', 'dairy', 79, 52, 2.8, 2.5, 4.7, { d: 'veget', lact: 1 }),
  p('kefir', 'Кефир 1%', 'dairy', 89, 40, 3.0, 1.0, 4.0, { d: 'veget', lact: 1 }),
  p('curd', 'Творог 5%', 'dairy', 429, 121, 17.0, 5.0, 1.8, { d: 'veget', lact: 1 }),
  p('curd0', 'Творог обезжиренный', 'dairy', 469, 78, 16.5, 0.5, 1.5, { d: 'veget', lact: 1 }),
  p('yogurt', 'Йогурт натуральный', 'dairy', 199, 66, 4.3, 3.2, 4.5, { d: 'veget', lact: 1 }),
  p('sourcream', 'Сметана 15%', 'dairy', 349, 158, 2.6, 15.0, 3.0, { d: 'veget', lact: 1 }),
  p('cream', 'Сливки 10%', 'dairy', 229, 118, 2.8, 10.0, 4.0, { d: 'veget', lact: 1 }),
  p('cheese', 'Сыр твёрдый', 'dairy', 849, 364, 24.0, 29.0, 0.5, { d: 'veget', lact: 1 }),
  p('feta', 'Сыр фета', 'dairy', 899, 264, 14.2, 21.3, 4.1, { d: 'veget', lact: 1 }),
  p('butter', 'Масло сливочное', 'dairy', 1190, 748, 0.5, 82.5, 0.8, { d: 'veget', lact: 1 }),

  // ── Фрукты и ягоды ─────────────────────────────────────────────────────
  p('apple', 'Яблоки', 'fruit', 129, 52, 0.4, 0.2, 13.8, { d: 'vegan' }),
  p('banana', 'Бананы', 'fruit', 139, 89, 1.5, 0.2, 22.0, { d: 'vegan' }),
  p('orange', 'Апельсины', 'fruit', 189, 47, 0.9, 0.2, 11.8, { d: 'vegan', citr: 1 }),
  p('mandarin', 'Мандарины', 'fruit', 209, 53, 0.8, 0.2, 13.3, { d: 'vegan', citr: 1 }),
  p('pear', 'Груши', 'fruit', 229, 57, 0.4, 0.3, 15.2, { d: 'vegan' }),
  p('berries', 'Ягоды (замороженные)', 'fruit', 349, 45, 1.0, 0.3, 9.0, { d: 'vegan' }),
  p('frozen_berry', 'Смородина замороженная', 'fruit', 299, 44, 1.0, 0.4, 9.0, { d: 'vegan' }),
  p('kiwi', 'Киви', 'fruit', 249, 61, 1.1, 0.5, 14.7, { d: 'vegan' }),
  p('grapes', 'Виноград', 'fruit', 179, 69, 0.6, 0.2, 17.0, { d: 'vegan' }),
  p('dried', 'Курага/чернослив', 'fruit', 449, 240, 3.0, 0.4, 60.0, { d: 'vegan', ses: 1 }),

  // ── Прочее ─────────────────────────────────────────────────────────────
  p('oil', 'Масло растительное', 'other', 149, 899, 0, 99.9, 0, { d: 'vegan' }),
  p('oliveoil', 'Масло оливковое', 'other', 749, 898, 0, 99.8, 0, { d: 'vegan' }),
  p('nuts', 'Орехи грецкие', 'other', 1290, 654, 15.2, 65.2, 7.0, { d: 'vegan', nuts: 1 }),
  p('almond', 'Миндаль', 'other', 1390, 579, 21.2, 49.9, 21.6, { d: 'vegan', nuts: 1 }),
  p('peanut', 'Арахис', 'other', 590, 567, 25.8, 49.2, 16.1, { d: 'vegan', pnut: 1 }),
  p('seeds', 'Семена льна/чиа', 'other', 690, 534, 18.3, 42.2, 28.9, { d: 'vegan' }),
  p('sesame', 'Кунжут', 'other', 790, 573, 17.7, 49.7, 12.2, { d: 'vegan', ses: 1 }),
  p('honey', 'Мёд', 'other', 629, 304, 0.3, 0, 82.4, { d: 'vegan', hony: 1 }),
  p('sugar', 'Сахар', 'other', 79, 387, 0, 0, 99.8, { d: 'vegan', dislike: 'sugr' }),
  p('jam', 'Варенье без сахара', 'other', 449, 150, 0.5, 0.1, 36.0, { d: 'vegan' }),
  p('soysauce', 'Соевый соус', 'other', 349, 53, 8.0, 0.1, 4.0, { d: 'vegan', soy: 1 }),
  p('coconut', 'Кокосовое молоко', 'other', 299, 152, 1.6, 15.0, 3.0, { d: 'vegan' }),
  p('tomato_paste', 'Паста томатная', 'other', 349, 82, 4.8, 0.5, 14.0, { d: 'vegan' }),
  p('veg_stock', 'Бульон овощной', 'other', 129, 5, 0.3, 0.1, 0.6, { d: 'vegan' }),
];

/** Продукты, которые почти везде есть — их не считаем в списке покупок отдельной строкой. */
export const PANTRY = ['oil', 'oliveoil', 'sugar', 'soysauce', 'tomato_paste', 'veg_stock'];

/** Отделы магазина для сгруппированного списка покупок. */
export const AISLES = [
  { id: 'prot', name: 'Мясо, рыба, птица', emoji: '🥩' },
  { id: 'dairy', name: 'Молочное и яйца', emoji: '🥛' },
  { id: 'veg', name: 'Овощи', emoji: '🥦' },
  { id: 'fruit', name: 'Фрукты и ягоды', emoji: '🍎' },
  { id: 'grain', name: 'Крупы, паста, хлеб', emoji: '🌾' },
  { id: 'other', name: 'Прочее', emoji: '🧂' },
];

function p(id, name, type, price, kcal, prot, fat, carb, opts = {}) {
  const o = {
    id,
    name,
    type,
    price,
    kcal,
    prot,
    fat,
    carb,
    diet: opts.d || 'vegan',
  };
  if (opts.unit) o.unit = opts.unit;
  if (opts.unitG) o.unitG = opts.unitG;
  for (const tag of ['nuts', 'glut', 'lact', 'pnut', 'sea', 'eggs', 'hony', 'soy', 'fish', 'citr', 'ses']) {
    if (opts[tag]) o[tag] = true;
  }
  if (opts.dislike) o.dislike = opts.dislike;
  return o;
}

export const BY_ID = new Map(PRODUCTS.map((x) => [x.id, x]));

/** Порядок типов питания (для «не строже, чем выбрано»). */
export const DIET_RANK = { vegan: 0, veget: 1, pesc: 2, any: 3 };

export function productAllowed(product, diet) {
  return DIET_RANK[product.diet] <= DIET_RANK[diet];
}
