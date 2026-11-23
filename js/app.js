// Экран калькулятора: читает поля, считает через calc.js, обновляет итог и кнопку WhatsApp.
import { UROVNI, FORMY, ploshchad, raschet, chislo, zayavka, ssylka, rub, tys, WHATSAPP } from './calc.js';
import { VERSII } from './version.js';

const $ = (id) => document.getElementById(id);
const sost = { rezhim: 'dom', forma: 'dva', uroven: 'optimal' };

function knopki(mesto, spisok, klyuch, risuy) {
  mesto.innerHTML = '';
  for (const x of spisok) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = mesto.id === 'urovni' ? 'uroven' : 'knopka-vybor';
    b.dataset.id = x.id;
    b.setAttribute('aria-pressed', String(sost[klyuch] === x.id));
    b.innerHTML = risuy(x);
    b.addEventListener('click', () => {
      sost[klyuch] = x.id;
      mesto.querySelectorAll('button').forEach((k) => k.setAttribute('aria-pressed', String(k === b)));
      obnovi();
    });
    mesto.append(b);
  }
}

knopki($('formy'), FORMY, 'forma', (f) => f.name);
knopki($('urovni'), UROVNI, 'uroven', (u) =>
  '<b>' + u.name + '</b><span class="cena">' + rub(u.cena) + ' за м²</span><span>' + u.text + '</span>');

document.querySelectorAll('[data-rezhim]').forEach((b) => b.addEventListener('click', () => {
  sost.rezhim = b.dataset.rezhim;
  document.querySelectorAll('[data-rezhim]').forEach((k) => k.setAttribute('aria-pressed', String(k === b)));
  $('poDomu').hidden = sost.rezhim !== 'dom';
  $('poKryshe').hidden = sost.rezhim !== 'krysha';
  obnovi();
}));

['dlina', 'shirina', 'ploshchad', 'mesto'].forEach((id) => $(id).addEventListener('input', obnovi));

function obnovi() {
  const poDomu = sost.rezhim === 'dom';
  const m2 = poDomu ? ploshchad($('dlina').value, $('shirina').value, sost.forma) : chislo($('ploshchad').value);
  const r = raschet(m2, sost.uroven);

  if (poDomu) {
    $('itogM2').textContent = m2 ? 'Площадь крыши: около ' + m2 + ' м² (со свесами и скатами).'
      : 'Введите размеры: площадь крыши посчитается сама.';
  } else {
    $('itogM2').textContent = 'Площадь есть в проекте дома. Нет проекта: выберите «Размер дома».';
  }

  const waBase = 'https://wa.me/' + WHATSAPP;
  if (!r) {
    $('summa').textContent = m2 ? 'Проверьте размер' : 'Введите размер';
    $('rassrochka').textContent = '';
    $('itog').classList.remove('gotovo');
    $('waGlavnaya').href = waBase;
    $('waTekst').textContent = 'Получить точный расчёт';
    return;
  }

  $('summa').textContent = 'от ' + tys(r.ot) + ' до ' + tys(r.do) + ' тыс. ₽';
  $('rassrochka').textContent = 'Есть рассрочка. Условия скажет менеджер.';
  $('itog').classList.add('gotovo');
  const tekst = zayavka(r, {
    dlina: poDomu && $('dlina').value, shirina: poDomu && $('shirina').value,
    forma: sost.forma, mesto: $('mesto').value,
  });
  $('waGlavnaya').href = ssylka(tekst);
  $('waTekst').textContent = 'Точный расчёт в WhatsApp';
}

$('versiya').textContent = 'Версия ' + VERSII[0].nomer;
obnovi();
