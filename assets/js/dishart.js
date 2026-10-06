/**
 * Иллюстрации блюд: детерминированный SVG-рисунок для каждого рецепта.
 * Тёплая «домашняя» палитра вместо фотографий — работает офлайн и весит копейки.
 */

/** Цвета ингредиентов: [основной, тень] для «еды» на тарелке. */
const ING = {
  chicken: ['#E9B27A', '#C98B4F'],
  chicken_f: ['#F0C08B', '#D19A5B'],
  turkey: ['#E0955F', '#B87442'],
  beef: ['#A85C40', '#7E3F2A'],
  pork: ['#D19A7E', '#A96C52'],
  mince: ['#B06B4B', '#874B31'],
  liver: ['#9C5A48', '#7A4032'],
  sausage: ['#D98E7A', '#B06955'],
  cod: ['#F6F1E4', '#DCD2BC'],
  pollock: ['#F3EEE0', '#D6CBB4'],
  salmon: ['#F5A378', '#DE7A4C'],
  pink: ['#F09C7E', '#D27455'],
  mackerel: ['#C9CDD6', '#9EA5B2'],
  herring: ['#C6CBD4', '#9AA1AE'],
  shrimp: ['#F7B79A', '#DE9070'],
  squid: ['#F4E7DC', '#D8C6B6'],
  egg: ['#FBD98A', '#E8B44F'],
  tofu: ['#F6F0DE', '#DCD2B8'],
  chickpea: ['#E4C88A', '#C4A45E'],
  lentil: ['#D9A15E', '#B47C3E'],
  beans: ['#B4685C', '#8E4A40'],
  potato: ['#EED9A6', '#D2B878'],
  broccoli: ['#7FAF6A', '#5C8A4A'],
  cauli: ['#F3EEE0', '#D9D2BE'],
  zucchini: ['#A8C57F', '#82A25C'],
  eggplant: ['#8A6E9E', '#6A5080'],
  tomato: ['#E4694F', '#C24B33'],
  cucumber: ['#8FC08A', '#699E64'],
  pepper: ['#EFAE55', '#D18A34'],
  carrot: ['#EFA855', '#D0842F'],
  onion: ['#F0E4D4', '#D6C6B0'],
  garlic: ['#F4EDE0', '#DAD0BE'],
  cabbage: ['#DCE8C9', '#BCCFA2'],
  spinach: ['#5F9455', '#436F3C'],
  lettuce: ['#8CC06F', '#699B4E'],
  mush: ['#C9AE8E', '#A88B69'],
  beet: ['#B5486A', '#8E3453'],
  pumpkin: ['#F2A455', '#D5802F'],
  greenpea: ['#9CC46A', '#77A047'],
  corn: ['#F7CE6A', '#DDAE3F'],
  olive: ['#7E8A5A', '#5E6A40'],
  greens: ['#6FA05E', '#4F7C40'],
  cilantro: ['#79A85F', '#578742'],
  sauerkraut: ['#E4E0C4', '#C6C2A2'],
  seaweed: ['#5C7B5E', '#415C44'],
  buckwheat: ['#C9A87C', '#A88456'],
  rice: ['#F5F1E6', '#DDD6C4'],
  brown_rice: ['#D6BFA0', '#B69C7C'],
  oats: ['#E8D3AC', '#C9B083'],
  millet: ['#EFD387', '#CFAE5E'],
  pasta: ['#F1D48F', '#D1AF62'],
  noodles: ['#F3DFA8', '#D3BA78'],
  couscous: ['#EFDFA8', '#CFBB78'],
  bulgur: ['#E3C88F', '#C1A462'],
  quinoa: ['#E9DCC0', '#C9BA98'],
  bread: ['#DFBE8C', '#B99664'],
  lavash: ['#F0DCB4', '#D0B98C'],
  flour_oats: ['#E8D3AC', '#C9B083'],
  flour_wheat: ['#F5EEDC', '#DAD0B8'],
  cheese: ['#F5C95E', '#DCAB36'],
  feta: ['#FBF6EA', '#E0D8C4'],
  butter: ['#FAE7A8', '#E2C868'],
  milk: ['#FBF7ED', '#E2DAC8'],
  kefir: ['#FBF7ED', '#E2DAC8'],
  cream: ['#FBF3E2', '#E2D6BE'],
  sourcream: ['#FCF8EE', '#E4DCC8'],
  yogurt: ['#FCF8EE', '#E4DCC8'],
  curd: ['#FBF6E8', '#E0D8C0'],
  curd0: ['#FBF6E8', '#E0D8C0'],
  apple: ['#E8B04E', '#C68C2E'],
  banana: ['#F2D06A', '#D2AC42'],
  orange: ['#F09A4E', '#CE7A2E'],
  mandarin: ['#F2A64E', '#D0862E'],
  pear: ['#D8D06A', '#B4AC44'],
  berries: ['#C2506A', '#9C3450'],
  frozen_berry: ['#A84A68', '#86324C'],
  kiwi: ['#9CBE5C', '#7A9C3E'],
  grapes: ['#A88CC0', '#8468A0'],
  dried: ['#C2874E', '#9E6733'],
  nuts: ['#C9A87C', '#A68455'],
  almond: ['#E0C79A', '#BCA075'],
  peanut: ['#D9B98A', '#B4966A'],
  seeds: ['#CBBE9E', '#A89A78'],
  sesame: ['#EFE3C4', '#D2C4A0'],
  honey: ['#E8B54E', '#C6912E'],
  jam: ['#C4506A', '#9E3450'],
  coconut: ['#FBF7EF', '#E0D8C8'],
  chickpea_dark: ['#C4A45E', '#A4843E'],
  oil: ['#EFC96A', '#CFA53A'],
  oliveoil: ['#D8C25E', '#B6A038'],
};

