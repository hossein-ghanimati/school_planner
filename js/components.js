/**
 * components.js — تکه‌های HTML مشترک بین نماها (اسکریپت کلاسیک؛ API روی SP)
 * (کارت برنامهٔ یک کلاس در یک روز، در نمای روزانه و داخل مودال تقویم دقیقاً یکی است)
 */
(function () {
  'use strict';
  const SP = (window.SP = window.SP || {});
  const BELLS = SP.BELLS;
  const SHIFTS = SP.SHIFTS;
  const schoolById = SP.schoolById;
  const filterClassDay = SP.filterClassDay;
  const highlight = SP.highlight;
  const icon = SP.icon;
  const toFa = SP.toFa;

  /** برچسب شیفت: صبح با خورشید، بعدازظهر با ماه */
  const shiftBadge = (shift, extraCls = '') => {
    const s = SHIFTS[shift];
    return `<span class="shift-badge is-${shift} ${extraCls}">${icon(shift === 'morning' ? 'sun' : 'moon', 'ic ic-sm')} شیفت ${s.label}</span>`;
  };

  /** چیپ رنگی نام مدرسه (رنگ هر مدرسه ثابت است) */
  const schoolChip = (school) =>
    `<span class="school-chip ${school.theme}">${icon('cap', 'ic ic-sm')} ${school.short}</span>`;

  /** سرگروه یک مدرسه: نام مدرسه + شیفت + ساعت کاری شیفت */
  function schoolGroupHeader(school, shift, meta = '') {
    return `
    <div class="group-head ${school.theme}">
      <div class="group-head-main">
        <h3 class="group-title">${school.name}</h3>
        <div class="group-meta">${shiftBadge(shift)}
          <span class="group-hours">${icon('clock', 'ic ic-sm')} ${SHIFTS[shift].range}</span>
          ${meta ? `<span class="group-extra">${meta}</span>` : ''}
        </div>
      </div>
      <span class="group-shift-art" aria-hidden="true">${icon(shift === 'morning' ? 'sun' : 'moon', 'ic ic-xl')}</span>
    </div>`;
  }

  /**
   * سطر یک زنگ: ساعت زنگ (بسته به شیفت آن مدرسه در آن روز) + درس + دبیر.
   * هنگام جستجو زنگ منطبق هایلایت و بقیه کم‌رنگ می‌شوند.
   */
  function bellRow(lesson, bellIndex, shift, { matched, searching, terms }) {
    const bell = BELLS[bellIndex];
    const cls = ['bell', matched && searching ? 'is-hit' : '', searching && !matched ? 'is-dim' : '']
      .filter(Boolean).join(' ');
    return `
    <li class="${cls}">
      <div class="bell-when">
        <span class="bell-name">${bell.name}</span>
        <span class="bell-time">${bell[shift]}</span>
      </div>
      <div class="bell-body">
        <span class="bell-subject">${highlight(lesson.subject, terms)}</span>
        <span class="bell-teacher">${icon('user', 'ic ic-sm')} ${highlight(lesson.teacher, terms)}</span>
      </div>
      ${matched && searching ? `<span class="bell-hit-dot" title="منطبق با جستجو">${icon('check', 'ic ic-sm')}</span>` : ''}
    </li>`;
  }

  /**
   * کارت برنامهٔ «یک کلاس در یک روز» — اگر با جستجو نتیجه‌ای در آن نباشد رشتهٔ خالی برمی‌گردد.
   * @returns {{ html: string, matchCount: number }}
   */
  function classDayCard(cls, dayName, shift, terms) {
    const { lessons, matched, anyMatch } = filterClassDay(cls, dayName, terms);
    if (!lessons.length || !anyMatch) return { html: '', matchCount: 0 };
    const searching = terms.length > 0;
    const school = schoolById(cls.schoolId);

    const html = `
    <article class="class-card ${school.theme}">
      <header class="class-card-head">
        <div>
          <h4 class="class-card-title">کلاس ${highlight(cls.name, terms)}</h4>
          <span class="class-card-code">کد ${toFa(cls.code)}</span>
        </div>
        ${schoolChip(school)}
      </header>
      <ul class="bells">
        ${lessons.map((lesson, i) =>
          bellRow(lesson, i, shift, { matched: matched.has(i), searching, terms })).join('')}
      </ul>
    </article>`;
    return { html, matchCount: matched.size };
  }

  /** نسخهٔ فشردهٔ یک زنگ برای خانه‌های جدول هفتگی */
  function miniLesson(lesson, bellIndex, { matched, searching, terms }) {
    const cls = ['mini-lesson', matched && searching ? 'is-hit' : '', searching && !matched ? 'is-dim' : '']
      .filter(Boolean).join(' ');
    return `
    <div class="${cls}" title="${BELLS[bellIndex].name} · ${lesson.subject} · ${lesson.teacher}">
      <span class="mini-bell">${toFa(bellIndex + 1)}</span>
      <span class="mini-main">
        <b>${highlight(lesson.subject, terms)}</b>
        <small>${highlight(lesson.teacher, terms)}</small>
      </span>
    </div>`;
  }

  /** حالت خالی (نتیجه پیدا نشد / روز تعطیل …) */
  const emptyState = ({ iconName = 'search', title, desc = '', actionHtml = '' }) => `
    <div class="empty-state">
      <span class="empty-icon">${icon(iconName, 'ic ic-xl')}</span>
      <h3 class="empty-title">${title}</h3>
      ${desc ? `<p class="empty-desc">${desc}</p>` : ''}
      ${actionHtml}
    </div>`;

  SP.shiftBadge = shiftBadge;
  SP.schoolChip = schoolChip;
  SP.schoolGroupHeader = schoolGroupHeader;
  SP.classDayCard = classDayCard;
  SP.miniLesson = miniLesson;
  SP.emptyState = emptyState;
})();
