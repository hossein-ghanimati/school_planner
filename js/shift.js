/**
 * shift.js — منطق چرخش شیفت مدرسهٔ دوشیفته (اسکریپت کلاسیک؛ API روی SP)
 *
 * قاعده: در هفتهٔ مبدأ (هفتهٔ شامل چهارشنبه ۱ مهر ۱۴۰۵) افشارچی ۱ صبح است؛
 * هر شنبه شیفت‌ها جابه‌جا می‌شوند. پس زوج/فرد بودن «شمارهٔ هفته نسبت به هفتهٔ مبدأ»
 * تعیین می‌کند کدام مدرسه صبح است. این محاسبه برای هر تاریخی (قبل یا بعد از مبدأ) معتبر است.
 */
(function () {
  'use strict';
  const SP = (window.SP = window.SP || {});
  const J = SP.J;
  const SCHOOLS = SP.SCHOOLS;
  const SHIFTS = SP.SHIFTS;
  const SHIFT_ANCHOR = SP.SHIFT_ANCHOR;

  // تاریخ مبدأ تنبل (lazy) ساخته می‌شود چون J بعد از SP.jalaliReady آماده است
  let anchorDate = null;
  const getAnchor = () =>
    (anchorDate ??= J.dateFromJalali(SHIFT_ANCHOR.year, SHIFT_ANCHOR.month, SHIFT_ANCHOR.day));

  const otherSchoolId = SCHOOLS.find((s) => s.id !== SHIFT_ANCHOR.morningSchoolId).id;

  /** حافظهٔ نهان بر اساس ابتدای هفته — تقویم ماهانه برای هر خانه صدا می‌زند */
  const cache = new Map();

  /**
   * شیفت دو مدرسه در تاریخ داده‌شده
   * @returns {{ morningSchoolId: string, afternoonSchoolId: string, weekIndex: number }}
   */
  function getShift(date) {
    const key = J.startOfWeek(date).getTime();
    let result = cache.get(key);
    if (!result) {
      const weekIndex = J.weeksDiff(date, getAnchor());
      const isEvenWeek = ((weekIndex % 2) + 2) % 2 === 0;
      result = {
        weekIndex,
        morningSchoolId: isEvenWeek ? SHIFT_ANCHOR.morningSchoolId : otherSchoolId,
        afternoonSchoolId: isEvenWeek ? otherSchoolId : SHIFT_ANCHOR.morningSchoolId,
      };
      cache.set(key, result);
    }
    return result;
  }

  /** شیفت یک مدرسهٔ مشخص در یک تاریخ: 'morning' | 'afternoon' */
  const shiftOfSchool = (schoolId, date) =>
    getShift(date).morningSchoolId === String(schoolId) ? 'morning' : 'afternoon';

  /** مدارس مرتب‌شده بر اساس شیفت آن تاریخ (اول صبح، بعد بعدازظهر) — برای ترتیب نمایش گروه‌ها */
  function schoolsByShift(date) {
    const { morningSchoolId, afternoonSchoolId } = getShift(date);
    const byId = Object.fromEntries(SCHOOLS.map((s) => [s.id, s]));
    return [
      { school: byId[morningSchoolId], shift: 'morning' },
      { school: byId[afternoonSchoolId], shift: 'afternoon' },
    ];
  }

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  /**
   * وضعیت لحظه‌ای مدرسه بر اساس ساعت فعلی:
   * کدام شیفت الان در حال برگزاری است؟ (برای برچسب «الان» در سربرگ)
   * @returns {{ key: 'before'|'morning'|'gap'|'afternoon'|'after', label: string }}
   */
  function currentShiftStatus(now = new Date()) {
    const t = now.getHours() * 60 + now.getMinutes();
    const m = SHIFTS.morning, a = SHIFTS.afternoon;
    if (t < toMinutes(m.from)) return { key: 'before', label: 'هنوز زنگ اول شروع نشده' };
    if (t <= toMinutes(m.to)) return { key: 'morning', label: 'الان شیفت صبح در حال برگزاری است' };
    if (t < toMinutes(a.from)) return { key: 'gap', label: 'بین دو شیفت؛ مدرسه در حال تعویض شیفت است' };
    if (t <= toMinutes(a.to)) return { key: 'afternoon', label: 'الان شیفت بعدازظهر در حال برگزاری است' };
    return { key: 'after', label: 'ساعت کاری امروز مدرسه تمام شده' };
  }

  SP.getShift = getShift;
  SP.shiftOfSchool = shiftOfSchool;
  SP.schoolsByShift = schoolsByShift;
  SP.currentShiftStatus = currentShiftStatus;
})();
