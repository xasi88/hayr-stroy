// Движение, привязанное к прокрутке: быстро листаете, быстро появляется.
// Двигаем только transform и opacity. «Меньше движения»: только прозрачность.
const tikho = matchMedia('(prefers-reduced-motion: reduce)').matches;
const vse = [...document.querySelectorAll('[data-r]')];
const schet = [...document.querySelectorAll('[data-schet]')];
const par = [...document.querySelectorAll('[data-par]')];
const gMedia = document.querySelector('[data-geroj-media]');
const gTekst = document.querySelector('[data-geroj-tekst]');
const niz = document.getElementById('niz');
const geroj = document.getElementById('geroj');

const zazhat = (x) => Math.min(1, Math.max(0, x));
// Плавный выход, как cubic-bezier(0.22, 1, 0.36, 1)
const vyhod = (t) => 1 - Math.pow(1 - t, 4);

document.documentElement.classList.add('dvizh');

const shapka = document.getElementById('shapka');

function kadr() {
  const vh = innerHeight;
  if (shapka) shapka.classList.toggle('temnaya', scrollY > 40);

  for (const el of vse) {
    const r = el.getBoundingClientRect();
    const p = vyhod(zazhat((vh - r.top) / (vh * 0.3)));
    el.style.opacity = p.toFixed(3);
    el.style.transform = tikho ? '' : 'translate3d(0,' + ((1 - p) * 40).toFixed(1) + 'px,0)';
  }

  for (const el of schet) {
    const r = el.getBoundingClientRect();
    const p = vyhod(zazhat((vh - r.top) / (vh * 0.5)));
    const cel = parseFloat(el.dataset.schet);
    const drob = +(el.dataset.drob || 0);
    el.textContent = (tikho ? cel : cel * p).toFixed(drob).replace('.', ',');
  }

  if (!tikho) {
    for (const el of par) {
      const r = el.getBoundingClientRect();
      const sdvig = (r.top + r.height / 2 - vh / 2) * -0.12;
      el.firstElementChild.style.transform = 'translate3d(0,' + sdvig.toFixed(1) + 'px,0) scale(1.15)';
    }
    if (gMedia && gTekst) {
      const p = zazhat(scrollY / vh);
      gMedia.style.transform = 'scale(' + (1 + p * 0.12).toFixed(3) + ')';
      gTekst.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
      gTekst.style.opacity = (1 - p * 1.4).toFixed(3);
    }
  }
}

let zhdu = false;
const pozhe = () => {
  if (zhdu) return;
  zhdu = true;
  requestAnimationFrame(() => { zhdu = false; kadr(); });
};
addEventListener('scroll', pozhe, { passive: true });
addEventListener('resize', pozhe);
kadr();

// Видео играет только на экране: меньше нагрузки на телефон.
// Проверка по прокрутке страницы и ленты объектов, раз в 300 мс.
const video = [...document.querySelectorAll('video[data-auto]')];
function videoNaEkrane() {
  const vh = innerHeight;
  const vw = innerWidth;
  for (const v of video) {
    const r = v.getBoundingClientRect();
    const vidno = r.bottom > -100 && r.top < vh + 100 && r.right > 0 && r.left < vw;
    if (vidno && v.paused) {
      if (v.preload === 'none') v.preload = 'auto';
      v.play().catch(() => {});
    } else if (!vidno && !v.paused) {
      v.pause();
    }
  }
}
setInterval(videoNaEkrane, 300);
videoNaEkrane();

// Нижняя кнопка появляется после первого экрана: на первом экране одна главная кнопка
if (niz && geroj) {
  new IntersectionObserver(([z]) => niz.classList.toggle('vidna', !z.isIntersecting),
    { threshold: 0.15 }).observe(geroj);
}