/** Настроение рисунка: plate (второе), bowl (суп), stack (оладьи/каша), drink (смузи), egg (яйца). */
const MOODS = {
  soup: ['borsch', 'shchi', 'soup_meatball', 'soup_pea', 'ukha', 'soup_mush', 'soup_lentil', 'soup_pumpkin', 'soup_chicken_noodle', 'soup_buckwheat', 'solyanka', 'okroshka', 'chicken_veg_soup_d'],
  stack: ['pancake_banana', 'pancake_berry', 'syrniki', 'draniki', 'oat_banana', 'oat_apple', 'oat_berry', 'oat_curd', 'buckwheat_milk', 'rice_pudding', 'millet_pumpkin', 'quinoa_porridge', 'zapekanka', 'curd_casserole_carrot', 'cottage_bake_d', 'cottage_veg', 'tvorog_smoothie'],
  drink: ['smoothie_bowl', 'smoothie_linen'],
  egg: ['oml_classic', 'oml_spinach', 'oml_mush', 'scr_avocado', 'shakshuka', 'omelet_roll', 'egg_veg_plate', 'egg_muffins', 'omelet_dinner', 'toast_egg', 'avocado_toast'],
  salad: ['salad_chicken', 'salad_salmon', 'shrimp_salad', 'salad_tuna', 'snack_veg_hummus', 'seaweed', 'snack_apple_curd'],
  sandwich: ['sandwich_turkey', 'sandwich_salmon', 'toast_cheese', 'lavash_breakfast', 'snack_cheese_bread', 'fish_tacos'],
};

function moodOf(recipe) {
  for (const [mood, ids] of Object.entries(MOODS)) if (ids.includes(recipe.id)) return mood;
  return 'plate';
}

const PROTEIN_IDS = [
  'chicken', 'chicken_f', 'turkey', 'beef', 'pork', 'mince', 'cod', 'pollock', 'salmon',
  'pink', 'mackerel', 'herring', 'shrimp', 'squid', 'tofu', 'liver', 'sausage', 'egg',
];

function mainIngredient(recipe) {
  // Берём самый «характерный» продукт: сначала белок, потом крупу, потом овощ.
  const skip = new Set(['oil', 'oliveoil', 'greens', 'butter', 'sugar', 'honey', 'veg_stock', 'sesame', 'seeds', 'milk', 'cream', 'sourcream', 'yogurt', 'kefir', 'curd', 'curd0']);
  for (const want of [PROTEIN_IDS, [...GRAIN_IDS], null]) {
    for (const [id] of recipe.items) {
      if (skip.has(id)) continue;
      if (!want || want.includes(id)) return id;
    }
  }
  return recipe.items[0]?.[0] || 'rice';
}

