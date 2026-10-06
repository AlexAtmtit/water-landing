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

// Pointer depth and scroll depth use separate variables, so neither interrupts the other.
const iceSections = document.querySelectorAll('.hero, .glacier-frame, .finale');
iceSections.forEach(section => {
  let pointerFrame = 0;
  section.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - 0.5) * 34}px`);
      section.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - 0.5) * 24}px`);
    });
  }, { passive: true });
  section.addEventListener('pointerleave', () => {
    cancelAnimationFrame(pointerFrame);
    section.style.setProperty('--pointer-x', '0px');
    section.style.setProperty('--pointer-y', '0px');
  });
});

const journey = document.querySelector('.glacier-journey');
const hero = document.querySelector('.tish-hero');
const clamp = value => Math.max(0, Math.min(1, value));
let scrollFrame = 0;
function paintDepth() {
  scrollFrame = 0;
  if (reducedMotion.matches) {
    journey.removeAttribute('style');
    hero.style.removeProperty('--hero-drift');
    return;
  }
  const viewport = window.innerHeight;
  const rect = journey.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < viewport) {
    const progress = clamp((viewport * 0.8 - rect.top) / (viewport * 0.8 + rect.height - viewport));
    journey.style.setProperty('--scene-inset', `${(1 - progress) * 9}%`);
    journey.style.setProperty('--scene-scale', (1.16 - progress * 0.16).toFixed(3));
    journey.style.setProperty('--scene-drift', `${(0.5 - progress) * 110}px`);
    journey.style.setProperty('--scene-rotation', `${(progress - 0.5) * 13}deg`);
    journey.style.setProperty('--scene-copy-opacity', clamp(progress * 2.6).toFixed(3));
    journey.style.setProperty('--scene-copy-y', `${(1 - progress) * 38}px`);
    journey.style.setProperty('--light-x', `${-70 + progress * 155}%`);
  }
  const heroRect = hero.getBoundingClientRect();
  if (heroRect.bottom > 0) hero.style.setProperty('--hero-drift', `${clamp(-heroRect.top / heroRect.height) * -80}px`);
}
function scheduleDepth() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(paintDepth);
}
window.addEventListener('scroll', scheduleDepth, { passive: true });
window.addEventListener('resize', scheduleDepth, { passive: true });
reducedMotion.addEventListener('change', scheduleDepth);
if ('IntersectionObserver' in window) {
  const sceneObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('fx-active', entry.isIntersecting));
  });
  iceSections.forEach(section => sceneObserver.observe(section));
}
scheduleDepth();

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
