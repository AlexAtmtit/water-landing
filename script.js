'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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
