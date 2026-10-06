'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });
  document.documentElement.classList.add('motion-ready');
  reveals.forEach(element => observer.observe(element));
}

const landscape = document.querySelector('.glacier-frame');
let scrollFrame = 0;
function paintLandscape() {
  scrollFrame = 0;
  if (reducedMotion.matches) {
    landscape.style.removeProperty('--landscape-shift');
    return;
  }
  const rect = landscape.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < window.innerHeight) {
    const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    landscape.style.setProperty('--landscape-shift', `${-progress * rect.height * 0.04}px`);
  }
}
function scheduleLandscape() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(paintLandscape);
}
window.addEventListener('scroll', scheduleLandscape, { passive: true });
window.addEventListener('resize', scheduleLandscape, { passive: true });
reducedMotion.addEventListener('change', scheduleLandscape);
scheduleLandscape();

const dialog = document.querySelector('#bottle-dialog');
let opener;
if (typeof dialog.showModal === 'function') {
  document.querySelectorAll('.view-bottle').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      opener = link;
      dialog.showModal();
      document.body.classList.add('modal-open');
      dialog.querySelector('.dialog-close').focus();
    });
  });
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  let startedOnBackdrop = false;
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { startedOnBackdrop = outside(event); });
  dialog.addEventListener('click', event => {
    if (startedOnBackdrop && outside(event)) dialog.close();
    startedOnBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    opener?.focus({ preventScroll: true });
  });
}

// Approved MagicPath scenes, using local assets and native DOM interactions.
const north = document.querySelector('.tish-north');
north.addEventListener('pointermove', event => {
  if (!finePointer.matches || reducedMotion.matches || event.pointerType !== 'mouse') return;
  const rect = north.getBoundingClientRect();
  north.style.setProperty('--light-shift', `${(event.clientX - rect.left) / rect.width * 30 - 15}px`);
}, { passive: true });
north.addEventListener('pointerleave', () => north.style.setProperty('--light-shift', '0px'));
const bottleDetails = [
  { position: 'glass', caption: '01 / ЧИСТОТА ЛИНИЙ', title: 'Прозрачность\nкак характер.', text: 'Плавные плечи. Чистые линии. Стекло, которое позволяет свету стать частью формы.' },
  { position: 'cap', caption: '02 / СЕРЕБРИСТАЯ ДЕТАЛЬ', title: 'Холодный блеск.\nТочное касание.', text: 'Серебристая поверхность завершает силуэт. Сдержанная деталь, которую хочется рассмотреть ближе.' },
  { position: 'light', caption: '03 / ИГРА ОТРАЖЕНИЙ', title: 'В каждой грани —\nновое отражение.', text: 'Свет проходит сквозь воду и оставляет на стекле тонкий рисунок. Простая форма становится живой.' }
];
const detailTabs = [...document.querySelectorAll('.tish-tabs [role="tab"]')];
const detailPanel = document.querySelector('#tish-detail-panel');
const detailImage = document.querySelector('.tish-detail-image');
function selectDetail(index) {
  const detail = bottleDetails[index];
  detailTabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  detailPanel.setAttribute('aria-labelledby', detailTabs[index].id);
  detailPanel.querySelector('h3').textContent = detail.title;
  detailPanel.querySelector('p').textContent = detail.text;
  detailImage.className = `tish-detail-image ${detail.position}`;
  detailImage.querySelector('img').alt = index === 1 ? 'Крупный план серебристой крышки' : 'Свет на гранях стеклянной бутылки';
  detailImage.querySelector('.tish-dark-label').hidden = index !== 0;
  document.querySelector('#detail-caption').textContent = detail.caption;
}
detailTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDetail(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % detailTabs.length;
    else if (event.key === 'ArrowLeft') next = (index + detailTabs.length - 1) % detailTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = detailTabs.length - 1;
    else return;
    event.preventDefault(); selectDetail(next); detailTabs[next].focus();
  });
});
