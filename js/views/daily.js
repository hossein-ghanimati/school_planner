/**
 * views/daily.js — نمای روزانه: برنامهٔ «امروز» (new Date) — ثابت و بدون ناوبری
 * (اسکریپت کلاسیک؛ API روی SP)
 * بدون جستجو همهٔ کلاس‌های هر دو مدرسه؛ با جستجو فقط کلاس‌های مرتبط + زنگ‌هایلایت.
 * در روز تعطیل (پنجشنبه/جمعه) به‌جای صفحهٔ خالی، پیش‌نمایش «روز درسی بعدی» می‌آید.
 */
(function () {
  'use strict';
  const SP = (window.SP = window.SP || {});
  const J = SP.J;
  const toFa = SP.toFa;
  const weekdayIndex = SP.weekdayIndex;
  const SCHOOL_DAY_INDEXES = SP.SCHOOL_DAY_INDEXES;
  const WEEKDAYS = SP.WEEKDAYS;
  const schoolById = SP.schoolById;
  const classesOfSchool = SP.classesOfSchool;
  const getShift = SP.getShift;
  const schoolsByShift = SP.schoolsByShift;
  const currentShiftStatus = SP.currentShiftStatus;
  const classDayCard = SP.classDayCard;
  const schoolGroupHeader = SP.schoolGroupHeader;
  const emptyState = SP.emptyState;
  const icon = SP.icon;

  const isSchoolDay = (date) => SCHOOL_DAY_INDEXES.includes(weekdayIndex(date));

  function nextSchoolDay(date) {
    let d = J.addDays(date, 1);
    while (!isSchoolDay(d)) d = J.addDays(d, 1);
    return d;
  }

  /** هشدار تغییر شیفت از شنبهٔ آینده — تا دبیر شیفت هفتهٔ بعد را از دست ندهد */
  function flipHint(fromDate) {
    const nextSaturday = J.addDays(J.startOfWeek(fromDate), 7);
    const nextMorning = schoolById(getShift(nextSaturday).morningSchoolId);
    return `<p class="flip-hint">${icon('swap', 'ic ic-sm')}
      از شنبهٔ آینده (${J.dayMonth(nextSaturday)}) شیفت‌ها جابه‌جا می‌شوند و <b>${nextMorning.short}</b> صبح خواهد بود.</p>`;
  }

  /** گروه‌های دو مدرسه برای یک تاریخ مشخص؛ خروجی: html + آمار */
  function renderDayGroups(date, terms) {
    const dayName = WEEKDAYS[weekdayIndex(date)];
    const searching = terms.length > 0;
    let classCount = 0, bellCount = 0, html = '';

    for (const { school, shift } of schoolsByShift(date)) {
      const cards = classesOfSchool(school.id)
        .map((cls) => classDayCard(cls, dayName, shift, terms));
      const visible = cards.filter((c) => c.html);
      if (searching && !visible.length) continue;

      classCount += visible.length;
      bellCount += cards.reduce((sum, c) => sum + c.matchCount, 0);
      html += `
      <section class="school-group">
        ${schoolGroupHeader(school, shift, `${toFa(visible.length)} کلاس`)}
        <div class="cards-grid">${visible.map((c) => c.html).join('') || ''}</div>
      </section>`;
    }
    return { html, classCount, bellCount };
  }

  /** نوار خلاصهٔ بالای نمای روزانه: تاریخ امروز + شیفت هر مدرسه + وضعیت الان */
  function todayStrip(today) {
    const { morningSchoolId, afternoonSchoolId } = getShift(today);
    const status = currentShiftStatus();
    const liveShift = status.key === 'morning' || status.key === 'afternoon' ? status.key : null;
    const liveSchool = liveShift === 'morning' ? schoolById(morningSchoolId)
      : liveShift === 'afternoon' ? schoolById(afternoonSchoolId) : null;

    return `
    <div class="day-strip">
      <div class="day-strip-date">
        <span class="day-strip-label">امروز</span>
        <strong>${J.fullDate(today)}</strong>
      </div>
      <div class="day-strip-shifts">
        <span class="strip-shift ${schoolById(morningSchoolId).theme}">${icon('sun', 'ic ic-sm')} ${schoolById(morningSchoolId).short} صبح است</span>
        <span class="strip-shift ${schoolById(afternoonSchoolId).theme}">${icon('moon', 'ic ic-sm')} ${schoolById(afternoonSchoolId).short} بعدازظهر است</span>
      </div>
      ${isSchoolDay(today)
        ? `<span class="live-pill ${liveShift ? 'is-live' : ''}">${icon('clock', 'ic ic-sm')}
             ${status.label}${liveSchool ? ` · ${liveSchool.short}` : ''}</span>`
        : ''}
    </div>`;
  }

  /**
   * رندر نمای روزانه
   * @returns {string} متن خلاصهٔ نتایج (برای نوار متای بالای نما)
   */
  function renderDaily(root, { today, terms, query }) {
    const searching = terms.length > 0;
    const weekend = !isSchoolDay(today);
    let html = todayStrip(today);
    let meta;

    if (weekend) {
      const next = nextSchoolDay(today);
      const nextGroups = renderDayGroups(next, terms);
      html += emptyState({
        iconName: 'moon',
        title: `امروز ${WEEKDAYS[weekdayIndex(today)]} است و مدرسه تعطیل است`,
        desc: `برای اینکه شیفت‌تان را از دست ندهید، برنامهٔ روز درسی بعدی — ${J.fullDate(next)} — را ببینید:`,
      });
      html += `<h2 class="section-divider">روز درسی بعدی · ${J.dayMonthYear(next)}</h2>`;
      html += nextGroups.html || '';
      if (searching && !nextGroups.html) {
        html += emptyState({
          iconName: 'search',
          title: `برای «${query}» در ${WEEKDAYS[weekdayIndex(next)]} برنامه‌ای پیدا نشد`,
          desc: 'ممکن است در روزهای دیگر هفته کلاس داشته باشد؛ نمای هفتگی را امتحان کنید.',
          actionHtml: `<button class="btn-primary" data-switch-view="weekly">${icon('grid', 'ic ic-sm')} مشاهدهٔ نمای هفتگی</button>`,
        });
      }
      meta = searching
        ? `در روز درسی بعدی برای «${query}»: ${toFa(nextGroups.classCount)} کلاس · ${toFa(nextGroups.bellCount)} زنگ`
        : `امروز تعطیل است · در حال نمایش برنامهٔ ${WEEKDAYS[weekdayIndex(next)]} ${J.dayMonth(next)}`;
    } else {
      const groups = renderDayGroups(today, terms);
      if (groups.html) html += groups.html;
      else html += emptyState({
        iconName: 'search',
        title: `امروز برای «${query}» کلاسی پیدا نشد`,
        desc: 'شاید در روزهای دیگر هفته برنامه داشته باشد؛ در نمای هفتگی می‌توانید کل هفتهٔ جاری را ببینید.',
        actionHtml: `
          <div class="empty-actions">
            <button class="btn-primary" data-switch-view="weekly">${icon('grid', 'ic ic-sm')} نمای هفتگی</button>
            <button class="btn-ghost" data-action="clear-search">${icon('x', 'ic ic-sm')} پاک‌کردن جستجو</button>
          </div>`,
      });
      html += flipHint(today);
      meta = searching
        ? `امروز برای «${query}»: ${toFa(groups.classCount)} کلاس · ${toFa(groups.bellCount)} زنگ`
        : `برنامهٔ امروز · ${toFa(groups.classCount)} کلاس در دو شیفت`;
    }

    root.innerHTML = html;
    return meta;
  }

  SP.renderDaily = renderDaily;
})();