/** Форма «основного» куска: котлета, филе или ломтик. */
function mainPiece(cx, cy, rx, ry, rot, colors, kind) {
  const path =
    kind === 'cutlet'
      ? `M ${cx - rx} ${cy - ry * 0.1} q ${rx * 0.1} ${-ry * 1.25} ${rx * 0.75} ${-ry * 0.95}
         q ${rx * 0.75} ${-ry * 0.25} ${rx * 0.85} ${ry * 0.35}
         q ${rx * 0.15} ${ry * 0.9} ${-rx * 0.6} ${ry * 1.0}
         q ${-rx * 0.9} ${ry * 0.2} ${-rx} ${-ry * 0.4} z`
      : kind === 'fillet'
      ? `M ${cx - rx} ${cy + ry * 0.5} q ${rx * 0.35} ${-ry * 1.3} ${rx * 1.1} ${-ry * 1.05}
         q ${rx * 0.9} ${ry * 0.25} ${rx * 0.85} ${ry * 1.0}
         q ${-rx * 0.95} ${ry * 0.35} ${-rx * 1.95} ${-ry * 0.45} z`
      : `M ${cx - rx} ${cy} q ${rx * 0.2} ${-ry * 1.15} ${rx} ${-ry}
         q ${rx * 0.85} ${ry * 0.15} ${rx} ${ry}
         q ${-rx * 0.2} ${ry * 1.05} ${-rx} ${ry * 0.95}
         q ${-rx * 0.85} ${-ry * 0.1} ${-rx} ${-ry * 0.95} z`;
  return `<g transform="rotate(${rot} ${cx} ${cy})">
    <path d="${path}" transform="translate(0 ${ry * 0.16})" fill="${colors[1]}" opacity=".5"/>
    <path d="${path}" fill="${colors[0]}" stroke="${colors[1]}" stroke-width="${Math.max(1.2, ry * 0.09)}"/>
    <path d="M ${cx - rx * 0.5} ${cy - ry * 0.35} q ${rx * 0.4} ${-ry * 0.35} ${rx * 0.85} ${-ry * 0.2}"
      stroke="#FFFFFF" stroke-opacity=".38" stroke-width="${ry * 0.26}" fill="none" stroke-linecap="round"/>
  </g>`;
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function ingredientColor(id) {
  return ING[id] || ['#D8B98A', '#B29566'];
}

function accent(recipe) {
  for (const [id] of recipe.items) {
    if (ING[id]) return ING[id][0];
  }
  return '#E8B54E';
}

const GRAIN_IDS = new Set([
  'buckwheat', 'rice', 'brown_rice', 'oats', 'millet', 'pasta', 'noodles', 'couscous',
  'bulgur', 'quinoa', 'flour_oats', 'flour_wheat',
]);

/** Кусочек еды: выпуклая форма с бликом и тенью. */
function chunk(cx, cy, rx, ry, rot, colors, opacity = 1) {
  return `<g transform="rotate(${rot} ${cx} ${cy})" opacity="${opacity}">
    <ellipse cx="${cx}" cy="${cy + ry * 0.18}" rx="${rx}" ry="${ry}" fill="${colors[1]}" opacity=".55"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${colors[0]}"/>
    <ellipse cx="${cx - rx * 0.3}" cy="${cy - ry * 0.35}" rx="${rx * 0.42}" ry="${ry * 0.3}" fill="#FFFFFF" opacity=".28"/>
  </g>`;
}

/** Листик зелени. */
function leaf(cx, cy, len, rot, color) {
  const w = len * 0.42;
  return `<path d="M ${cx} ${cy} q ${len * 0.42} ${-w} ${len} 0 q ${-len * 0.42} ${w} ${-len} 0 z"
    fill="${color}" transform="rotate(${rot} ${cx} ${cy})"/>
  <path d="M ${cx} ${cy} l ${len * 0.9} 0" stroke="#FFFFFF" stroke-opacity=".38" stroke-width="1.2" transform="rotate(${rot} ${cx} ${cy})"/>`;
}

/** Крупа/каша в тарелке: мелкие зёрна. */
function grains(cx, cy, rx, ry, color, count, seed) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = ((seed * (i + 3)) % 97) / 97 * Math.PI * 2;
    const rr = (((seed * (i + 7)) % 89) / 89) * 0.85;
    const px = cx + Math.cos(a) * rx * rr;
    const py = cy + Math.sin(a) * ry * rr;
    s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(rx * 0.1).toFixed(1)}" ry="${(ry * 0.09).toFixed(1)}" fill="${color}" opacity=".92"/>`;
  }
  return s;
}

