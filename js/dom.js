/**
 * dom.js — ابزارهای کوچک DOM و آیکون‌ها
 */

/** گریز از کاراکترهای خاص HTML (دیتا داخلی است، ولی عادت امن را نگه می‌داریم) */
export const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

/** آیکون SVG از sprite تعریف‌شده در index.html */
export const icon = (name, cls = 'ic') =>
  `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

/** دیبانس ساده برای اینپوت جستجو */
export function debounce(fn, wait = 120) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** میانبر انتخاب المان */
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
