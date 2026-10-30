/**
 * modal.js — مودال جزئیات «یک روز در یک مدرسه/شیفت» از تقویم ماهانه
 * داخل مودال دقیقاً همان لیست و همان فیلتر نمای روزانه است (classDayCard مشترک).
 */

import { J, toFa, weekdayIndex } from './jalali.js';
import { SCHOOLS, SCHOOL_DAY_INDEXES, SHIFTS, WEEKDAYS, schoolById } from './config.js';
import { classesOfSchool } from './data.js';
import { shiftOfSchool } from './shift.js';
import { classDayCard, shiftBadge } from './components.js';
import { icon, $ } from './dom.js';

let backdrop, contentEl, lastFocused = null;
let isOpen = false;

export function initModal() {
  backdrop = $('#modalBackdrop');
  contentEl = $('#modalContent');
  backdrop.addEventListener('pointerdown', (e) => {
    if (e.target === backdrop) closeModal();
  });
  backdrop.addEventListener('click', (e) => {
    if (e.target.closest('[data-close-modal]')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeModal();
  });
}

/** باز کردن جزئیات روز/مدرسه با همان فیلتر جستجوی سراسری */
export function openDayModal({ date, schoolId, terms, query }) {
  const school = schoolById(schoolId);
  const shift = shiftOfSchool(schoolId, date);
  const dayIdx = weekdayIndex(date);
  const schoolDay = SCHOOL_DAY_INDEXES.includes(dayIdx);
  const dayName = WEEKDAYS[dayIdx];
  const searching = terms.length > 0;
  const other = SCHOOLS.find((s) => s.id !== school.id);
  const otherShift = shiftOfSchool(other.id, date);

  let bodyHtml;
  let summary = '';
  if (!schoolDay) {
    bodyHtml = `
      <div class="empty-state compact">
        <span class="empty-icon">${icon('moon', 'ic ic-xl')}</span>
        <h3 class="empty-title">${dayName} تعطیل است</h3>
        <p class="empty-desc">در این روز کلاسی برگزار نمی‌شود.</p>
      </div>`;
  } else {
    const cards = classesOfSchool(school.id)
      .map((cls) => classDayCard(cls, dayName, shift, terms));
    const visible = cards.filter((c) => c.html);
    const bells = cards.reduce((sum, c) => sum + c.matchCount, 0);
    summary = searching
      ? `برای «${query}»: ${toFa(visible.length)} کلاس · ${toFa(bells)} زنگ`
      : `${toFa(visible.length)} کلاس · ${toFa(bells)} زنگ`;
    bodyHtml = visible.length
      ? `<div class="cards-grid">${visible.map((c) => c.html).join('')}</div>`
      : `<div class="empty-state compact">
           <span class="empty-icon">${icon('search', 'ic ic-xl')}</span>
           <h3 class="empty-title">در این شیفت برای «${query}» نتیجه‌ای نیست</h3>
           <p class="empty-desc">شیفت مقابل (${other.name}) را امتحان کنید.</p>
         </div>`;
  }

  contentEl.innerHTML = `
    <header class="modal-head ${school.theme}">
      <div class="modal-head-main">
        <h2 class="modal-title" id="modalTitle">${school.name}</h2>
        <p class="modal-subtitle">${J.fullDate(date)}</p>
        <div class="modal-head-meta">
          ${shiftBadge(shift)}
          <span class="group-hours">${icon('clock', 'ic ic-sm')} ${SHIFTS[shift].range}</span>
          <span class="modal-summary">${summary}</span>
        </div>
      </div>
      <button type="button" class="btn-icon modal-close" data-close-modal aria-label="بستن">${icon('x')}</button>
    </header>
    <div class="modal-body">${bodyHtml}</div>
    <footer class="modal-foot">
      <button type="button" class="btn-ghost" data-open-day="${date.getTime()}" data-school="${other.id}">
        ${icon('swap', 'ic ic-sm')} شیفت مقابل: ${other.short} (${SHIFTS[otherShift].label})
      </button>
      <button type="button" class="btn-primary" data-close-modal>بستن</button>
    </footer>`;

  show();
}

function show() {
  if (!isOpen) lastFocused = document.activeElement;
  isOpen = true;
  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add('is-open'));
  document.documentElement.style.overflow = 'hidden';
  $('.modal-close', backdrop)?.focus();
}

export function closeModal() {
  if (!isOpen) return;
  isOpen = false;
  backdrop.classList.remove('is-open');
  backdrop.hidden = true;
  document.documentElement.style.overflow = '';
  lastFocused?.focus?.();
}