/** Яичница: белок неправильной формы + желток. */
function friedEgg(cx, cy, r, yolk = '#F5B93A') {
  return `<g>
    <path d="M ${cx - r} ${cy} C ${cx - r * 1.05} ${cy - r * 0.85} ${cx - r * 0.4} ${cy - r * 1.1} ${cx + r * 0.1} ${cy - r * 0.95}
      C ${cx + r * 0.75} ${cy - r * 1.15} ${cx + r * 1.1} ${cy - r * 0.45} ${cx + r * 0.95} ${cy + r * 0.1}
      C ${cx + r * 1.15} ${cy + r * 0.75} ${cx + r * 0.45} ${cy + r * 1.05} ${cx - r * 0.1} ${cy + r * 0.92}
      C ${cx - r * 0.75} ${cy + r * 1.08} ${cx - r * 1.1} ${cy + r * 0.55} ${cx - r} ${cy} Z"
      fill="#FDF8EC" stroke="#EFE2CC" stroke-width="1.4"/>
    <circle cx="${cx + r * 0.1}" cy="${cy - r * 0.05}" r="${r * 0.38}" fill="${yolk}"/>
    <circle cx="${cx + r * 0.02}" cy="${cy - r * 0.18}" r="${r * 0.13}" fill="#FFE9A8" opacity=".75"/>
  </g>`;
}

function lemonSlice(cx, cy, r, rot) {
  return `
  <g transform="translate(${cx} ${cy}) rotate(${rot})">
    <circle r="${r}" fill="#F5D35C"/>
    <circle r="${r - 2.4}" fill="#FBEB9C"/>
    ${[0, 60, 120, 180, 240, 300]
      .map((a) => `<path d="M0 0 L${(r - 3) * Math.cos((a * Math.PI) / 180)} ${(r - 3) * Math.sin((a * Math.PI) / 180)}" stroke="#F0C33C" stroke-width="1.4" stroke-linecap="round"/>`)
      .join('')}
  </g>`;
}

function plateBase(size, inner) {
  const c = size / 2;
  return `
  <circle cx="${c}" cy="${c}" r="${size * 0.42}" fill="#FBF6EC"/>
  <circle cx="${c}" cy="${c}" r="${size * 0.42}" fill="none" stroke="#E6DAC8" stroke-width="1.5"/>
  <circle cx="${c}" cy="${c}" r="${size * 0.34}" fill="#FFFFFF" stroke="#EFE5D6" stroke-width="1.2"/>
  ${inner}
  <ellipse cx="${c}" cy="${c + size * 0.34}" rx="${size * 0.2}" ry="${size * 0.028}" fill="rgba(120,95,70,.10)"/>`;
}

