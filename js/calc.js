// Расчёт кровли. Только логика, без страницы: её проверяют тесты (tests/calc.test.mjs).
// Цены за м² под ключ взяты из постов @hayrstroy (объекты 435, 547, 634, 1212 м²).

export const WHATSAPP = '79679550202';

export const UROVNI = [
  { id: 'vygodno', name: 'Выгодный', cena: 1200,
    text: 'Надёжный материал без переплаты. Как на объекте 435 м².' },
  { id: 'optimal', name: 'Оптимальный', cena: 1500,
    text: 'Самый частый выбор. Как на объектах 547 и 634 м².' },
  { id: 'premium', name: 'Премиум', cena: 1900,
    text: 'Покрытие с гарантией 25 лет на цвет. Как на объекте 1212 м².' },
];

// k: во сколько раз крыша больше дома с учётом наклона скатов и подрезки
export const FORMY = [
  { id: 'dva', name: 'Двускатная', k: 1.2 },
  { id: 'chetyre', name: 'Четырёхскатная', k: 1.3 },
  { id: 'slozh', name: 'Сложная', k: 1.45 },
];

export const SVES = 0.5; // свес крыши с каждой стороны, м
export const MIN = 20;
export const MAX = 5000;

const po = (spisok, id) => spisok.find((x) => x.id === id) || spisok[0];

export function chislo(v) {
  const n = parseFloat(String(v ?? '').replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// Площадь крыши по размерам дома, м²
export function ploshchad(dlina, shirina, forma) {
  const d = chislo(dlina);
  const s = chislo(shirina);
  if (!d || !s) return 0;
  return Math.round((d + 2 * SVES) * (s + 2 * SVES) * po(FORMY, forma).k);
}

const tysyachi = (n) => Math.round(n / 1000) * 1000;

// Итог: точка и вилка ±10 %, округлено до тысячи
export function raschet(pl, uroven) {
  const m2 = Math.round(chislo(pl));
  if (m2 < MIN || m2 > MAX) return null;
  const u = po(UROVNI, uroven);
  const itog = m2 * u.cena;
  return { m2, uroven: u, itog, ot: tysyachi(itog * 0.9), do: tysyachi(itog * 1.1) };
}

export function rub(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
}

export function tys(n) {
  return Math.round(n / 1000).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Текст заявки для WhatsApp
export function zayavka(r, o = {}) {
  const stroki = ['Ассаламу алейкум! Расчёт кровли с вашего сайта.'];
  if (o.dlina && o.shirina) {
    stroki.push('Дом: ' + chislo(o.dlina) + ' × ' + chislo(o.shirina) + ' м, крыша ' +
      po(FORMY, o.forma).name.toLowerCase() + '.');
  }
  stroki.push('Площадь крыши: около ' + r.m2 + ' м².');
  stroki.push('Уровень: ' + r.uroven.name + ' (' + rub(r.uroven.cena) + ' за м²).');
  stroki.push('Примерно: от ' + rub(r.ot) + ' до ' + rub(r.do) + '.');
  if (o.mesto && String(o.mesto).trim()) stroki.push('Где дом: ' + String(o.mesto).trim() + '.');
  stroki.push('Сделайте, пожалуйста, точный расчёт.');
  return stroki.join('\n');
}

export function ssylka(tekst) {
  return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(tekst);
}
