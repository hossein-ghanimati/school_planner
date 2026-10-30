/**
 * views/monthly.js — نمای ماهانه: تقویم گرافیکی جلالی
 * محور X: روزهای هفته (شنبه تا جمعه) · محور Y: هفتهٔ اول تا ششم ماه
 * در هر خانه مشخص است در آن هفته کدام مدرسه صبح و کدام بعدازظهر است
 * (رنگ هر بلاک = مدرسه؛ روشن = صبح، تیره = بعدازظهر).
 *
 * با جستجو: در هر خانه فقط بلاک مدرسه‌ای می‌ماند که در برنامهٔ همان روزش نتیجه‌ای
 * برای عبارت جستجو دارد (اگر دبیر در هر دو مدرسه باشد، هر دو بلاک می‌مانند).
 * کلیک روی بلاک هر مدرسه → مودال جزئیات همان روز و همان شیفت (در app.js به modal وصل است).
 */

import { J, toFa, weekdayIndex } from '../jalali.js';
import { SCHOOLS, SCHOOL_DAY_INDEXES, WEEKDAYS, WEEK_LABELS, SHIFTS } from '../config.js';
import { getShift } from '../shift.js';
import { schoolDayMatch } from '../search.js';
import { icon } from '../dom.js';

/** بلاک یک مدرسه در خانهٔ یک روز */
function shiftBlock(date, school, shift, { searching, matchCount }) {
  const s = SHIFTS[shift];
  const label = `برنامهٔ ${school.name}، ${J.fullDate(date)}، شیفت ${s.label}`;
  return `
  <button type="button" class="shift-block ${school.theme} is-${shift}"
      data-open-day="${date.getTime()}" data-school="${school.id}" aria-label="${label}">
    <span class="sb-top">
      ${icon(shift === 'morning' ? 'sun' : 'moon', 'ic ic-sm')}
      <b class="sb-name-full">${school.short}</b>
      <b class="sb-name-short">${toFa(school.id)}</b>
      ${searching ? `<em class="sb-count">${toFa(matchCount)} زنگ</em>` : ''}
    </span>
    <span class="sb-shift">${s.label}</span>
  </button>`;
}

/** خانهٔ یک روز از ماه */
function dayCell(date, terms) {
  const searching = terms.length > 0;
  const dayIdx = weekdayIndex(date);
  const schoolDay = SCHOOL_DAY_INDEXES.includes(dayIdx);
  const today = J.isToday(date);
  const dayName = WEEKDAYS[dayIdx];
  const p = J.parts(date);

  let body = '';
  let cellHasMatch = false, cellBells = 0;

  if (!schoolDay) {
    body = '<span class="cal-off">تعطیل</span>';
  } else {
    const { morningSchoolId, afternoonSchoolId } = getShift(date);
    // ترتیب بلاک‌ها: اول مدرسهٔ صبح، بعد مدرسهٔ بعدازظهر
    const ordered = [
      { school: SCHOOLS.find((s) => s.id === morningSchoolId), shift: 'morning' },
      { school: SCHOOLS.find((s) => s.id === afternoonSchoolId), shift: 'afternoon' },
    ];
    for (const { school, shift } of ordered) {
      if (searching) {
        const { has, count } = schoolDayMatch(school.id, dayName, terms);
        if (!has) continue; // این مدرسه در این روز برای جستجو نتیجه‌ای ندارد → بلاک پنهان
        cellHasMatch = true;
        cellBells += count;
        body += shiftBlock(date, school, shift, { searching, matchCount: count });
      } else {
        body += shiftBlock(date, school, shift, { searching, matchCount: 0 });
      }
    }
    if (searching && !body) body = '<span class="cal-nomatch" aria-hidden="true">—</span>';
  }

  const html = `
  <div class="cal-cell ${today ? 'is-today' : ''} ${schoolDay ? '' : 'is-weekend'}"
       role="gridcell" aria-label="${J.fullDate(date)}${schoolDay ? '' : ' — تعطیل'}">
    <div class="cal-cell-top">
      <span class="cal-daynum ${today ? 'is-today' : ''}">${toFa(p.day)}</span>
      ${today ? '<span class="cal-today-tag">امروز</span>' : ''}
    </div>
    ${body}
  </div>`;
  return { html, hasMatch: cellHasMatch, bells: cellBells };
}

