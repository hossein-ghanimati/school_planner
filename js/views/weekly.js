/**
 * views/weekly.js — نمای هفتگی: هفتهٔ جاری (شنبه تا جمعه) — ثابت و بدون ناوبری
 * هر مدرسه یک جدول: ستون‌ها هفت روز هفته (با تاریخ جلالی همان روز)، سطرها کلاس‌ها.
 * با جستجو، فقط سطرهای مرتبط می‌مانند و زنگ‌های منطبق هایلایت می‌شوند.
 */

import { J, toFa, weekdayIndex } from '../jalali.js';
import { SCHOOL_DAY_INDEXES, WEEKDAYS, schoolById } from '../config.js';
import { classesOfSchool } from '../data.js';
import { getShift, schoolsByShift } from '../shift.js';
import { filterClassWeek } from '../search.js';
import { schoolGroupHeader, miniLesson, emptyState } from '../components.js';
import { icon } from '../dom.js';

/** سرستون هفت روز هفتهٔ جاری */
function boardHead(weekDates) {
  const cells = weekDates.map((date, i) => {
    const weekend = !SCHOOL_DAY_INDEXES.includes(i);
    const today = J.isToday(date);
    return `
    <div class="board-cell board-day ${today ? 'is-today' : ''} ${weekend ? 'is-weekend' : ''}" role="columnheader">
      <b>${WEEKDAYS[i]}</b>
      <span>${J.dayMonth(date)}</span>
      ${today ? '<em class="today-badge">امروز</em>' : weekend ? '<em class="off-badge">تعطیل</em>' : ''}
    </div>`;
  });
  return `<div class="board-cell board-corner" role="columnheader">کلاس <span aria-hidden="true">╲</span> روز</div>${cells.join('')}`;
}

/** سطرهای کلاس‌ها برای یک مدرسه */
function boardRows(school, weekDates, terms) {
  const searching = terms.length > 0;
  let rowCount = 0, bellCount = 0, html = '';

  for (const cls of classesOfSchool(school.id)) {
    const { days, weekMatchCount, anyMatch } = filterClassWeek(cls, terms);
    if (searching && !anyMatch) continue;
    rowCount++;
    bellCount += weekMatchCount;

    const dayCells = weekDates.map((date, i) => {
      const dayName = WEEKDAYS[i];
      const todayCls = J.isToday(date) ? ' col-today' : '';
      if (!SCHOOL_DAY_INDEXES.includes(i)) {
        return `<div class="board-cell cell-weekend${todayCls}"><span class="cell-off">تعطیل</span></div>`;
      }
      const { lessons, matched } = days[dayName];
      return `<div class="board-cell${todayCls}">${
        lessons.map((lesson, li) =>
          miniLesson(lesson, li, { matched: matched.has(li), searching, terms })).join('')
      }</div>`;
    });

    html += `
    <div class="board-cell cell-class">
      <b>کلاس ${cls.name}</b>
      <span>کد ${toFa(cls.code)}</span>
      ${searching ? `<em class="match-badge">${toFa(weekMatchCount)} زنگ این هفته</em>` : ''}
    </div>
    ${dayCells.join('')}`;
  }
  return { html, rowCount, bellCount };
}

/**
 * رندر نمای هفتگی
 * @returns {string} متن خلاصهٔ نتایج
 */
export function renderWeekly(root, { today, terms, query }) {
  const searching = terms.length > 0;
  const weekDates = J.daysOfWeek(today);
  const saturday = weekDates[0], friday = weekDates[6];
  const nextSaturday = J.addDays(saturday, 7);
  const nextMorning = schoolById(getShift(nextSaturday).morningSchoolId);

  let html = `
  <div class="day-strip">
    <div class="day-strip-date">
      <span class="day-strip-label">هفتهٔ جاری</span>
      <strong>شنبه ${J.dayMonth(saturday)} تا جمعه ${J.dayMonthYear(friday)}</strong>
    </div>
    <p class="flip-hint inline">${icon('swap', 'ic ic-sm')}
      از شنبهٔ آینده (${J.dayMonth(nextSaturday)}) <b>${nextMorning.short}</b> صبح می‌شود.</p>
  </div>`;

  let totalClasses = 0, totalBells = 0;
  for (const { school, shift } of schoolsByShift(saturday)) {
    const rows = boardRows(school, weekDates, terms);
    if (searching && !rows.rowCount) continue;
    totalClasses += rows.rowCount;
    totalBells += rows.bellCount;
    html += `
    <section class="school-group">
      ${schoolGroupHeader(school, shift, 'جدول هفتگی کلاس‌ها')}
      <div class="board-scroll" tabindex="0" aria-label="جدول هفتگی ${school.name} — برای دیدن همهٔ روزها به‌صورت افقی پیمایش کنید">
        <div class="board ${school.theme}" role="table">${boardHead(weekDates)}${rows.html}</div>
      </div>
    </section>`;
  }

  if (searching && !totalClasses) {
    html += emptyState({
      iconName: 'search',
      title: `در هفتهٔ جاری برای «${query}» برنامه‌ای پیدا نشد`,
      desc: 'املای نام را بررسی کنید یا جستجو را پاک کنید تا کل برنامهٔ هفته برگردد.',
      actionHtml: `<button class="btn-primary" data-action="clear-search">${icon('x', 'ic ic-sm')} پاک‌کردن جستجو</button>`,
    });
  }

  root.innerHTML = html;
  return searching
    ? `در هفتهٔ جاری برای «${query}»: ${toFa(totalClasses)} کلاس · ${toFa(totalBells)} زنگ`
    : `هفتهٔ جاری · ${toFa(totalClasses)} کلاس در دو شیفت`;
}
