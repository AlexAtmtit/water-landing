'use strict';

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#global-links');
function closeMenu() {
  menu.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
}
menuToggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); menuToggle.focus(); }
});
window.matchMedia('(min-width: 834px)').addEventListener('change', closeMenu);

const details = [
  { position: 'glass', title: 'Прозрачность\nкак характер.', text: 'Плавные плечи. Чистые линии. Стекло, которое позволяет свету стать частью формы.', alt: 'Свет на прозрачном стекле бутылки' },
  { position: 'cap', title: 'Точное касание.\nХолодный блеск.', text: 'Серебристая крышка завершает силуэт. Один сдержанный акцент, который соединяет форму и материал.', alt: 'Крупный план серебристой крышки бутылки' },
  { position: 'light', title: 'Каждый взгляд.\nНовое отражение.', text: 'Свет проходит сквозь стекло, подчёркивая его грани. Никакого орнамента. Только материал и момент.', alt: 'Отражения света в стеклянных гранях бутылки' }
];
const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
const panel = document.querySelector('#detail-panel');
const detailImage = document.querySelector('.detail-image');
function selectDetail(index) {
  tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
  panel.setAttribute('aria-labelledby', tabs[index].id);
  panel.querySelector('h3').textContent = details[index].title;
  panel.querySelector('p').textContent = details[index].text;
  detailImage.className = `detail-image ${details[index].position}`;
  detailImage.querySelector('img').alt = details[index].alt;
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectDetail(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault(); selectDetail(next); tabs[next].focus();
  });
});

const dialog = document.querySelector('#bottle-dialog');
let opener;
document.querySelectorAll('.view-bottle').forEach(button => button.addEventListener('click', () => {
  opener = button;
  dialog.showModal();
  document.body.classList.add('modal-open');
  dialog.querySelector('.dialog-close').focus();
}));
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
let startedOnBackdrop = false;
function outside(event) {
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}
dialog.addEventListener('pointerdown', event => { startedOnBackdrop = outside(event); });
dialog.addEventListener('click', event => { if (startedOnBackdrop && outside(event)) dialog.close(); startedOnBackdrop = false; });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); opener?.focus({ preventScroll: true }); });

// Typeface choices affect this browser only; all options work without network requests.
const fontFamilies = {
  system: "-apple-system, BlinkMacSystemFont, 'Manrope', 'Segoe UI', sans-serif",
  cormorant: "'Cormorant Garamond', Georgia, serif",
  georgia: 'Georgia, serif',
  times: "'Times New Roman', Times, serif",
  manrope: 'Manrope, Arial, sans-serif',
  arial: 'Arial, sans-serif'
};
const headingFont = document.querySelector('#heading-font');
const bodyFont = document.querySelector('#body-font');
const fontPicker = document.querySelector('#font-picker');
function applyFonts() {
  document.documentElement.style.setProperty('--serif', fontFamilies[headingFont.value]);
  document.documentElement.style.setProperty('--font-sans', fontFamilies[bodyFont.value]);
  document.documentElement.dataset.headingFont = headingFont.value;
}
function saveFonts() {
  applyFonts();
  try { localStorage.setItem('tish-font-preview', JSON.stringify({ heading: headingFont.value, body: bodyFont.value })); } catch { /* Preview remains available when storage is blocked. */ }
}
try {
  const saved = JSON.parse(localStorage.getItem('tish-font-preview') || 'null');
  if (saved && [...headingFont.options].some(option => option.value === saved.heading)) headingFont.value = saved.heading;
  if (saved && [...bodyFont.options].some(option => option.value === saved.body)) bodyFont.value = saved.body;
} catch { /* Ignore unavailable storage or an outdated saved choice. */ }
applyFonts();
headingFont.addEventListener('change', saveFonts);
bodyFont.addEventListener('change', saveFonts);
document.querySelector('#font-reset').addEventListener('click', () => {
  headingFont.value = 'system'; bodyFont.value = 'system'; saveFonts();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && fontPicker.open) { fontPicker.open = false; fontPicker.querySelector('summary').focus(); }
});
document.addEventListener('click', event => {
  if (fontPicker.open && !fontPicker.contains(event.target)) fontPicker.open = false;
});
