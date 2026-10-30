/**
 * search.js — موتور جستجو/فیلتر یکپارچه هر سه نما
 *
 * قاعدهٔ فیلتر (در همه‌ی نماها یکسان):
 * - بدون جستجو: همه‌چیز نمایش داده می‌شود.
 * - با جستجو: هر «زنگ» بر اساس «بافت» خودش (دبیر + درس + کلاس + مدرسه + روز + نام زنگ)
 *   سنجیده می‌شود؛ کلاسی می‌ماند که دست‌کم یک زنگ منطبق داشته باشد، زنگ‌های منطبق
 *   هایلایت و بقیهٔ زنگ‌های همان روز کلاس کم‌رنگ می‌شوند تا جای زنگ در برنامه گم نشود.
 */

import { BELLS, WEEKDAYS, schoolById } from './config.js';
import { CLASSES, classesOfSchool } from './data.js';
import { esc } from './dom.js';

/* ───────────────────────── نرمال‌سازی متن فارسی/عربی ───────────────────────── */

const CHAR_MAP = {
  'ي': 'ی', 'ى': 'ی', 'ئ': 'ی', 'ك': 'ک', 'ة': 'ه', 'ۀ': 'ه', 'ە': 'ه',
  'ؤ': 'و', 'إ': 'ا', 'أ': 'ا', 'ٱ': 'ا', 'آ': 'ا', '‌': ' ', ' ': ' ',
};
const DIGITS_RE = /[۰-۹٠-٩]/g;
const DIACRITICS_RE = /[ً-ٰٕـ]/g;

/**
 * نرمال‌سازی با نگه‌داری نگاشت ایندکس به متن اصلی (برای هایلایت دقیق روی متن خام).
 * @returns {{ text: string, map: number[] }} map[i] = ایندکس کاراکتر i نرمال‌شده در متن اصلی
 */
function normalizeWithMap(input) {
  let text = '';
  const map = [];
  const raw = String(input);
  for (let i = 0; i < raw.length; i++) {
    let ch = raw[i];
    if (DIACRITICS_RE.test(ch)) continue; // اعراب و کشیدگی حذف می‌شوند (بدون ایندکس)
    if (/[۰-۹]/.test(ch)) ch = String('۰۱۲۳۴۵۶۷۸۹'.indexOf(ch));
    else if (/[٠-٩]/.test(ch)) ch = String('٠١٢٣٤٥٦٧٨٩'.indexOf(ch));
    else if (CHAR_MAP[ch]) ch = CHAR_MAP[ch];
    text += ch.toLocaleLowerCase('fa');
    map.push(i);
  }
  return { text, map };
}

/** نرمال‌سازی ساده برای مقایسه (یکسان‌سازی ی/ک عربی، نیم‌فاصله، ارقام، اعراب) */
export function normalizeFa(input) {
  return normalizeWithMap(input).text.replace(/\s+/g, ' ').trim();
}

/** تبدیل عبارت جستجو به ترم‌های نرمال‌شده؛ همهٔ ترم‌ها باید مچ شوند (AND) */
export const toTerms = (query) =>
  normalizeFa(query).split(' ').filter(Boolean);

/* ───────────────────────── تطبیق زنگ/کلاس/مدرسه ───────────────────────── */

/** بافت قابل جستجوی یک زنگ */
function lessonHaystack(cls, dayName, bellIndex, lesson) {
  return normalizeFa(
    `${lesson.teacher} ${lesson.subject} ${cls.name} کلاس ${cls.code} ` +
    `${schoolById(cls.schoolId).name} ${schoolById(cls.schoolId).short} ` +
    `${dayName} ${BELLS[bellIndex].name}`,
  );
}

const lessonMatches = (cls, dayName, bellIndex, lesson, terms) => {
  if (!terms.length) return true;
  const hay = lessonHaystack(cls, dayName, bellIndex, lesson);
  return terms.every((t) => hay.includes(t));
};

/**
 * نتیجهٔ فیلتر یک «کلاس در یک روز»: فهرست زنگ‌ها + ایندکس زنگ‌های منطبق.
 * نماهای روزانه/مودال از همین استفاده می‌کنند.
 */
export function filterClassDay(cls, dayName, terms) {
  const lessons = cls.days[dayName] ?? [];
  const matched = new Set();
  lessons.forEach((lesson, i) => {
    if (lessonMatches(cls, dayName, i, lesson, terms)) matched.add(i);
  });
  return { lessons, matched, anyMatch: matched.size > 0 };
}

/** نتیجهٔ فیلتر یک کلاس در کل هفته — برای نمای هفتگی */
export function filterClassWeek(cls, terms) {
  const days = {};
  let weekMatchCount = 0;
  for (const dayName of WEEKDAYS) {
    if (!cls.days[dayName]) continue;
    days[dayName] = filterClassDay(cls, dayName, terms);
    weekMatchCount += days[dayName].matched.size;
  }
  return { days, weekMatchCount, anyMatch: weekMatchCount > 0 };
}

/**
 * آیا در «یک مدرسه در یک روز» نتیجه‌ای برای جستجو هست؟ + تعداد زنگ‌های منطبق
 * قدم اول فیلتر تقویم ماهانه: در هر خانه فقط بلاک مدرسه‌ای می‌ماند که نتیجه دارد.
 */
export function schoolDayMatch(schoolId, dayName, terms) {
  let count = 0;
  for (const cls of classesOfSchool(schoolId)) {
    count += filterClassDay(cls, dayName, terms).matched.size;
  }
  return { has: count > 0, count };
}

/** جستجو در همهٔ کلاس‌ها برای یک روز — آمار نمای روزانه */
export function dayStats(dayName, terms) {
  let classes = 0, bells = 0;
  for (const cls of CLASSES) {
    const r = filterClassDay(cls, dayName, terms);
    if (r.anyMatch) classes++;
    bells += r.matched.size;
  }
  return { classes, bells };
}

/* ───────────────────────── هایلایت متن ───────────────────────── */

/** متن را امن (escape) برمی‌گرداند و بخش منطبق با ترم‌های جستجو را داخل <mark> می‌گذارد */
export function highlight(text, terms) {
  const raw = String(text);
  if (!terms?.length) return esc(raw);
  const { text: norm, map } = normalizeWithMap(raw);
  const ranges = [];
  for (const term of terms) {
    let from = 0;
    while (term) {
      const idx = norm.indexOf(term, from);
      if (idx === -1) break;
      ranges.push([map[idx], map[idx + term.length - 1] + 1]);
      from = idx + term.length;
    }
  }
  if (!ranges.length) return esc(raw);

  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0]];
  for (const [s, e] of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (s <= last[1]) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }

  let html = '', pos = 0;
  for (const [s, e] of merged) {
    html += esc(raw.slice(pos, s)) + `<mark>${esc(raw.slice(s, e))}</mark>`;
    pos = e;
  }
  return html + esc(raw.slice(pos));
}
