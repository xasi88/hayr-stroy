// Движение, привязанное к прокрутке: быстро листаете, быстро появляется.
// Двигаем только transform и opacity. «Меньше движения»: только прозрачность.
// Быстро: места элементов меряем один раз (и когда страница меняет высоту),
// в кадре прокрутки только считаем и пишем, без чтения раскладки.
const tikho = matchMedia('(prefers-reduced-motion: reduce)').matches;
const vse = [...document.querySelectorAll('[data-r]')].map((el) => ({ el, y: 0, h: 0, p: -1 }));
const schet = [...document.querySelectorAll('[data-schet]')].map((el) => ({
  el, y: 0, h: 0, t: '', cel: parseFloat(el.dataset.schet), drob: +(el.dataset.drob || 0),
}));
const par = [...document.querySelectorAll('[data-par]')].map((el) => ({ el, y: 0, h: 0 }));
const gMedia = document.querySelector('[data-geroj-media]');
const gTekst = document.querySelector('[data-geroj-tekst]');
const shapka = document.getElementById('shapka');
const niz = document.getElementById('niz');
const geroj = document.getElementById('geroj');

const zazhat = (x) => Math.min(1, Math.max(0, x));
// Плавный выход, как cubic-bezier(0.22, 1, 0.36, 1)
const vyhod = (t) => 1 - Math.pow(1 - t, 4);

// Место от верха страницы. offsetTop не зависит от transform: нет дрожи.
function verh(el) {
  let y = 0;
  for (let e = el; e; e = e.offsetParent) y += e.offsetTop;
  return y;
}

let vh = innerHeight;
function izmer() {
  vh = innerHeight;
  for (const s of [...vse, ...schet, ...par]) {
    s.y = verh(s.el);
    s.h = s.el.offsetHeight;
  }
  kadr();
}

let bylTemn = null;
function kadr() {
  const y = scrollY;
  const temn = y > 40;
  if (shapka && temn !== bylTemn) { shapka.classList.toggle('temnaya', temn); bylTemn = temn; }

  for (const s of vse) {
    const p = Math.round(vyhod(zazhat((vh - (s.y - y)) / (vh * 0.3))) * 100) / 100;
    if (p === s.p) continue;
    s.p = p;
    s.el.style.opacity = p;
    if (!tikho) s.el.style.transform = p === 1 ? '' : 'translate3d(0,' + ((1 - p) * 40).toFixed(1) + 'px,0)';
  }

  for (const s of schet) {
    const p = tikho ? 1 : vyhod(zazhat((vh - (s.y - y)) / (vh * 0.5)));
    const t = (s.cel * p).toFixed(s.drob).replace('.', ',');
    if (t !== s.t) { s.el.textContent = t; s.t = t; }
  }

  if (tikho) return;
  for (const s of par) {
    if (s.y - y > vh || s.y + s.h - y < 0) continue;
    const sdvig = (s.y + s.h / 2 - y - vh / 2) * -0.12;
    s.el.firstElementChild.style.transform = 'translate3d(0,' + sdvig.toFixed(1) + 'px,0) scale(1.15)';
  }
  if (gMedia && gTekst && y <= vh * 1.2) {
    const p = zazhat(y / vh);
    gMedia.style.transform = p ? 'scale(' + (1 + p * 0.12).toFixed(3) + ')' : '';
    gTekst.style.transform = p ? 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)' : '';
    gTekst.style.opacity = p ? Math.max(0, 1 - p * 1.4).toFixed(3) : '';
  }
}

let zhdu = false;
const pozhe = () => {
  if (zhdu) return;
  zhdu = true;
  requestAnimationFrame(() => { zhdu = false; kadr(); });
};
addEventListener('scroll', pozhe, { passive: true });
// Страница поменяла высоту (вопрос открыт, загрузилось фото, повернули телефон): перемерить
let zhduIzmer = false;
new ResizeObserver(() => {
  if (zhduIzmer) return;
  zhduIzmer = true;
  requestAnimationFrame(() => { zhduIzmer = false; izmer(); });
}).observe(document.body);
addEventListener('resize', () => requestAnimationFrame(izmer));
izmer();

// Видео играет только на экране и только при открытой вкладке: меньше нагрузки на телефон
const video = [...document.querySelectorAll('video[data-auto]')];
const vidno = new Map();
function videoNaEkrane() {
  for (const v of video) {
    const nado = vidno.get(v) && !document.hidden;
    if (nado && v.paused) {
      if (v.preload === 'none') v.preload = 'auto';
      v.play().catch(() => {});
    } else if (!nado && !v.paused) {
      v.pause();
    }
  }
}
const nablyud = new IntersectionObserver((spisok) => {
  for (const z of spisok) vidno.set(z.target, z.isIntersecting);
  videoNaEkrane();
}, { rootMargin: '100px' });
video.forEach((v) => nablyud.observe(v));
// Обложки дальних видео грузим за экран до показа: первый экран грузится первым
const blizko = new IntersectionObserver((spisok) => {
  for (const z of spisok) {
    if (!z.isIntersecting) continue;
    const v = z.target;
    if (v.dataset.poster) { v.poster = v.dataset.poster; delete v.dataset.poster; }
    blizko.unobserve(v);
  }
}, { rootMargin: '900px 900px' });
video.forEach((v) => v.dataset.poster && blizko.observe(v));
document.addEventListener('visibilitychange', videoNaEkrane);
// Запасная проверка раз в секунду: если телефон не дал включить видео сразу
setInterval(videoNaEkrane, 1000);

// Нижняя кнопка появляется после первого экрана: на первом экране одна главная кнопка
if (niz && geroj) {
  new IntersectionObserver(([z]) => {
    const vidna = !z.isIntersecting;
    niz.classList.toggle('vidna', vidna);
    niz.inert = !vidna;
  }, { threshold: 0.15 }).observe(geroj);
}