/** نوار ابزار ماه: ماه قبل/بعد + دکمهٔ انتخاب ماه (month picker) + «ماه جاری» */
function toolbar(cursor, today) {
  const isCurrentMonth = J.monthKey(cursor) === J.monthKey(today);
  return `
  <div class="cal-toolbar">
    <div class="cal-nav">
      <button type="button" class="btn-icon" data-month-nav="prev" aria-label="ماه قبل">${icon('chev-r')}</button>
      <button type="button" class="month-title-btn" id="monthPickerBtn"
              aria-haspopup="true" aria-expanded="false" title="انتخاب ماه">
        ${icon('cal')} <strong>${J.monthTitle(cursor)}</strong> ${icon('chev-d', 'ic ic-sm')}
      </button>
      <button type="button" class="btn-icon" data-month-nav="next" aria-label="ماه بعد">${icon('chev-l')}</button>
    </div>
    <button type="button" class="btn-ghost" data-month-nav="today" ${isCurrentMonth ? 'hidden' : ''}>
      ${icon('target', 'ic ic-sm')} بازگشت به ماه جاری (${J.monthTitle(today)})
    </button>
  </div>`;
}

/** راهنمای رنگ و شیفت */
function legend(searching, query) {
  return `
  <div class="cal-legend" aria-label="راهنمای تقویم">
    <span class="legend-item"><i class="legend-swatch s1"></i> افشارچی ۱</span>
    <span class="legend-item"><i class="legend-swatch s2"></i> افشارچی ۲</span>
    <span class="legend-item">${icon('sun', 'ic ic-sm')} بلاک روشن = شیفت صبح</span>
    <span class="legend-item">${icon('moon', 'ic ic-sm')} بلاک تیره = شیفت بعدازظهر</span>
    <span class="legend-item">${icon('swap', 'ic ic-sm')} چرخش شیفت هر شنبه</span>
    ${searching ? `<span class="legend-item is-note">${icon('search', 'ic ic-sm')} فقط شیفت‌هایی دیده می‌شوند که «${query}» در آن‌ها حضور دارد</span>` : ''}
  </div>`;
}

/**
 * رندر نمای ماهانه
 * @returns {string} متن خلاصهٔ نتایج
 */
export function renderMonthly(root, { today, cursor, terms, query }) {
  const searching = terms.length > 0;
  const days = J.daysOfMonth(cursor);

  // چینش خانه‌ها: جای خالی قبل از اول ماه + روزهای ماه + جای خالی تا تکمیل سطر آخر
  const leading = weekdayIndex(days[0]);
  const cells = [...Array(leading).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);

  let matchedDays = 0, matchedBells = 0;
  let rowsHtml = '';
  for (let r = 0; r < cells.length / 7; r++) {
    rowsHtml += `<div class="cal-week-label" aria-hidden="true">${WEEK_LABELS[r]}</div>`;
    for (const date of cells.slice(r * 7, r * 7 + 7)) {
      if (!date) { rowsHtml += '<div class="cal-cell is-blank" aria-hidden="true"></div>'; continue; }
      const cell = dayCell(date, terms);
      if (cell.hasMatch) matchedDays++;
      matchedBells += cell.bells;
      rowsHtml += cell.html;
    }
  }

  const weekdayHeads = WEEKDAYS.map((name, i) =>
    `<div class="cal-head ${SCHOOL_DAY_INDEXES.includes(i) ? '' : 'is-weekend'}">${name}</div>`).join('');

  root.innerHTML = `
    ${toolbar(cursor, today)}
    ${legend(searching, query)}
    <div class="cal-shell">
      <div class="cal" role="grid" aria-label="تقویم ${J.monthTitle(cursor)}">
        <div class="cal-corner" aria-hidden="true"></div>
        ${weekdayHeads}
        ${rowsHtml}
      </div>
    </div>
    <p class="cal-hint">${icon('info', 'ic ic-sm')}
      برای دیدن کلاس‌ها، زنگ‌ها و دبیران هر روز، روی نام مدرسه در همان روز کلیک کنید.</p>
    ${searching && matchedDays === 0 ? `
    <div class="cal-noresult"><strong>در ${J.monthTitle(cursor)} برای «${query}» هیچ روزی پیدا نشد.</strong>
    ماه دیگری را انتخاب کنید یا جستجو را پاک کنید.</div>` : ''}`;

  return searching
    ? `در ${J.monthTitle(cursor)} برای «${query}»: ${toFa(matchedDays)} روز · ${toFa(matchedBells)} زنگ`
    : `تقویم ${J.monthTitle(cursor)} · شیفت هر دو مدرسه در هر روز`;
}
