/**
 * app.js — نقطهٔ ورود سامانه: state سراسری، تب‌ها، جستجوی واحد و رندر نماها
 * (اسکریپت کلاسیک خام — پروژه بدون هیچ بیلد/پکیجی و فقط با باز کردن index.html اجرا می‌شود)
 *
 * قواعد مهم محصول:
 * - نمای روزانه = امروز (new Date) و نمای هفتگی = هفتهٔ جاری؛ قابل جابه‌جایی نیستند.
 * - فقط نمای ماهانه ناوبری دارد (ماه قبل/بعد + انتخاب‌گر ماه جلالی).
 * - یک اینپوت جستجو برای هر سه نما (و مودال) مشترک است و مقدارش بین تب‌ها حفظ می‌شود.
 * - بوت سامانه بعد از آماده‌شدن لایهٔ جلالی (SP.jalaliReady) انجام می‌شود.
 */
(function () {
  'use strict';
  const SP = window.SP;
  const J = SP.J;
  const toFa = SP.toFa;
  const $ = SP.$;
  const $$ = SP.$$;
  const icon = SP.icon;
  const debounce = SP.debounce;

  const VIEWS = ['daily', 'weekly', 'monthly'];

  const state = {
    view: 'daily',
    query: '',
    terms: [],
    today: null,        // در init با J مقدار می‌گیرد
    monthCursor: null,  // در init با J مقدار می‌گیرد
  };

  let els;          // کش المان‌های DOM — در init پر می‌شود
  let monthPicker;  // در init ساخته می‌شود

  /* ───────────────────────── رندر اصلی ───────────────────────── */

  function render({ animate = false } = {}) {
    const ctx = { today: state.today, terms: state.terms, query: state.query.trim() };
    let meta;
    if (state.view === 'daily') meta = SP.renderDaily(els.viewRoot, ctx);
    else if (state.view === 'weekly') meta = SP.renderWeekly(els.viewRoot, ctx);
    else meta = SP.renderMonthly(els.viewRoot, { ...ctx, cursor: state.monthCursor });

    els.resultMeta.textContent = meta;
    if (animate) {
      els.viewRoot.classList.remove('view-enter');
      void els.viewRoot.offsetWidth;
      els.viewRoot.classList.add('view-enter');
    }
  }

  function setView(view, { focusTab = false } = {}) {
    if (!VIEWS.includes(view)) return;
    state.view = view;
    for (const tab of els.tabs) {
      const active = tab.dataset.view === view;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focusTab) tab.focus();
    }
    if (location.hash !== `#${view}`) history.replaceState(null, '', `#${view}`);
    render({ animate: true });
  }

  /* ───────────────────────── جستجو (یک اینپوت برای همه) ───────────────────────── */

  function applyQuery(value) {
    state.query = value;
    state.terms = SP.toTerms(value);
    els.clearSearch.hidden = !value;
    syncTeacherChips();
    render();
  }

  const onSearchInput = debounce(() => applyQuery(els.searchInput.value), 120);

  /** چیپ‌های جستجوی سریع دبیران */
  function buildTeacherChips() {
    els.teacherChips.innerHTML =
      `<span class="chips-label">${icon('user', 'ic ic-sm')} جستجوی سریع دبیر:</span>` +
      SP.ALL_TEACHERS.map((t) =>
        `<button type="button" class="teacher-chip" data-teacher="${t}" aria-pressed="false">${t}</button>`).join('');
  }

  function syncTeacherChips() {
    const q = SP.normalizeFa(state.query);
    for (const chip of $$('.teacher-chip', els.teacherChips)) {
      const active = q !== '' && SP.normalizeFa(chip.dataset.teacher) === q;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    }
  }

  /* ───────────────────────── سربرگ: اطلاعات امروز ───────────────────────── */

  function renderHero() {
    const { morningSchoolId, afternoonSchoolId } = SP.getShift(state.today);
    const status = SP.currentShiftStatus();
    els.heroToday.innerHTML = `
      <div class="hero-today-date">
        <span>امروز</span>
        <strong>${J.fullDate(state.today)}</strong>
      </div>
      <ul class="hero-today-shifts">
        <li class="${SP.schoolById(morningSchoolId).theme}">${icon('sun', 'ic ic-sm')} ${SP.schoolById(morningSchoolId).short} · صبح</li>
        <li class="${SP.schoolById(afternoonSchoolId).theme}">${icon('moon', 'ic ic-sm')} ${SP.schoolById(afternoonSchoolId).short} · بعدازظهر</li>
      </ul>
      <p class="hero-today-status">${icon('clock', 'ic ic-sm')} ${status.label}</p>`;
  }

  /* ───────────────────────── انتخاب‌گر ماه ───────────────────────── */

  function moveMonth(delta) {
    state.monthCursor = J.startOfMonth(J.addMonths(state.monthCursor, delta));
    render();
  }

  /* ───────────────────────── اتصال رویدادها ───────────────────────── */

  function bindEvents() {
    els.searchInput.addEventListener('input', () => {
      els.clearSearch.hidden = !els.searchInput.value;
      onSearchInput();
    });
    els.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && els.searchInput.value) {
        els.searchInput.value = '';
        applyQuery('');
      }
    });
    els.clearSearch.addEventListener('click', () => {
      els.searchInput.value = '';
      applyQuery('');
      els.searchInput.focus();
    });

    // میانبر «/» برای فوکس روی جستجو (وقتی در اینپوت دیگری نیستیم)
    document.addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName ?? '');
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        els.searchInput.focus();
        els.searchInput.select();
      }
    });

    els.teacherChips.addEventListener('click', (e) => {
      const chip = e.target.closest('[data-teacher]');
      if (!chip) return;
      const name = chip.dataset.teacher;
      const activate = SP.normalizeFa(state.query) !== SP.normalizeFa(name);
      els.searchInput.value = activate ? name : '';
      applyQuery(els.searchInput.value);
    });

    // رویدادهای سراسری با Delegation (تب‌ها، ناوبری ماه، باز کردن مودال روز…)
    document.addEventListener('click', (e) => {
      const pickerBtn = e.target.closest('#monthPickerBtn');
      if (pickerBtn) { monthPicker.toggle(pickerBtn); return; }

      const monthNav = e.target.closest('[data-month-nav]');
      if (monthNav) {
        const action = monthNav.dataset.monthNav;
        if (action === 'prev') moveMonth(-1);
        else if (action === 'next') moveMonth(1);
        else if (action === 'today') { state.monthCursor = J.startOfMonth(new Date()); render(); }
        return;
      }

      const openDay = e.target.closest('[data-open-day]');
      if (openDay) {
        SP.openDayModal({
          date: new Date(Number(openDay.dataset.openDay)),
          schoolId: openDay.dataset.school,
          terms: state.terms,
          query: state.query.trim(),
        });
        return;
      }

      const switchTo = e.target.closest('[data-switch-view]');
      if (switchTo) { setView(switchTo.dataset.switchView); return; }

      if (e.target.closest('[data-action="clear-search"]')) {
        els.searchInput.value = '';
        applyQuery('');
        els.searchInput.focus();
        return;
      }

      const tab = e.target.closest('.tab[data-view]');
      if (tab) setView(tab.dataset.view);
    });

    // پیمایش تب‌ها با کلید جهت‌نما (در چیدمان RTL، چپ = تب بعدی)
    $('.tabs').addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const idx = VIEWS.indexOf(state.view);
      const next = e.key === 'ArrowLeft' ? (idx + 1) % VIEWS.length : (idx + VIEWS.length - 1) % VIEWS.length;
      setView(VIEWS[next], { focusTab: true });
    });

    window.addEventListener('hashchange', () => {
      const view = location.hash.replace('#', '');
      if (VIEWS.includes(view) && view !== state.view) setView(view);
    });

    // هر دقیقه: وضعیت «الان» و در صورت گذر از نیمه‌شب، روز جاری به‌روز شود
    setInterval(() => {
      if (!J.isSameDay(state.today, new Date())) {
        state.today = J.startOfDay(new Date());
        renderHero();
        render();
      } else {
        renderHero();
        if (state.view === 'daily') render(); // نوار «الان» در نمای روزانه تازه شود
      }
    }, 60000);
  }

  /* ───────────────────────── شروع (بعد از آماده‌شدن تقویم جلالی) ───────────────────────── */

  function init() {
    state.today = J.startOfDay(new Date());
    state.monthCursor = J.startOfMonth(new Date());

    els = {
      viewRoot: $('#viewRoot'),
      resultMeta: $('#resultMeta'),
      searchInput: $('#searchInput'),
      clearSearch: $('#clearSearch'),
      teacherChips: $('#teacherChips'),
      heroToday: $('#heroToday'),
      tabs: $$('.tab'),
    };

    monthPicker = SP.createMonthPicker({
      popover: $('#monthPicker'),
      getValue: () => J.parts(state.monthCursor),
      onPick: (year, month) => {
        state.monthCursor = J.monthStart(year, month);
        render();
      },
    });

    SP.initModal();
    buildTeacherChips();
    bindEvents();
    renderHero();

    $('#totalTeachers').textContent = toFa(SP.ALL_TEACHERS.length);

    const initialView = location.hash.replace('#', '');
    setView(VIEWS.includes(initialView) ? initialView : 'daily');
  }

  SP.jalaliReady.then(init);
})();
