/**
 * jalali.js — آداپتور یکپارچهٔ تقویم جلالی روی کتابخانهٔ date-fns-jalali
 * (اسکریپت کلاسیک خام؛ بدون ماژول — تا پروژه با دابل‌کلیک روی index.html هم اجرا شود)
 *
 * مرجع CDN: https://cdn.jsdelivr.net/npm/date-fns-jalali@4.4.0-0/index.min.js
 * آن فایل یک ماژول ESM است که ۲۰۰+ تابع را re-export می‌کند؛ برای بهینه‌سازی
 * به‌جای کل باندل، فقط زیرماژول‌های لازم از همان نسخه و همان CDN با import()
 * داینامیک خوانده می‌شوند. اگر CDN در دسترس نباشد (یا صفحه آفلاین/از روی هارد باز
 * شده باشد)، خودکار از پیاده‌سازی مبتنی بر Intl (تقویم فارسی داخلی مرورگر)
 * استفاده می‌شود تا سامانه هرگز از کار نیفتد.
 *
 * چون اسکریپت کلاسیک top-level await ندارد، آماده‌شدن این لایه با پرامیس
 * SP.jalaliReady اعلام می‌شود و app.js بعد از آن بوت می‌شود.
 * همهٔ تاریخ‌ها به نصف‌شب (00:00) نرمال می‌شوند تا مقایسهٔ روزها دقیق باشد.
 */