function blob(cx, cy, rx, ry, rot, colors, opacity = 1) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${colors[0]}" transform="rotate(${rot} ${cx} ${cy})" opacity="${opacity}"/>
  <path d="M ${cx - rx * 0.7} ${cy + ry * 0.25} q ${rx * 0.7} ${ry * 0.9} ${rx * 1.4} 0" stroke="${colors[1]}" stroke-width="2" fill="none" opacity="${0.5 * opacity}" stroke-linecap="round"/>`;
}

/** Есть ли в блюде рыба: ей положен ломтик лимона. */
function pinkish(recipe) {
  return recipe.items.some(([id]) =>
    ['cod', 'pollock', 'salmon', 'pink', 'mackerel', 'herring', 'shrimp', 'squid'].includes(id)
  );
}

/** Каким куском рисовать белок: котлета, филе или ломтик. */
function pieceKind(id) {
  if (['mince', 'chicken_f', 'liver', 'sausage'].includes(id)) return 'cutlet';
  if (['cod', 'pollock', 'salmon', 'pink', 'mackerel', 'herring'].includes(id)) return 'fillet';
  return 'slice';
}

/** Собираем SVG-иллюстрацию блюда. */
export function dishArt(recipe, size = 320) {
  const seed = hash(recipe.id);
  const rand = (n) => ((seed >> (n % 24)) % 1000) / 1000;
  const c = size / 2;
  const mood = moodOf(recipe);
  const main = mainIngredient(recipe);
  const mainColors = ingredientColor(main);
  const accentColor = accent(recipe);
  const greensId = recipe.items.some(([id]) => id === 'spinach' || id === 'greens' || id === 'lettuce' || id === 'cilantro') ? 'greens' : null;
  const greenColors = greensId ? ingredientColor(greensId) : ingredientColor('greens');

  let inner = '';

  if (mood === 'soup') {
    const broth = ingredientColor(
      recipe.id === 'borsch' ? 'beet'
        : recipe.id === 'soup_pumpkin' ? 'pumpkin'
        : recipe.id === 'soup_pea' ? 'greenpea'
        : recipe.id === 'soup_mush' ? 'mush'
        : recipe.id === 'soup_lentil' ? 'lentil'
        : 'carrot'
    );
    inner = `
      <circle cx="${c}" cy="${c}" r="${size * 0.365}" fill="#FFFFFF" stroke="#EFE5D6" stroke-width="1.2"/>
      <circle cx="${c}" cy="${c}" r="${size * 0.3}" fill="${broth[0]}"/>
      <circle cx="${c}" cy="${c}" r="${size * 0.3}" fill="url(#soupShade)"/>
      ${chunk(c - size * 0.09, c - size * 0.02, size * 0.055, size * 0.042, -16, ingredientColor('potato'))}
      ${chunk(c + size * 0.1, c + size * 0.05, size * 0.045, size * 0.032, 22, ingredientColor('carrot'))}
      ${chunk(c + size * 0.02, c - size * 0.12, size * 0.05, size * 0.03, 6, ingredientColor('beef'))}
      ${leaf(c - size * 0.14, c - size * 0.13, size * 0.1, -22, ingredientColor('greens')[0])}
      ${leaf(c + size * 0.06, c + size * 0.15, size * 0.08, 14, ingredientColor('greens')[0])}
      ${recipe.items.some(([id]) => id === 'sourcream' || id === 'cream')
        ? `<ellipse cx="${c + size * 0.04}" cy="${c + size * 0.01}" rx="${size * 0.07}" ry="${size * 0.045}" fill="#FDFAF2" opacity=".94"/>
           <ellipse cx="${c + size * 0.04}" cy="${c}" rx="${size * 0.035}" ry="${size * 0.022}" fill="#FFFFFF" opacity=".7"/>`
        : ''}
      <g opacity=".45" stroke="#CDBFA8" stroke-width="2.6" stroke-linecap="round" fill="none">
        <path d="M ${c - size * 0.1} ${c - size * 0.26} q ${size * 0.035} ${-size * 0.055} 0 ${-size * 0.11}"/>
        <path d="M ${c + size * 0.05} ${c - size * 0.28} q ${size * 0.04} ${-size * 0.06} 0 ${-size * 0.12}"/>
      </g>`;
  } else if (mood === 'drink') {
    const base = ingredientColor('frozen_berry')[0];
    inner = `
      <path d="M ${c - size * 0.19} ${c - size * 0.26} L ${c - size * 0.13} ${c + size * 0.24} Q ${c} ${c + size * 0.32} ${c + size * 0.13} ${c + size * 0.24} L ${c + size * 0.19} ${c - size * 0.26} Z" fill="#FBF7EF" opacity=".94" stroke="#E8DCC8" stroke-width="1.5"/>
      <path d="M ${c - size * 0.165} ${c - size * 0.09} L ${c - size * 0.128} ${c + size * 0.22} Q ${c} ${c + size * 0.29} ${c + size * 0.128} ${c + size * 0.22} L ${c + size * 0.165} ${c - size * 0.09} Z" fill="${base}"/>
      <ellipse cx="${c}" cy="${c - size * 0.09}" rx="${size * 0.165}" ry="${size * 0.036}" fill="#E8A6B4"/>
      ${chunk(c - size * 0.055, c + size * 0.04, size * 0.045, size * 0.032, -12, ingredientColor('banana'))}
      ${chunk(c + size * 0.06, c + size * 0.1, size * 0.035, size * 0.026, 18, ingredientColor('berries'))}
      <rect x="${c + size * 0.05}" y="${c - size * 0.31}" width="${size * 0.035}" height="${size * 0.26}" rx="${size * 0.017}" fill="#EFB6C0" transform="rotate(12 ${c + size * 0.06} ${c - size * 0.2})"/>
      ${leaf(c - size * 0.15, c - size * 0.2, size * 0.09, -32, ingredientColor('greens')[0])}`;
  } else if (mood === 'stack') {
    // Пиала с кашей или стопка оладий — по составу блюда.
    const grainy = recipe.items.some(([id]) => GRAIN_IDS.has(id)) && !/pancake|syrmiki|draniki|syrniki/.test(recipe.id);
    if (grainy) {
      const grainId = recipe.items.find(([id]) => GRAIN_IDS.has(id))[0];
      const g = ingredientColor(grainId);
      inner = `
        <circle cx="${c}" cy="${c}" r="${size * 0.365}" fill="#FFFFFF" stroke="#EFE5D6" stroke-width="1.2"/>
        <circle cx="${c}" cy="${c}" r="${size * 0.3}" fill="${g[0]}" opacity=".55"/>
        <circle cx="${c}" cy="${c}" r="${size * 0.3}" fill="url(#soupShade)"/>
        ${grains(c, c, size * 0.28, size * 0.22, g[1], 34, seed)}
        ${chunk(c - size * 0.1, c - size * 0.06, size * 0.05, size * 0.036, -18, ingredientColor(recipe.items.some(([id]) => id === 'banana') ? 'banana' : 'apple'))}
        ${chunk(c + size * 0.09, c + size * 0.04, size * 0.042, size * 0.03, 16, ingredientColor('berries'))}
        ${leaf(c - size * 0.14, c - size * 0.14, size * 0.08, -24, ingredientColor('greens')[0])}`;
    } else {
      const discs = 3;
      inner = Array.from({ length: discs }, (_, i) => {
        const y = c + size * 0.11 - i * size * 0.065;
        const w = size * (0.29 - i * 0.025);
        return `<ellipse cx="${c}" cy="${y}" rx="${w}" ry="${size * 0.052}" fill="${mainColors[1]}"/>
          <ellipse cx="${c}" cy="${y - size * 0.012}" rx="${w * 0.97}" ry="${size * 0.048}" fill="${mainColors[0]}"/>`;
      }).join('') + `
        <ellipse cx="${c}" cy="${c - size * 0.1}" rx="${size * 0.06}" ry="${size * 0.042}" fill="${ingredientColor('jam')[0]}"/>
        <ellipse cx="${c - size * 0.012}" cy="${c - size * 0.115}" rx="${size * 0.028}" ry="${size * 0.018}" fill="#FFFFFF" opacity=".45"/>
        ${chunk(c - size * 0.12, c - size * 0.09, size * 0.042, size * 0.034, -20, ingredientColor('berries'))}
        ${chunk(c + size * 0.11, c - size * 0.07, size * 0.038, size * 0.03, 14, ingredientColor('banana'))}
        ${leaf(c + size * 0.16, c - size * 0.18, size * 0.08, 26, ingredientColor('greens')[0])}`;
    }
  } else if (mood === 'egg') {
    inner = `
      ${friedEgg(c - size * 0.05, c + size * 0.01, size * 0.24)}
      ${recipe.items.some(([id]) => id === 'salmon')
        ? `<path d="M ${c + size * 0.03} ${c - size * 0.18} q ${size * 0.16} ${size * 0.05} ${size * 0.19} ${size * 0.12} q ${-size * 0.16} ${size * 0.03} ${-size * 0.19} ${-size * 0.02} z" fill="${ingredientColor('salmon')[0]}"/>
           <path d="M ${c + size * 0.06} ${c - size * 0.16} q ${size * 0.1} ${size * 0.03} ${size * 0.13} ${size * 0.08}" stroke="#FFFFFF" stroke-opacity=".45" stroke-width="1.6" fill="none"/>`
        : ''}
      ${recipe.items.some(([id]) => id === 'tomato')
        ? `${chunk(c + size * 0.17, c + size * 0.13, size * 0.055, size * 0.042, 24, ingredientColor('tomato'))}
           ${chunk(c + size * 0.09, c + size * 0.19, size * 0.045, size * 0.034, -12, ingredientColor('tomato'))}`
        : ''}
      ${recipe.items.some(([id]) => id === 'cheese')
        ? `<path d="M ${c - size * 0.24} ${c + size * 0.16} l ${size * 0.11} ${-size * 0.02} l ${size * 0.015} ${size * 0.06} l ${-size * 0.11} ${size * 0.03} z" fill="${ingredientColor('cheese')[0]}"/>`
        : ''}
      ${recipe.items.some(([id]) => id === 'mush')
        ? `<path d="M ${c + size * 0.06} ${c + size * 0.2} a ${size * 0.06} ${size * 0.05} 0 0 1 ${size * 0.12} 0 z" fill="${ingredientColor('mush')[0]}"/>
           <rect x="${c + size * 0.1}" y="${c + size * 0.2}" width="${size * 0.04}" height="${size * 0.05}" fill="${ingredientColor('mush')[1]}" rx="2"/>`
        : ''}
      ${recipe.items.some(([id]) => id === 'spinach' || id === 'greens')
        ? `${leaf(c - size * 0.2, c - size * 0.12, size * 0.13, -156, ingredientColor('spinach')[0])}
           ${leaf(c - size * 0.13, c + size * 0.19, size * 0.11, 168, ingredientColor('spinach')[0])}`
        : ''}
      ${recipe.items.some(([id]) => id === 'bread' || id === 'lavash')
        ? `<path d="M ${c + size * 0.08} ${c + size * 0.26} l ${size * 0.2} ${-size * 0.05} l ${size * 0.025} ${size * 0.1} l ${-size * 0.2} ${size * 0.055} z" fill="${ingredientColor('bread')[0]}"/>
           <path d="M ${c + size * 0.1} ${c + size * 0.29} l ${size * 0.17} ${-size * 0.045}" stroke="${ingredientColor('bread')[1]}" stroke-width="1.6" fill="none"/>`
        : ''}
      ${recipe.items.some(([id]) => id === 'pepper')
        ? `<path d="M ${c - size * 0.22} ${c + size * 0.05} a ${size * 0.05} ${size * 0.075} 0 0 1 ${size * 0.09} ${size * 0.02} l ${-size * 0.02} ${size * 0.11} a ${size * 0.05} ${size * 0.05} 0 0 1 ${-size * 0.08} ${-size * 0.01} z" fill="${ingredientColor('pepper')[0]}"/>`
        : ''}`;
  } else if (mood === 'salad') {
    inner = `
      <circle cx="${c}" cy="${c}" r="${size * 0.03}" fill="rgba(255,255,255,0)"/>
      ${Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        return leaf(c + Math.cos(a) * size * 0.12 - size * 0.06, c + Math.sin(a) * size * 0.1 - size * 0.02, size * 0.2, (a * 180) / Math.PI + 30, i % 2 ? ingredientColor('lettuce')[0] : ingredientColor('spinach')[0]);
      }).join('')}
      ${recipe.items.slice(0, 5).map(([id], i) => {
        const a = (i / 5) * Math.PI * 2 - 0.6;
        return chunk(c + Math.cos(a) * size * 0.13, c + Math.sin(a) * size * 0.11, size * 0.058, size * 0.044, (seed + i * 37) % 90 - 45, ingredientColor(id));
      }).join('')}`;
  } else if (mood === 'sandwich') {
    inner = `
      <path d="M ${c - size * 0.235} ${c - size * 0.12} l ${size * 0.47} ${-size * 0.02} l ${-size * 0.02} ${-size * 0.15} l ${-size * 0.43} ${size * 0.01} z" fill="${ingredientColor('bread')[1]}"/>
      <path d="M ${c - size * 0.225} ${c - size * 0.05} l ${size * 0.45} ${-size * 0.015}" stroke="${greenColors[0]}" stroke-width="${size * 0.045}" stroke-linecap="round"/>
      <path d="M ${c - size * 0.23} ${c + size * 0.02} l ${size * 0.46} ${-size * 0.015}" stroke="${mainColors[0]}" stroke-width="${size * 0.05}" stroke-linecap="round"/>
      <path d="M ${c - size * 0.235} ${c + size * 0.09} l ${size * 0.47} ${-size * 0.015}" stroke="${ingredientColor('tomato')[0]}" stroke-width="${size * 0.04}" stroke-linecap="round"/>
      <path d="M ${c - size * 0.24} ${c + size * 0.14} l ${size * 0.48} ${-size * 0.02} l ${-size * 0.02} ${-size * 0.12} l ${-size * 0.44} ${size * 0.01} z" fill="${ingredientColor('bread')[0]}"/>
      <path d="M ${c - size * 0.2} ${c - size * 0.22} l ${size * 0.16} ${-size * 0.01}" stroke="#FFFFFF" stroke-opacity=".5" stroke-width="2" fill="none"/>
      ${leaf(c + size * 0.16, c - size * 0.2, size * 0.09, 30, greenColors[0])}`;
  } else {
    // plate: крупа или белок + гарнир + овощи
    const hasGrain = recipe.items.some(([id]) => GRAIN_IDS.has(id));
    const grainId = recipe.items.find(([id]) => GRAIN_IDS.has(id))?.[0];
    const veg = recipe.items.filter(([id]) =>
      ['broccoli', 'cauli', 'zucchini', 'pepper', 'tomato', 'cucumber', 'carrot', 'greenpea', 'corn', 'cabbage', 'spinach', 'lettuce'].includes(id)
    );
    const proteinIds = recipe.items.filter(([id]) =>
      ['chicken', 'chicken_f', 'turkey', 'beef', 'pork', 'mince', 'cod', 'pollock', 'salmon', 'pink', 'mackerel', 'herring', 'shrimp', 'squid', 'tofu', 'liver', 'sausage', 'egg'].includes(id)
    );
    const carbId = recipe.items.find(([id]) => ['potato', 'pasta', 'noodles'].includes(id));
    const mainId = proteinIds[0] || carbId || main;

    let compose = '';
    if (hasGrain) {
      // Горка гарнира слева, основное блюдо справа сверху.
      const gc = ingredientColor(grainId);
      compose += `<path d="M ${c - size * 0.3} ${c + size * 0.19} q ${size * 0.15} ${-size * 0.2} ${size * 0.3} 0 z" fill="${gc[1]}" opacity=".85"/>
        <path d="M ${c - size * 0.3} ${c + size * 0.19} q ${size * 0.15} ${-size * 0.24} ${size * 0.3} 0 z" fill="${gc[0]}"/>
        ${grains(c - size * 0.16, c + size * 0.13, size * 0.11, size * 0.05, gc[1], 24, seed)}
        ${mainPiece(c + size * 0.08, c + size * 0.01, size * 0.17, size * 0.1, -6, ingredientColor(mainId), pieceKind(mainId))}`;
    } else {
      // Пюре/паста/картофель горкой + белок сверху.
      const baseId = carbId || mainId;
      const bc = ingredientColor(baseId);
      compose += `<path d="M ${c - size * 0.3} ${c + size * 0.2} q ${size * 0.3} ${-size * 0.34} ${size * 0.6} 0 z" fill="${bc[1]}" opacity=".8"/>
        <path d="M ${c - size * 0.3} ${c + size * 0.2} q ${size * 0.3} ${-size * 0.3} ${size * 0.6} 0 z" fill="${bc[0]}"/>
        <path d="M ${c - size * 0.18} ${c + size * 0.08} q ${size * 0.18} ${-size * 0.1} ${size * 0.36} 0" stroke="${bc[1]}" stroke-width="2" fill="none" opacity=".5"/>`;
      if (proteinIds[0] && baseId !== proteinIds[0]) {
        compose += mainPiece(c - size * 0.01, c - size * 0.03, size * 0.19, size * 0.11, -5, ingredientColor(proteinIds[0]), pieceKind(proteinIds[0]));
      }
    }
    // Овощи по краю тарелки.
    compose += veg.slice(0, 3).map(([id], i) => {
      const a = -2.3 + i * 0.85;
      return chunk(c + Math.cos(a) * size * 0.21, c + Math.sin(a) * size * 0.17, size * 0.07, size * 0.052, (seed + i * 53) % 80 - 40, ingredientColor(id));
    }).join('');
    if (veg.some(([id]) => id === 'broccoli' || id === 'cauli')) {
      compose += `<circle cx="${c + size * 0.2}" cy="${c - size * 0.14}" r="${size * 0.07}" fill="${ingredientColor('broccoli')[0]}"/>
        <circle cx="${c + size * 0.16}" cy="${c - size * 0.1}" r="${size * 0.055}" fill="${ingredientColor('broccoli')[1]}"/>
        <rect x="${c + size * 0.185}" y="${c - size * 0.1}" width="${size * 0.03}" height="${size * 0.09}" rx="3" fill="#D8CBA6"/>`;
    }
    inner = compose + `
      ${leaf(c + size * 0.04, c - size * 0.22, size * 0.11, -18, greenColors[0])}
      ${leaf(c - size * 0.22, c - size * 0.02, size * 0.09, -142, greenColors[0])}
      ${pinkish(recipe) ? lemonSlice(c - size * 0.24, c + size * 0.2, size * 0.05, -12) : ''}`;
  }

  const motif = mood === 'drink' ? '' : plateBase(size, inner);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${recipe.name}">
  <defs>
    <radialGradient id="dishLight" cx="50%" cy="30%" r="72%">
      <stop offset="0%" stop-color="#FFFDF8"/>
      <stop offset="100%" stop-color="#F4E9DA"/>
    </radialGradient>
    <radialGradient id="soupShade" cx="42%" cy="30%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,.35)"/>
      <stop offset="100%" stop-color="rgba(120,80,40,.18)"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#dishLight)"/>
  <circle cx="${c}" cy="${c}" r="${size * 0.47}" fill="${accentColor}" opacity="0.10"/>
  <ellipse cx="${c}" cy="${c + size * 0.44}" rx="${size * 0.3}" ry="${size * 0.03}" fill="rgba(120,95,70,.10)"/>
  ${mood === 'drink' ? `<circle cx="${c}" cy="${c}" r="${size * 0.4}" fill="#FFFFFF" opacity=".6"/>` : ''}
  ${motif}
</svg>`;
}

export function dishArtDataUri(recipe, size = 320) {
  const svg = dishArt(recipe, size);
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
