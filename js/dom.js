/**
 * dom.js — ابزارهای کوچک DOM و آیکون‌ها (اسکریپت کلاسیک؛ API روی namespace SP)
 */
(function () {
  'use strict';
  const SP = (window.SP = window.SP || {});

  /** گریز از کاراکترهای خاص HTML (دیتا داخلی است، ولی عادت امن را نگه می‌داریم) */
  const esc = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

  /** آیکون SVG از sprite تعریف‌شده در index.html */
  const icon = (name, cls = 'ic') =>
    `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

  /** دیبانس ساده برای اینپوت جستجو */
  function debounce(fn, wait = 120) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  /** میانبر انتخاب المان */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  SP.esc = esc;
  SP.icon = icon;
  SP.debounce = debounce;
  SP.$ = $;
  SP.$$ = $$;
})();