(function () {
  'use strict';
  const SP = (window.SP = window.SP || {});
  const WEEKDAYS = SP.WEEKDAYS;
  const MONTHS = SP.MONTHS;

  const CDN_BASE = 'https://cdn.jsdelivr.net/npm/date-fns-jalali@4.4.0-0';
  const WEEK_STARTS_ON = 6; // شنبه (با شمارش getDay: یکشنبه=۰ … شنبه=۶)

  const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
  /** تبدیل ارقام لاتین به فارسی برای نمایش */
  const toFa = (value) => String(value).replace(/\d/g, (d) => FA_DIGITS[d]);

  /** ایندکس روز هفتهٔ ایرانی: شنبه=۰ … جمعه=۶ */
  const weekdayIndex = (date) => (date.getDay() + 1) % 7;

  const startOfDayNative = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  /* ─────────────────────── پیاده‌سازی روی date-fns-jalali ─────────────────────── */

  async function loadDateFnsJalali() {
    const NAMES = [
      'format', 'addDays', 'addMonths', 'startOfMonth', 'endOfMonth',
      'startOfWeek', 'eachDayOfInterval', 'differenceInCalendarWeeks',
      'getDaysInMonth', 'getYear', 'getMonth', 'getDate', 'isSameDay', 'newDate',
    ];
    const [mods, localeMod] = await Promise.all([
      Promise.all(NAMES.map((n) => import(/* @vite-ignore */ `${CDN_BASE}/${n}.js`))),
      import(/* @vite-ignore */ `${CDN_BASE}/locale/fa-IR.js`),
    ]);
    const faIR = localeMod.faIR;
    const df = {};
    NAMES.forEach((n, i) => { df[n] = mods[i][n]; });
    if (typeof df.format !== 'function' || !faIR) throw new Error('date-fns-jalali بارگذاری نشد');

    const F = (date, pattern) => toFa(df.format(date, pattern, { locale: faIR }));
    const startOfDay = startOfDayNative;

    return {
      source: 'date-fns-jalali',
      format: F,
      parts: (date) => ({ year: df.getYear(date), month: df.getMonth(date) + 1, day: df.getDate(date) }),
      monthName: (date) => F(date, 'MMMM'),
      monthTitle: (date) => F(date, 'MMMM yyyy'),
      weekdayName: (date) => F(date, 'EEEE'),
      fullDate: (date) => F(date, 'EEEE d MMMM yyyy'),
      dayMonth: (date) => F(date, 'd MMMM'),
      dayMonthYear: (date) => F(date, 'd MMMM yyyy'),
      addDays: (date, n) => startOfDay(df.addDays(date, n)),
      addMonths: (date, n) => startOfDay(df.addMonths(date, n)),
      startOfDay,
      startOfMonth: (date) => startOfDay(df.startOfMonth(date)),
      startOfWeek: (date) => startOfDay(df.startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON })),
      daysInMonth: (date) => df.getDaysInMonth(date),
      daysOfMonth(date) {
        return df
          .eachDayOfInterval({ start: df.startOfMonth(date), end: df.endOfMonth(date) })
          .map(startOfDay);
      },
      weeksDiff: (later, earlier) =>
        df.differenceInCalendarWeeks(later, earlier, { weekStartsOn: WEEK_STARTS_ON }),
      dateFromJalali: (year, month, day) => startOfDay(df.newDate(year, month - 1, day)),
      isSameDay: (a, b) => df.isSameDay(a, b),
    };
  }

  /* ─────────────────────── فال‌بک مبتنی بر Intl (بدون وابستگی خارجی) ─────────────────────── */

  function createIntlFallback() {
    const fmt = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', {
      year: 'numeric', month: 'numeric', day: 'numeric',
    });
    const parts = (date) => {
      const o = {};
      for (const p of fmt.formatToParts(date)) if (p.type !== 'literal') o[p.type] = +p.value;
      return { year: o.year, month: o.month, day: o.day };
    };
    const compareParts = (a, b) => a.year - b.year || a.month - b.month || a.day - b.day;
    const addDays = (date, n) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

    // ساخت تاریخ میلادی از روی اجزای جلالی: تخمین اولیه + اصلاح خطی با مقایسهٔ اجزا
    const dateFromJalali = (year, month, day) => {
      const target = { year, month, day };
      const estimate =
        new Date(2026, 8, 23).getTime() + // ۱ مهر ۱۴۰۵
        (((year - 1405) * 365 + (month - 7) * 30 + (day - 1)) * 86400000);
      let candidate = startOfDayNative(new Date(estimate));
      for (let i = 0; i < 90 && compareParts(parts(candidate), target) < 0; i++) candidate = addDays(candidate, 1);
      for (let i = 0; i < 90 && compareParts(parts(candidate), target) > 0; i++) candidate = addDays(candidate, -1);
      return candidate;
    };

    const startOfMonth = (date) => {
      const p = parts(date);
      return dateFromJalali(p.year, p.month, 1);
    };
    const daysInMonth = (date) => {
      const p = parts(date);
      const next = p.month === 12
        ? dateFromJalali(p.year + 1, 1, 1)
        : dateFromJalali(p.year, p.month + 1, 1);
      return Math.round((next - startOfMonth(date)) / 86400000);
    };
    const addMonths = (date, n) => {
      const p = parts(date);
      const total = p.year * 12 + (p.month - 1) + n;
      const y = Math.floor(total / 12);
      const m = (total % 12) + 1;
      const dim = daysInMonth(dateFromJalali(y, m, 1));
      return dateFromJalali(y, m, Math.min(p.day, dim));
    };
    const startOfWeek = (date) => startOfDayNative(addDays(date, -weekdayIndex(date)));

    return {
      source: 'intl-fallback',
      format: () => '',
      parts,
      monthName: (date) => MONTHS[parts(date).month - 1],
      monthTitle(date) { const p = parts(date); return `${MONTHS[p.month - 1]} ${toFa(p.year)}`; },
      weekdayName: (date) => WEEKDAYS[weekdayIndex(date)],
      fullDate(date) { const p = parts(date); return `${WEEKDAYS[weekdayIndex(date)]} ${toFa(p.day)} ${MONTHS[p.month - 1]} ${toFa(p.year)}`; },
      dayMonth(date) { const p = parts(date); return `${toFa(p.day)} ${MONTHS[p.month - 1]}`; },
      dayMonthYear(date) { const p = parts(date); return `${toFa(p.day)} ${MONTHS[p.month - 1]} ${toFa(p.year)}`; },
      addDays,
      addMonths,
      startOfDay: startOfDayNative,
      startOfMonth,
      startOfWeek,
      daysInMonth,
      daysOfMonth(date) {
        const first = startOfMonth(date);
        return Array.from({ length: daysInMonth(date) }, (_, i) => addDays(first, i));
      },
      weeksDiff: (later, earlier) =>
        Math.round((startOfWeek(later) - startOfWeek(earlier)) / 604800000),
      dateFromJalali,
      isSameDay: (a, b) => compareParts(parts(a), parts(b)) === 0,
    };
  }

  /* ─────────────────────── پوستهٔ J: همگام ساخته می‌شود و به impl آماده‌شده وصل است ─────────────────────── */

  let impl = null; // بعد از SP.jalaliReady مقدار می‌گیرد؛ متدهای J تا قبل از آن صدا زده نمی‌شوند

  /**
   * API یکپارچهٔ جلالی:
   * - parts(date) → { year, month(۱-۱۲), day }
   * - dateFromJalali(year, month۱-۱۲, day)
   * - startOfWeek بر مبنای شنبه است؛ weeksDiff اختلاف هفته‌های شنبه‌مبناست.
   */
  const J = {
    get source() { return impl ? impl.source : 'loading'; },
    format: (date, pattern) => impl.format(date, pattern),
    parts: (date) => impl.parts(date),
    monthName: (date) => impl.monthName(date),
    monthTitle: (date) => impl.monthTitle(date),
    weekdayName: (date) => impl.weekdayName(date),
    fullDate: (date) => impl.fullDate(date),
    dayMonth: (date) => impl.dayMonth(date),
    dayMonthYear: (date) => impl.dayMonthYear(date),
    addDays: (date, n) => impl.addDays(date, n),
    addMonths: (date, n) => impl.addMonths(date, n),
    startOfDay: (date) => impl.startOfDay(date),
    startOfMonth: (date) => impl.startOfMonth(date),
    startOfWeek: (date) => impl.startOfWeek(date),
    daysInMonth: (date) => impl.daysInMonth(date),
    daysOfMonth: (date) => impl.daysOfMonth(date),
    weeksDiff: (later, earlier) => impl.weeksDiff(later, earlier),
    dateFromJalali: (year, month, day) => impl.dateFromJalali(year, month, day),
    isSameDay: (a, b) => impl.isSameDay(a, b),

    /** شروع ماه از روی سال/ماه جلالی (ماه یک‌مبنا) */
    monthStart: (year, month) => impl.dateFromJalali(year, month, 1),

    /** هفت روز هفتهٔ شامل این تاریخ، از شنبه */
    daysOfWeek(date) {
      const first = impl.startOfWeek(date);
      return Array.from({ length: 7 }, (_, i) => impl.addDays(first, i));
    },

    isToday: (date) => impl.isSameDay(date, new Date()),

    /** کلید یکتای ماه برای مقایسهٔ ساده */
    monthKey(date) {
      const p = impl.parts(date);
      return `${p.year}-${p.month}`;
    },
  };

  SP.J = J;
  SP.toFa = toFa;
  SP.weekdayIndex = weekdayIndex;

  /** وقتی این پرامیس resolve شود، متدهای J قابل استفاده‌اند */
  SP.jalaliReady = (async () => {
    try {
      // تایم‌اوت تا اگر CDN هنگ کرد، سامانه معطل نماند و فال‌بک فعال شود
      impl = await Promise.race([
        loadDateFnsJalali(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('CDN timeout')), 7000)),
      ]);
    } catch (err) {
      console.warn('[jalali] لود date-fns-jalali از CDN ناموفق بود؛ فال‌بک Intl فعال شد.', err);
      impl = createIntlFallback();
    }
    return J;
  })();
})();
