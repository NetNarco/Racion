/**
 * Рецепты рациона. Один рецепт = блюдо, которое готовится на 1 порцию,
 * но масштабируется на количество порций.
 *
 * Порядок в списке `items`: [крупа/основа?, основной белок?, овощи?, добавки?]
 * Соусы и масло указываем после, бульон — в супах.
 * Тег `special` — необычная готовка, её ставим реже.
 */

import { BY_ID } from './products.js';

const R = (id, name, meal, tags, items, opts = {}) => ({
  id,
  name,
  meal,
  tags,
  items,
  diet: opts.diet || 'any',
  equip: opts.equip || ['stove'],
  special: !!opts.special,
  steps: opts.steps || null,
});

// Только «диетические» рецепты получают ограниченный diet; остальные 'any'
// и фильтруются на этапе сборки по составу.
export const RECIPES = [
  // ══════════════════════════ ЗАВТРАКИ ══════════════════════════════════
  R('oml_classic', 'Омлет с сыром и овощами', 'breakfast', ['яйца', 'быстро'], [
    ['egg', 130], ['milk', 40], ['cheese', 25], ['tomato', 60], ['greens', 8], ['oil', 6],
  ]),
  R('oml_spinach', 'Омлет со шпинатом и фетой', 'breakfast', ['яйца', 'быстро'], [
    ['egg', 120], ['milk', 30], ['spinach', 60], ['feta', 30], ['oil', 6],
  ]),
  R('oml_mush', 'Омлет с грибами', 'breakfast', ['яйца'], [
    ['egg', 130], ['milk', 30], ['mush', 90], ['onion', 25], ['oil', 7], ['greens', 6],
  ]),
  R('scr_avocado', 'Скрэмбл с лососем и шпинатом', 'breakfast', ['яйца', 'рыба'], [
    ['egg', 120], ['salmon', 70], ['spinach', 50], ['oil', 5], ['bread', 30],
  ], { diet: 'pesc' }),
  R('oat_banana', 'Овсянка с бананом и грецкими орехами', 'breakfast', ['крупа', 'быстро'], [
    ['oats', 65], ['milk', 160], ['banana', 90], ['nuts', 15], ['honey', 8],
  ]),
  R('oat_apple', 'Овсянка с яблоком и корицей', 'breakfast', ['крупа'], [
    ['oats', 65], ['milk', 160], ['apple', 110], ['butter', 6], ['honey', 8],
  ]),
  R('oat_berry', 'Овсянка с ягодами и семенами чиа', 'breakfast', ['крупа'], [
    ['oats', 60], ['milk', 150], ['berries', 90], ['seeds', 12], ['honey', 8],
  ]),
  R('oat_curd', 'Ленивая овсянка с творогом', 'breakfast', ['крупа', 'без готовки'], [
    ['oats', 55], ['curd', 120], ['kefir', 80], ['berries', 70], ['honey', 8],
  ], { equip: [] }),
  R('syrniki', 'Сырники со сметаной', 'breakfast', ['творог'], [
    ['curd', 180], ['egg', 40], ['flour_oats', 25], ['sourcream', 35], ['jam', 20], ['oil', 6],
  ]),
  R('zapekanka', 'Творожная запеканка с изюмом', 'breakfast', ['творог', 'духовка'], [
    ['curd', 190], ['egg', 45], ['milk', 40], ['dried', 25], ['sourcream', 25],
  ], { equip: ['oven'] }),
  R('pancake_banana', 'Банановые панкейки', 'breakfast', ['яйца'], [
    ['banana', 110], ['egg', 90], ['oats', 40], ['yogurt', 50], ['oil', 6],
  ]),
  R('pancake_berry', 'Оладьи с ягодами', 'breakfast', ['яйца'], [
    ['flour_wheat', 55], ['kefir', 110], ['egg', 45], ['berries', 70], ['sourcream', 30], ['oil', 7],
  ]),
  R('draniki', 'Драники со сметаной', 'breakfast', ['картофель'], [
    ['potato', 220], ['egg', 50], ['flour_wheat', 18], ['onion', 30], ['sourcream', 40], ['oil', 10],
  ]),
  R('toast_egg', 'Тост с яйцом-пашот и овощами', 'breakfast', ['яйца', 'быстро'], [
    ['bread', 60], ['egg', 110], ['tomato', 70], ['lettuce', 30], ['cheese', 15], ['oil', 4],
  ]),
  R('toast_cheese', 'Горячий бутерброд с сыром и томатом', 'breakfast', ['быстро'], [
    ['bread', 70], ['cheese', 45], ['tomato', 70], ['greens', 8], ['butter', 5],
  ]),
  R('sandwich_turkey', 'Сэндвич с индейкой и овощами', 'breakfast', ['быстро', 'без готовки'], [
    ['bread', 70], ['turkey', 80], ['cucumber', 60], ['lettuce', 25], ['yogurt', 30],
  ], { equip: [] }),
  R('sandwich_salmon', 'Сэндвич с лососем и творожным сыром', 'breakfast', ['рыба', 'без готовки'], [
    ['bread', 70], ['salmon', 70], ['curd', 40], ['cucumber', 50], ['greens', 6],
  ], { diet: 'pesc', equip: [] }),
  R('shakshuka', 'Шакшука с томатами', 'breakfast', ['яйца'], [
    ['egg', 120], ['tomato', 180], ['pepper', 80], ['onion', 40], ['oil', 8], ['bread', 40],
  ]),
  R('omelet_roll', 'Омлетный ролл с курицей', 'breakfast', ['яйца'], [
    ['egg', 120], ['chicken_f', 90], ['lavash', 45], ['cucumber', 50], ['yogurt', 30], ['oil', 6],
  ]),
  R('millet_pumpkin', 'Пшённая каша с тыквой', 'breakfast', ['крупа'], [
    ['millet', 65], ['milk', 160], ['pumpkin', 110], ['butter', 7], ['honey', 8],
  ]),
  R('rice_pudding', 'Рисовая каша с яблоком', 'breakfast', ['крупа'], [
    ['rice', 60], ['milk', 170], ['apple', 90], ['butter', 6], ['dried', 18],
  ]),
  R('smoothie_bowl', 'Смузи-боул с ягодами', 'breakfast', ['без готовки', 'быстро'], [
    ['banana', 90], ['berries', 100], ['yogurt', 130], ['oats', 30], ['seeds', 10],
  ], { equip: ['blend'] }),
  R('smoothie_linen', 'Ягодный смузи с семенами льна', 'breakfast', ['без готовки'], [
    ['kefir', 180], ['berries', 90], ['banana', 60], ['seeds', 12],
  ], { equip: ['blend'] }),
  R('cottage_veg', 'Творог с зеленью и огурцом', 'breakfast', ['творог', 'без готовки'], [
    ['curd', 190], ['cucumber', 80], ['greens', 10], ['yogurt', 40], ['bread', 30],
  ], { equip: [] }),
  R('egg_veg_plate', 'Яичница с овощами и сыром', 'breakfast', ['яйца', 'быстро'], [
    ['egg', 120], ['zucchini', 110], ['tomato', 70], ['cheese', 25], ['oil', 7],
  ]),
  R('lavash_breakfast', 'Лаваш-ролл с творогом и зеленью', 'breakfast', ['быстро'], [
    ['lavash', 60], ['curd', 140], ['greens', 12], ['cucumber', 60], ['tomato', 50],
  ]),
  R('buckwheat_milk', 'Гречневая каша с молоком', 'breakfast', ['крупа'], [
    ['buckwheat', 65], ['milk', 170], ['butter', 7], ['honey', 8], ['dried', 15],
  ]),
  R('avocado_toast', 'Тост с яйцом и овощами', 'breakfast', ['яйца', 'быстро'], [
    ['bread', 60], ['egg', 110], ['tomato', 80], ['pepper', 50], ['oil', 5], ['greens', 6],
  ]),
  R('quinoa_porridge', 'Каша из киноа с ягодами', 'breakfast', ['крупа'], [
    ['quinoa', 60], ['milk', 160], ['berries', 80], ['almond', 15], ['honey', 8],
  ]),
  R('curd_casserole_carrot', 'Творожная запеканка с морковью', 'breakfast', ['творог', 'духовка'], [
    ['curd', 180], ['carrot', 100], ['egg', 45], ['oats', 25], ['sourcream', 25],
  ], { equip: ['oven'] }),
  R('egg_muffins', 'Яичные маффины с овощами', 'breakfast', ['яйца', 'духовка'], [
    ['egg', 120], ['pepper', 80], ['spinach', 50], ['cheese', 25], ['milk', 30],
  ], { equip: ['oven'] }),
  R('tvorog_smoothie', 'Творожно-банановый смузи', 'breakfast', ['быстро'], [
    ['curd', 150], ['banana', 90], ['kefir', 100], ['honey', 8],
  ], { equip: ['blend'] }),

  // ══════════════════════════ ОБЕДЫ ═════════════════════════════════════
  R('borsch', 'Борщ с говядиной и сметаной', 'lunch', ['суп'], [
    ['beef', 90], ['beet', 90], ['cabbage', 90], ['potato', 90], ['carrot', 40],
    ['onion', 30], ['tomato_paste', 15], ['sourcream', 30], ['veg_stock', 300], ['oil', 8],
  ]),
  R('shchi', 'Щи из свежей капусты', 'lunch', ['суп'], [
    ['chicken', 80], ['cabbage', 120], ['potato', 90], ['carrot', 40], ['onion', 30],
    ['tomato', 50], ['veg_stock', 300], ['oil', 7], ['sourcream', 25],
  ]),
  R('soup_meatball', 'Суп с фрикадельками', 'lunch', ['суп'], [
    ['mince', 90], ['potato', 100], ['carrot', 40], ['onion', 30], ['rice', 20],
    ['veg_stock', 320], ['greens', 8],
  ]),
  R('soup_pea', 'Гороховый суп с курицей', 'lunch', ['суп'], [
    ['chicken', 80], ['greenpea', 90], ['potato', 80], ['carrot', 40], ['onion', 30],
    ['veg_stock', 320], ['oil', 6],
  ]),
  R('ukha', 'Уха из белой рыбы', 'lunch', ['суп', 'рыба'], [
    ['cod', 130], ['potato', 120], ['carrot', 45], ['onion', 30], ['greens', 10],
    ['veg_stock', 320], ['oil', 6],
  ], { diet: 'pesc' }),
  R('soup_mush', 'Грибной суп-пюре', 'lunch', ['суп'], [
    ['mush', 140], ['potato', 110], ['onion', 35], ['cream', 50], ['veg_stock', 300], ['oil', 7],
  ]),
  R('soup_lentil', 'Чечевичный суп с томатами', 'lunch', ['суп'], [
    ['lentil', 70], ['tomato', 90], ['carrot', 45], ['onion', 30], ['veg_stock', 320], ['oil', 7],
  ], { diet: 'vegan' }),
  R('soup_pumpkin', 'Тыквенный крем-суп с семечками', 'lunch', ['суп'], [
    ['pumpkin', 220], ['potato', 80], ['onion', 30], ['cream', 40], ['seeds', 12], ['veg_stock', 280],
  ]),
  R('soup_chicken_noodle', 'Куриный суп с лапшой', 'lunch', ['суп'], [
    ['chicken', 85], ['noodles', 40], ['carrot', 40], ['onion', 25], ['potato', 70],
    ['veg_stock', 320], ['greens', 8],
  ]),
  R('soup_buckwheat', 'Суп с гречкой и курицей', 'lunch', ['суп'], [
    ['chicken', 80], ['buckwheat', 35], ['potato', 80], ['carrot', 40], ['onion', 25], ['veg_stock', 320],
  ]),
  R('cutlet_pasta', 'Котлеты с пастой под сыром', 'lunch', ['мясо'], [
    ['mince', 110], ['pasta', 65], ['cheese', 25], ['onion', 25], ['tomato_paste', 15], ['oil', 9],
  ]),
  R('beef_rice', 'Говядина с овощами и рисом', 'lunch', ['мясо'], [
    ['beef', 100], ['rice', 65], ['pepper', 70], ['carrot', 40], ['onion', 30], ['oil', 9],
  ], { dislike: 'beef' }),
  R('chicken_broccoli', 'Курица с брокколи в сливочном соусе', 'lunch', ['мясо'], [
    ['chicken', 120], ['broccoli', 160], ['cream', 50], ['garlic', 8], ['rice', 55], ['oil', 7],
  ]),
  R('turkey_buckwheat', 'Индейка с гречкой и овощами', 'lunch', ['мясо'], [
    ['turkey', 115], ['buckwheat', 65], ['zucchini', 110], ['onion', 25], ['oil', 8],
  ]),
  R('golubcy', 'Ленивые голубцы в томатном соусе', 'lunch', ['мясо'], [
    ['mince', 105], ['cabbage', 140], ['rice', 45], ['tomato_paste', 20], ['carrot', 40],
    ['onion', 30], ['sourcream', 25], ['oil', 8],
  ]),
  R('plov', 'Плов с курицей', 'lunch', ['мясо'], [
    ['chicken', 115], ['rice', 70], ['carrot', 70], ['onion', 35], ['garlic', 8], ['oil', 11],
  ]),
  R('fish_grechka', 'Треска в сливочном соусе с гречкой', 'lunch', ['рыба'], [
    ['cod', 150], ['buckwheat', 65], ['cream', 45], ['onion', 25], ['greens', 8], ['oil', 6],
  ], { diet: 'pesc' }),
  R('fish_potato', 'Минтай запечённый с картофелем', 'lunch', ['рыба', 'духовка'], [
    ['pollock', 160], ['potato', 180], ['carrot', 50], ['onion', 30], ['oil', 8], ['greens', 8],
  ], { diet: 'pesc', equip: ['oven'] }),
  R('pasta_mush', 'Паста с грибами в сливочном соусе', 'lunch', ['паста'], [
    ['pasta', 80], ['mush', 130], ['cream', 60], ['onion', 30], ['cheese', 20], ['oil', 7],
  ]),
  R('pasta_tuna', 'Паста с горбушей и томатами', 'lunch', ['паста', 'рыба'], [
    ['pasta', 80], ['pink', 110], ['tomato', 120], ['garlic', 8], ['oliveoil', 8], ['greens', 8],
  ], { diet: 'pesc' }),
  R('lasagna_eggplant', 'Лазанья из баклажанов с фаршем', 'lunch', ['мясо', 'духовка'], [
    ['eggplant', 180], ['mince', 100], ['cheese', 45], ['tomato_paste', 25], ['onion', 30], ['oil', 9],
  ], { equip: ['oven'], dislike: 'eggp' }),
  R('zrazy', 'Картофельные зразы с сыром и грибами', 'lunch', ['картофель'], [
    ['potato', 230], ['mush', 90], ['cheese', 35], ['onion', 30], ['egg', 40], ['oil', 10],
  ]),
  R('cutlet_veg', 'Куриные котлеты с овощным рагу', 'lunch', ['мясо'], [
    ['chicken_f', 130], ['egg', 30], ['oats', 20], ['zucchini', 120], ['tomato', 80],
    ['onion', 30], ['oil', 9],
  ]),
  R('beef_stew', 'Говяжье рагу с овощами', 'lunch', ['мясо'], [
    ['beef', 105], ['potato', 130], ['carrot', 50], ['onion', 30], ['tomato_paste', 20], ['oil', 8],
  ], { dislike: 'beef' }),
  R('chicken_rice_veg', 'Курица с рисом и овощами', 'lunch', ['мясо'], [
    ['chicken', 115], ['rice', 65], ['greenpea', 60], ['pepper', 70], ['oil', 8],
  ]),
  R('tofu_broccoli', 'Тофу с брокколи и шпинатом', 'lunch', ['веган'], [
    ['tofu', 150], ['broccoli', 150], ['spinach', 60], ['soysauce', 15], ['rice', 55], ['oil', 8],
  ], { diet: 'vegan', equip: ['stove'], dislike: 'tofu' }),
  R('chickpea_stew', 'Рагу из нута с овощами', 'lunch', ['веган'], [
    ['chickpea', 80], ['zucchini', 120], ['tomato', 110], ['pepper', 70], ['onion', 30],
    ['oliveoil', 9], ['greens', 8],
  ], { diet: 'vegan' }),
  R('lentil_curry', 'Чечевица с овощами и кокосовым молоком', 'lunch', ['веган'], [
    ['lentil', 75], ['tomato', 100], ['onion', 30], ['carrot', 45], ['coconut', 40], ['rice', 55], ['oil', 7],
  ], { diet: 'vegan' }),
  R('buckwheat_mush', 'Гречка с грибами и луком', 'lunch', ['веган'], [
    ['buckwheat', 75], ['mush', 140], ['onion', 35], ['carrot', 45], ['oil', 9], ['greens', 8],
  ], { diet: 'vegan' }),
  R('stuffed_pepper', 'Перец фаршированный рисом и мясом', 'lunch', ['мясо', 'духовка'], [
    ['pepper', 180], ['mince', 105], ['rice', 45], ['tomato_paste', 20], ['onion', 30],
    ['sourcream', 25], ['oil', 7],
  ], { equip: ['oven'] }),
  R('chicken_cream_mush', 'Индейка в сливочном соусе с грибами', 'lunch', ['мясо'], [
    ['turkey', 120], ['mush', 110], ['cream', 50], ['onion', 30], ['pasta', 55], ['oil', 7],
  ]),
  R('salmon_veg', 'Лосось с овощами на пару', 'lunch', ['рыба'], [
    ['salmon', 130], ['broccoli', 130], ['zucchini', 100], ['oliveoil', 8], ['rice', 50],
  ], { diet: 'pesc', equip: ['steam'] }),
  R('fish_cutlet', 'Рыбные котлеты с картофелем', 'lunch', ['рыба'], [
    ['pollock', 160], ['egg', 35], ['bread', 30], ['potato', 170], ['onion', 25], ['oil', 9],
  ], { diet: 'pesc' }),
  R('shrimp_rice', 'Креветки с рисом и овощами', 'lunch', ['рыба'], [
    ['shrimp', 140], ['rice', 65], ['pepper', 80], ['greenpea', 50], ['soysauce', 12], ['oil', 7],
  ], { diet: 'pesc', sea: 1 }),
  R('noodles_chicken', 'Лапша с курицей и овощами', 'lunch', ['мясо'], [
    ['noodles', 70], ['chicken', 110], ['pepper', 70], ['carrot', 40], ['soysauce', 12], ['oil', 8],
  ]),
  R('buckwheat_liver', 'Куриная печень с гречкой', 'lunch', ['мясо'], [
    ['liver', 130], ['buckwheat', 65], ['onion', 30], ['carrot', 40], ['sourcream', 25], ['oil', 8],
  ], { special: true }),
  R('solyanka', 'Солянка с колбасой и оливками', 'lunch', ['суп'], [
    ['sausage', 80], ['potato', 80], ['olive', 30], ['tomato_paste', 20], ['onion', 30],
    ['veg_stock', 320], ['sourcream', 25],
  ], { special: true }),
  R('okroshka', 'Окрошка на кефире', 'lunch', ['суп', 'без готовки'], [
    ['kefir', 260], ['potato', 90], ['cucumber', 80], ['egg', 55], ['greens', 12], ['chicken', 60],
  ], { equip: [] }),

  // ══════════════════════════ УЖИНЫ ═════════════════════════════════════
  R('chicken_zucchini_boats', 'Кабачковые лодочки с фаршем и сыром', 'dinner', ['мясо', 'духовка'], [
    ['zucchini', 200], ['mince', 100], ['cheese', 35], ['tomato', 70], ['onion', 25], ['oil', 7],
  ], { equip: ['oven'] }),
  R('chicken_broccoli_d', 'Курица с брокколи и рисом', 'dinner', ['мясо'], [
    ['chicken_f', 130], ['broccoli', 150], ['rice', 50], ['garlic', 8], ['soysauce', 12], ['oil', 7],
  ]),
  R('cod_veg', 'Треска с овощами в духовке', 'dinner', ['рыба', 'духовка'], [
    ['cod', 160], ['zucchini', 120], ['pepper', 90], ['oliveoil', 9], ['greens', 8],
  ], { diet: 'pesc', equip: ['oven'] }),
  R('chicken_cream_lemon', 'Курица в сливочно-лимонном соусе', 'dinner', ['мясо'], [
    ['chicken', 130], ['cream', 50], ['broccoli', 130], ['garlic', 8], ['buckwheat', 50], ['oil', 7],
  ]),
  R('cutlet_cheese_pasta', 'Котлеты с пастой под сыром', 'dinner', ['мясо'], [
    ['mince', 105], ['pasta', 60], ['cheese', 25], ['onion', 25], ['oil', 8],
  ]),
  R('veg_stew_tofu', 'Овощное рагу с тофу', 'dinner', ['веган'], [
    ['tofu', 140], ['zucchini', 110], ['pepper', 80], ['tomato', 100], ['onion', 30], ['oliveoil', 9],
  ], { diet: 'vegan', dislike: 'tofu' }),
  R('buckwheat_cutlet', 'Куриные котлеты с гречкой', 'dinner', ['мясо'], [
    ['chicken_f', 130], ['egg', 30], ['oats', 18], ['buckwheat', 60], ['onion', 25], ['oil', 9],
  ]),
  R('omelet_dinner', 'Омлет с овощами и салатом', 'dinner', ['яйца', 'быстро'], [
    ['egg', 130], ['milk', 40], ['zucchini', 110], ['tomato', 70], ['lettuce', 40], ['oil', 7],
  ]),
  R('fish_steam_veg', 'Минтай на пару с овощами', 'dinner', ['рыба'], [
    ['pollock', 170], ['cauli', 140], ['carrot', 50], ['greens', 10], ['oliveoil', 8],
  ], { diet: 'pesc', equip: ['steam'] }),
  R('turkey_veg', 'Индейка с овощами на гриле', 'dinner', ['мясо'], [
    ['turkey', 130], ['pepper', 100], ['eggplant', 120], ['oliveoil', 9], ['greens', 8],
  ], { equip: ['grill'] }),
  R('salad_chicken', 'Салат с курицей и фетой', 'dinner', ['салат', 'быстро'], [
    ['chicken_f', 120], ['lettuce', 80], ['tomato', 100], ['cucumber', 70], ['feta', 35], ['oliveoil', 8],
  ]),
  R('salad_salmon', 'Салат с лососем и яйцом', 'dinner', ['салат', 'рыба'], [
    ['salmon', 100], ['egg', 55], ['lettuce', 80], ['cucumber', 70], ['oliveoil', 8],
  ], { diet: 'pesc' }),
  R('cabbage_roll_d', 'Голубцы с индейкой', 'dinner', ['мясо'], [
    ['turkey', 120], ['cabbage', 160], ['rice', 40], ['tomato_paste', 20], ['sourcream', 30], ['oil', 8],
  ]),
  R('shrimp_salad', 'Салат с креветками и овощами', 'dinner', ['салат', 'рыба'], [
    ['shrimp', 130], ['lettuce', 80], ['tomato', 90], ['cucumber', 70], ['oliveoil', 8], ['sesame', 8],
  ], { diet: 'pesc', sea: 1 }),
  R('veg_curry', 'Овощное карри с рисом', 'dinner', ['веган'], [
    ['cauli', 150], ['greenpea', 60], ['tomato', 90], ['coconut', 45], ['rice', 55], ['oil', 8],
  ], { diet: 'vegan' }),
  R('buckwheat_kefir', 'Гречка с кефиром и зеленью', 'dinner', ['быстро', 'без готовки'], [
    ['buckwheat', 65], ['kefir', 200], ['greens', 12], ['cucumber', 70], ['bread', 30],
  ], { equip: [] }),
  R('chicken_mush_d', 'Курица с грибами в сметане', 'dinner', ['мясо'], [
    ['chicken', 130], ['mush', 110], ['sourcream', 45], ['onion', 30], ['buckwheat', 55], ['oil', 8],
  ]),
  R('eggplant_bake', 'Запеканка из баклажанов с сыром', 'dinner', ['веган', 'духовка'], [
    ['eggplant', 180], ['tomato', 110], ['cheese', 40], ['garlic', 8], ['oliveoil', 9],
  ], { equip: ['oven'], dislike: 'eggp' }),
  R('fish_tacos', 'Лаваш с рыбой и овощами', 'dinner', ['рыба', 'быстро'], [
    ['pollock', 140], ['lavash', 55], ['cabbage', 80], ['tomato', 70], ['yogurt', 40], ['oil', 6],
  ], { diet: 'pesc' }),
  R('chicken_potato_bake', 'Курица с картофелем в духовке', 'dinner', ['мясо', 'духовка'], [
    ['chicken', 120], ['potato', 180], ['onion', 30], ['oil', 9], ['greens', 8],
  ], { equip: ['oven'] }),
  R('squid_veg', 'Кальмар с овощами', 'dinner', ['рыба'], [
    ['squid', 150], ['pepper', 90], ['zucchini', 110], ['garlic', 8], ['oliveoil', 8], ['rice', 45],
  ], { diet: 'pesc', sea: 1, special: true }),
  R('liver_buckwheat_d', 'Печень с гречкой и овощами', 'dinner', ['мясо'], [
    ['liver', 130], ['buckwheat', 60], ['carrot', 50], ['onion', 30], ['sourcream', 25], ['oil', 8],
  ], { special: true }),
  R('cauliflower_cheese', 'Цветная капуста под сыром', 'dinner', ['веган', 'духовка'], [
    ['cauli', 200], ['cheese', 45], ['cream', 40], ['garlic', 8], ['oil', 7],
  ], { equip: ['oven'] }),
  R('chicken_veg_soup_d', 'Лёгкий куриный суп с овощами', 'dinner', ['суп'], [
    ['chicken', 80], ['zucchini', 100], ['carrot', 40], ['onion', 25], ['veg_stock', 300], ['greens', 8],
  ]),
  R('pasta_veg', 'Паста с овощами и сыром', 'dinner', ['паста'], [
    ['pasta', 75], ['zucchini', 120], ['tomato', 110], ['cheese', 25], ['oliveoil', 8],
  ]),
  R('rice_veg_egg', 'Рис с овощами и яйцом', 'dinner', ['быстро'], [
    ['rice', 65], ['egg', 100], ['greenpea', 60], ['carrot', 45], ['soysauce', 12], ['oil', 8],
  ]),
  R('salad_tuna', 'Салат с горбушей и овощами', 'dinner', ['салат', 'рыба', 'без готовки'], [
    ['pink', 120], ['lettuce', 80], ['tomato', 90], ['cucumber', 70], ['oliveoil', 8], ['egg', 55],
  ], { diet: 'pesc', equip: [] }),
  R('oat_cutlet', 'Овсяные котлеты с овощами', 'dinner', ['веган'], [
    ['oats', 60], ['mush', 100], ['onion', 30], ['carrot', 50], ['oil', 9], ['yogurt', 35],
  ], { diet: 'vegan' }),
  R('cottage_bake_d', 'Творожная запеканка с зеленью', 'dinner', ['творог', 'духовка'], [
    ['curd', 200], ['egg', 45], ['spinach', 70], ['cheese', 25], ['sourcream', 25],
  ], { equip: ['oven'] }),
  R('bean_stew', 'Рагу из фасоли с овощами', 'dinner', ['веган'], [
    ['beans', 80], ['tomato', 110], ['pepper', 80], ['onion', 30], ['oliveoil', 9], ['bread', 30],
  ], { diet: 'vegan' }),

  // ══════════════════════════ ПЕРЕКУСЫ ══════════════════════════════════
  R('snack_yogurt_nuts', 'Йогурт с орехами', 'snack', ['перекус', 'без готовки'], [
    ['yogurt', 150], ['almond', 20], ['honey', 6],
  ], { equip: [] }),
  R('snack_apple_curd', 'Яблоко с творогом', 'snack', ['перекус', 'без готовки'], [
    ['apple', 150], ['curd', 100],
  ], { equip: [] }),
  R('snack_veg_hummus', 'Овощные палочки с соусом', 'snack', ['перекус', 'без готовки'], [
    ['carrot', 100], ['cucumber', 100], ['yogurt', 60], ['greens', 6],
  ], { equip: [] }),
  R('snack_cheese_bread', 'Хлебец с сыром', 'snack', ['перекус', 'без готовки'], [
    ['bread', 40], ['cheese', 30], ['cucumber', 60],
  ], { equip: [] }),
];

