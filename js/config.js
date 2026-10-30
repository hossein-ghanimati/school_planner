/**
 * config.js — ثابت‌ها و تنظیمات سراسری سامانه
 * دبیرستان دوشیفتهٔ رضاق افشارچی (ناحیه ۲ زنجان)
 *
 * پروژه کاملاً HTML/JS خام و استاتیک است (بدون ماژول، بدون بیلد، بدون هیچ پکیجی)؛
 * هر فایل یک IIFE است که API خودش را روی namespace سراسری SP می‌گذارد
 * و فایل‌ها به ترتیبِ وابستگی با تگ‌های <script> معمولی در index.html لود می‌شوند.
 */
(function () {
  'use strict';
  const SP = (window.SP = window.SP || {});

  /** دو مدرسه‌ای که به‌صورت چرخشی صبح/بعدازظهر هستند؛ theme برای تفکیک رنگی در UI */
  const SCHOOLS = [
    { id: '1', short: 'افشارچی ۱', name: 'دبیرستان افشارچی ۱', theme: 's1' },
    { id: '2', short: 'افشارچی ۲', name: 'دبیرستان افشارچی ۲', theme: 's2' },
  ];

  const schoolById = (id) => SCHOOLS.find((s) => s.id === String(id));

  /** روزهای هفته با ایندکس ایرانی: ۰=شنبه … ۶=جمعه */
  const WEEKDAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

  /** روزهای درسی (شنبه تا چهارشنبه) */
  const SCHOOL_DAY_INDEXES = [0, 1, 2, 3, 4];

  /** ماه‌های جلالی */
  const MONTHS = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
  ];

  /** برچسب ردیف‌های تقویم ماهانه (محور Y) */
  const WEEK_LABELS = ['هفتهٔ اول', 'هفتهٔ دوم', 'هفتهٔ سوم', 'هفتهٔ چهارم', 'هفتهٔ پنجم', 'هفتهٔ ششم'];

  /** زنگ‌ها و ساعت برگزاری در هر شیفت */
  const BELLS = [
    { name: 'زنگ اول', morning: '۷:۳۰ تا ۹:۰۰', afternoon: '۱۲:۴۵ تا ۱۴:۱۵' },
    { name: 'زنگ دوم', morning: '۹:۱۵ تا ۱۰:۴۵', afternoon: '۱۴:۳۰ تا ۱۶:۰۰' },
    { name: 'زنگ سوم', morning: '۱۱:۰۰ تا ۱۲:۳۰', afternoon: '۱۶:۱۵ تا ۱۷:۴۵' },
  ];

  /** بازهٔ کامل هر شیفت — from/to برای محاسبهٔ «وضعیت الان» */
  const SHIFTS = {
    morning: { key: 'morning', label: 'صبح', range: '۷:۳۰ تا ۱۲:۳۰', from: '07:30', to: '12:30' },
    afternoon: { key: 'afternoon', label: 'بعدازظهر', range: '۱۲:۴۵ تا ۱۷:۴۵', from: '12:45', to: '17:45' },
  };

  /**
   * مبدأ چرخش شیفت: چهارشنبه ۱ مهر ۱۴۰۵، افشارچی ۱ صبح و افشارچی ۲ بعدازظهر.
   * از شنبهٔ بعد، شیفت‌ها جابه‌جا می‌شوند و هر شنبه این چرخش تکرار می‌شود.
   * (month یک‌مبناست؛ مهر = ۷)
   */
  const SHIFT_ANCHOR = { year: 1405, month: 7, day: 1, morningSchoolId: '1' };

  SP.SCHOOLS = SCHOOLS;
  SP.schoolById = schoolById;
  SP.WEEKDAYS = WEEKDAYS;
  SP.SCHOOL_DAY_INDEXES = SCHOOL_DAY_INDEXES;
  SP.MONTHS = MONTHS;
  SP.WEEK_LABELS = WEEK_LABELS;
  SP.BELLS = BELLS;
  SP.SHIFTS = SHIFTS;
  SP.SHIFT_ANCHOR = SHIFT_ANCHOR;
})();
