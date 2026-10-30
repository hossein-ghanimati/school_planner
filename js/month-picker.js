/**
 * month-picker.js — انتخاب‌گر ماه جلالی (فقط ماه + سال) (اسکریپت کلاسیک؛ API روی SP)
 * جایگزین درستِ <input type="month"> میلادی: پاپ‌آور با ماه‌های جلالی و پیمایش سال.
 */
(function () {
  'use strict';
  const SP = (window.SP = window.SP || {});
  const MONTHS = SP.MONTHS;
  const J = SP.J;
  const toFa = SP.toFa;
  const icon = SP.icon;

  /**
   * @param {{ popover: HTMLElement,
   *           getValue: () => { year: number, month: number },
   *           onPick: (year: number, month: number) => void }} opts
   * ماه در اینجا یک‌مبناست (فروردین=۱).
   */
  function createMonthPicker({ popover, getValue, onPick }) {
    let open = false;
    let displayYear = getValue().year;
    let anchorBtn = null;

    function render() {
      const value = getValue();
      const now = J.parts(new Date());
      const months = MONTHS.map((name, i) => {
        const month = i + 1;
        const selected = value.year === displayYear && value.month === month;
        const current = now.year === displayYear && now.month === month;
        return `
        <button type="button" class="mp-month ${selected ? 'is-selected' : ''} ${current ? 'is-current' : ''}"
                data-mp-month="${month}" aria-pressed="${selected}">
          ${name}${current ? '<small>ماه جاری</small>' : ''}
        </button>`;
      }).join('');

      popover.innerHTML = `
        <div class="mp-head">
          <button type="button" class="btn-icon btn-icon-sm" data-mp-year="-1" aria-label="سال قبل">${icon('chev-r')}</button>
          <strong class="mp-year">${toFa(displayYear)}</strong>
          <button type="button" class="btn-icon btn-icon-sm" data-mp-year="1" aria-label="سال بعد">${icon('chev-l')}</button>
        </div>
        <div class="mp-grid">${months}</div>
        <button type="button" class="mp-today" data-mp-today>${icon('target', 'ic ic-sm')} رفتن به ماه جاری</button>`;
    }

    function place() {
      const r = anchorBtn.getBoundingClientRect();
      const width = 312;
      popover.style.top = `${r.bottom + 8}px`;
      popover.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - width - 8))}px`;
    }

    function show(anchor) {
      anchorBtn = anchor;
      displayYear = getValue().year;
      render();
      popover.hidden = false;
      place();
      requestAnimationFrame(() => popover.classList.add('is-open'));
      anchor.setAttribute('aria-expanded', 'true');
      open = true;
      document.addEventListener('pointerdown', onOutside, true);
      document.addEventListener('keydown', onKeydown);
      window.addEventListener('resize', close);
    }

    function close() {
      if (!open) return;
      open = false;
      popover.classList.remove('is-open');
      popover.hidden = true;
      anchorBtn?.setAttribute('aria-expanded', 'false');
      document.removeEventListener('pointerdown', onOutside, true);
      document.removeEventListener('keydown', onKeydown);
      window.removeEventListener('resize', close);
    }

    function onOutside(e) {
      if (!popover.contains(e.target) && e.target !== anchorBtn && !anchorBtn?.contains(e.target)) close();
    }
    function onKeydown(e) {
      if (e.key === 'Escape') { close(); anchorBtn?.focus(); }
    }

    popover.addEventListener('click', (e) => {
      const yearBtn = e.target.closest('[data-mp-year]');
      if (yearBtn) { displayYear += Number(yearBtn.dataset.mpYear); render(); return; }
      if (e.target.closest('[data-mp-today]')) {
        const now = J.parts(new Date());
        close();
        onPick(now.year, now.month);
        return;
      }
      const monthBtn = e.target.closest('[data-mp-month]');
      if (monthBtn) {
        const month = Number(monthBtn.dataset.mpMonth);
        close();
        onPick(displayYear, month);
      }
    });

    return {
      toggle(anchor) { open ? close() : show(anchor); },
      close,
      get isOpen() { return open; },
    };
  }

  SP.createMonthPicker = createMonthPicker;
})();