/** Кокосовое молоко — добавляем в базу отдельно (используется в карри). */
export const RECIPE_ONLY_PRODUCTS = ['flour_oats', 'flour_wheat', 'millet', 'coconut', 'liver', 'sausage'];

/**
 * Продукты, которые предлагаем выбрать любимыми на шаге «Что ты любишь?».
 * Масло, сахар, бульон и специи не показываем: это не «любимый продукт»,
 * а техническая основа блюда.
 */
const NOT_A_CHOICE = new Set([
  'oil', 'oliveoil', 'sugar', 'veg_stock', 'soysauce', 'tomato_paste', 'butter',
  'cream', 'sourcream', 'sesame', 'seeds', 'greens', 'flour_oats', 'flour_wheat',
]);

/** Эмодзи для карточки продукта. */
const PRODUCT_EMOJI = {
  chicken: '🍗', chicken_f: '🍗', turkey: '🦃', beef: '🥩', pork: '🥓', mince: '🥩',
  liver: '🍖', sausage: '🌭', cod: '🐟', pollock: '🐟', salmon: '🐟', pink: '🐟',
  mackerel: '🐟', herring: '🐟', shrimp: '🦐', squid: '🦑', egg: '🥚', tofu: '🧊',
  chickpea: '🫘', lentil: '🫘', beans: '🫘',
  milk: '🥛', kefir: '🥛', curd: '🥣', curd0: '🥣', yogurt: '🥣', cheese: '🧀', feta: '🧀',
  potato: '🥔', broccoli: '🥦', cauli: '🥦', zucchini: '🥒', eggplant: '🍆', tomato: '🍅',
  cucumber: '🥒', pepper: '🫑', carrot: '🥕', onion: '🧅', garlic: '🧄', cabbage: '🥬',
  caulibroc: '🥬', spinach: '🥬', lettuce: '🥬', mush: '🍄', beet: '🫐', pumpkin: '🎃',
  greenpea: '🫛', corn: '🌽', olive: '🫒', cilantro: '🌿', sauerkraut: '🥬', seaweed: '🌿',
  apple: '🍎', banana: '🍌', orange: '🍊', mandarin: '🍊', pear: '🍐', berries: '🍓',
  frozen_berry: '🫐', kiwi: '🥝', grapes: '🍇', dried: '🍑',
  buckwheat: '🌾', millet: '🌾', rice: '🍚', brown_rice: '🍚', oats: '🥣', pasta: '🍝',
  noodles: '🍜', couscous: '🍚', bulgur: '🌾', quinoa: '🌾', bread: '🍞', lavash: '🫓',
  nuts: '🌰', almond: '🌰', peanut: '🥜', honey: '🍯', jam: '🍓', coconut: '🥥',
};

export function productEmoji(id) {
  return PRODUCT_EMOJI[id] || '🍽';
}

/** Список продуктов для шага выбора любимых. */
export function choiceProducts(products) {
  return products.filter((p) => !NOT_A_CHOICE.has(p.id));
}

export function recipeProductIds(recipe) {
  return recipe.items.map(([id]) => id);
}

export function validateRecipes() {
  const missing = new Set();
  for (const r of RECIPES) {
    for (const [id] of r.items) if (!BY_ID.has(id)) missing.add(`${r.id} → ${id}`);
  }
  return [...missing];
}
