/**
 * data.js — برنامهٔ هفتگی کلاس‌ها (دیتای نمونه برگرفته از فایل قبلی توسعه‌دهنده)
 * ساختار هر کلاس: { id, code, name, schoolId, days: { نام‌روز: [{ subject, teacher } × ۳ زنگ] } }
 * در نسخهٔ واقعی کافی است همین آرایه از API خوانده شود؛ بقیهٔ سامانه به آن وابسته نیست.
 */

export const CLASSES = [
  // ── دبیرستان افشارچی ۱ ──────────────────────────────────────────────
  {
    id: 'c71', code: '7-1', name: 'هفتم ۱', schoolId: '1',
    days: {
      'شنبه': [
        { subject: 'عربی', teacher: 'قهرمانی' },
        { subject: 'ریاضی', teacher: 'حسینی' },
        { subject: 'علوم', teacher: 'طوماری' },
      ],
      'یک‌شنبه': [
        { subject: 'تفکر', teacher: 'کوثری‌نیا' },
        { subject: 'ریاضی', teacher: 'حسینی' },
        { subject: 'پیام', teacher: 'مصطفوی' },
      ],
      'دوشنبه': [
        { subject: 'املا و نگارش', teacher: 'دوستی' },
        { subject: 'علوم/مطالعات', teacher: 'طوماری / شیری' },
        { subject: 'مطالعات', teacher: 'شیری' },
      ],
      'سه‌شنبه': [
        { subject: 'فارسی', teacher: 'رحمانی' },
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
        { subject: 'قرآن', teacher: 'قدوسی' },
      ],
      'چهارشنبه': [
        { subject: 'فرهنگ و هنر', teacher: 'ارجمندفر' },
        { subject: 'انگلیسی', teacher: 'بهبودی' },
        { subject: 'کار و فناوری', teacher: 'رحمانی' },
      ],
    },
  },
  {
    id: 'c72', code: '7-2', name: 'هفتم ۲', schoolId: '1',
    days: {
      'شنبه': [
        { subject: 'ریاضی', teacher: 'حسینی' },
        { subject: 'علوم', teacher: 'طوماری' },
        { subject: 'عربی', teacher: 'قهرمانی' },
      ],
      'یک‌شنبه': [
        { subject: 'ریاضی', teacher: 'حسینی' },
        { subject: 'مطالعات', teacher: 'شیری' },
        { subject: 'فرهنگ و هنر', teacher: 'بلباسی' },
      ],
      'دوشنبه': [
        { subject: 'علوم/مطالعات', teacher: 'طوماری / شیری' },
        { subject: 'قرآن', teacher: 'قدوسی' },
        { subject: 'املا و نگارش', teacher: 'دوستی' },
      ],
      'سه‌شنبه': [
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
        { subject: 'فارسی', teacher: 'رحمانی' },
        { subject: 'کار و فناوری', teacher: 'ارجمندفر' },
      ],
      'چهارشنبه': [
        { subject: 'تفکر', teacher: 'قاسمی' },
        { subject: 'پیام', teacher: 'قدوسی' },
        { subject: 'انگلیسی', teacher: 'بهبودی' },
      ],
    },
  },
  {
    id: 'c81', code: '8-1', name: 'هشتم ۱', schoolId: '1',
    days: {
      'شنبه': [
        { subject: 'انگلیسی', teacher: 'بهبودی' },
        { subject: 'عربی', teacher: 'قهرمانی' },
        { subject: 'ریاضی', teacher: 'حسینی' },
      ],
      'یک‌شنبه': [
        { subject: 'پیام', teacher: 'مصطفوی' },
        { subject: 'فرهنگ و هنر', teacher: 'بلباسی' },
        { subject: 'ریاضی', teacher: 'حسینی' },
      ],
      'دوشنبه': [
        { subject: 'قرآن', teacher: 'قدوسی' },
        { subject: 'املا و نگارش', teacher: 'دوستی' },
        { subject: 'فارسی', teacher: 'رحمانی' },
      ],
      'سه‌شنبه': [
        { subject: 'تفکر', teacher: 'قاسمی' },
        { subject: 'مطالعات', teacher: 'خداکرمی' },
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
      ],
      'چهارشنبه': [
        { subject: 'علوم/مطالعات', teacher: 'خداکرمی' },
        { subject: 'کار و فناوری', teacher: 'رحمانی' },
        { subject: 'علوم', teacher: 'خداکرمی' },
      ],
    },
  },
  {
    id: 'c91', code: '9-1', name: 'نهم ۱', schoolId: '1',
    days: {
      'شنبه': [
        { subject: 'علوم', teacher: 'طوماری' },
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
        { subject: 'انگلیسی', teacher: 'بهبودی' },
      ],
      'یک‌شنبه': [
        { subject: 'فرهنگ و هنر', teacher: 'بلباسی' },
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
        { subject: 'مطالعات', teacher: 'شیری' },
      ],
      'دوشنبه': [
        { subject: 'علوم/مطالعات', teacher: 'طوماری / شیری' },
        { subject: 'عربی', teacher: 'رحمانی' },
        { subject: 'قرآن', teacher: 'قدوسی' },
      ],
      'سه‌شنبه': [
        { subject: 'املا و نگارش', teacher: 'دوستی' },
        { subject: 'کار و فناوری', teacher: 'ارجمندفر' },
        { subject: 'آمادگی', teacher: 'خداکرمی' },
      ],
      'چهارشنبه': [
        { subject: 'فارسی', teacher: 'رحمانی' },
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
        { subject: 'پیام', teacher: 'قدوسی' },
      ],
    },
  },
  {
    id: 'c92', code: '9-2', name: 'نهم ۲', schoolId: '1',
    days: {
      'شنبه': [
        { subject: 'آمادگی', teacher: 'خداکرمی' },
        { subject: 'انگلیسی', teacher: 'بهبودی' },
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
      ],
      'یک‌شنبه': [
        { subject: 'مطالعات', teacher: 'شیری' },
        { subject: 'پیام‌های آسمان', teacher: 'مصطفوی' },
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
      ],
      'دوشنبه': [
        { subject: 'عربی', teacher: 'رحمانی' },
        { subject: 'علوم/مطالعات', teacher: 'طوماری / شیری' },
        { subject: 'علوم', teacher: 'طوماری' },
      ],
      'سه‌شنبه': [
        { subject: 'کار و فناوری', teacher: 'ارجمندفر' },
        { subject: 'املا و نگارش', teacher: 'دوستی' },
        { subject: 'فارسی', teacher: 'رحمانی' },
      ],
      'چهارشنبه': [
        { subject: 'قرآن', teacher: 'قدوسی' },
        { subject: 'فرهنگ و هنر', teacher: 'ارجمندفر' },
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
      ],
    },
  },

  // ── دبیرستان افشارچی ۲ ──────────────────────────────────────────────
  {
    id: 'c73', code: '7-3', name: 'هفتم ۳', schoolId: '2',
    days: {
      'شنبه': [
        { subject: 'ریاضی', teacher: 'حسینی' },
        { subject: 'تفکر', teacher: 'کوثری‌نیا' },
        { subject: 'پیام', teacher: 'مصطفوی' },
      ],
      'یک‌شنبه': [
        { subject: 'علوم/مطالعات', teacher: 'خداکرمی / فتحی' },
        { subject: 'انگلیسی', teacher: 'بهبودی' },
        { subject: 'ریاضی', teacher: 'حسینی' },
      ],
      'دوشنبه': [
        { subject: 'عربی', teacher: 'قهرمانی' },
        { subject: 'فرهنگ و هنر', teacher: 'بلباسی' },
        { subject: 'کار و فناوری', teacher: 'قهرمانی' },
      ],
      'سه‌شنبه': [
        { subject: 'مطالعات', teacher: 'فتحی' },
        { subject: 'فارسی', teacher: 'مسلمی' },
        { subject: 'املا و نگارش', teacher: 'مسلمی' },
      ],
      'چهارشنبه': [
        { subject: 'قرآن', teacher: 'دوستی' },
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
        { subject: 'علوم', teacher: 'خداکرمی' },
      ],
    },
  },
  {
    id: 'c74', code: '7-4', name: 'هفتم ۴', schoolId: '2',
    days: {
      'شنبه': [
        { subject: 'علوم', teacher: 'خداکرمی' },
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
        { subject: 'تفکر', teacher: 'کوثری‌نیا' },
      ],
      'یک‌شنبه': [
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
        { subject: 'علوم/مطالعات', teacher: 'خداکرمی / فتحی' },
        { subject: 'مطالعات', teacher: 'فتحی' },
      ],
      'دوشنبه': [
        { subject: 'املا و نگارش', teacher: 'مسلمی' },
        { subject: 'عربی', teacher: 'قهرمانی' },
        { subject: 'فرهنگ و هنر', teacher: 'بلباسی' },
      ],
      'سه‌شنبه': [
        { subject: 'فارسی', teacher: 'مسلمی' },
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
        { subject: 'پیام', teacher: 'قدوسی' },
      ],
      'چهارشنبه': [
        { subject: 'انگلیسی', teacher: 'بهبودی' },
        { subject: 'قرآن', teacher: 'دوستی' },
        { subject: 'کار و فناوری', teacher: 'ارجمندفر' },
      ],
    },
  },
  {
    id: 'c82', code: '8-2', name: 'هشتم ۲', schoolId: '2',
    days: {
      'شنبه': [
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
        { subject: 'عربی', teacher: 'مصطفوی' },
        { subject: 'علوم', teacher: 'خداکرمی' },
      ],
      'یک‌شنبه': [
        { subject: 'علوم/مطالعات', teacher: 'خداکرمی / فتحی' },
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
        { subject: 'انگلیسی', teacher: 'بهبودی' },
      ],
      'دوشنبه': [
        { subject: 'فرهنگ و هنر', teacher: 'بلباسی' },
        { subject: 'املا و نگارش', teacher: 'مسلمی' },
        { subject: 'کار و فناوری', teacher: 'ارجمندفر' },
      ],
      'سه‌شنبه': [
        { subject: 'تفکر', teacher: 'سلیمی' },
        { subject: 'پیام', teacher: 'قدوسی' },
        { subject: 'مطالعات', teacher: 'فتحی' },
      ],
      'چهارشنبه': [
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
        { subject: 'فارسی', teacher: 'مسلمی' },
        { subject: 'قرآن', teacher: 'قدوسی' },
      ],
    },
  },
  {
    id: 'c93', code: '9-3', name: 'نهم ۳', schoolId: '2',
    days: {
      'شنبه': [
        { subject: 'عربی', teacher: 'مصطفوی' },
        { subject: 'علوم', teacher: 'خداکرمی' },
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
      ],
      'یک‌شنبه': [
        { subject: 'انگلیسی', teacher: 'بهبودی' },
        { subject: 'علوم/مطالعات', teacher: 'خداکرمی / فتحی' },
        { subject: 'ریاضی', teacher: 'زنده‌دل' },
      ],
      'دوشنبه': [
        { subject: 'کار و فناوری', teacher: 'ارجمندفر' },
        { subject: 'فرهنگ و هنر', teacher: 'ارجمندفر' },
        { subject: 'املا و نگارش', teacher: 'مسلمی' },
      ],
      'سه‌شنبه': [
        { subject: 'پیام', teacher: 'قدوسی' },
        { subject: 'مطالعات', teacher: 'فتحی' },
        { subject: 'تربیت بدنی', teacher: 'سلیمی' },
      ],
      'چهارشنبه': [
        { subject: 'فارسی', teacher: 'مسلمی' },
        { subject: 'آمادگی', teacher: 'خداکرمی' },
        { subject: 'قرآن', teacher: 'دوستی' },
      ],
    },
  },
];

/** کلاس‌های یک مدرسه */
export const classesOfSchool = (schoolId) => CLASSES.filter((c) => c.schoolId === String(schoolId));

/** فهرست یکتای دبیران (برای چیپ‌های جستجوی سریع) — دبیران مشترک با «/» جدا می‌شوند */
export const ALL_TEACHERS = (() => {
  const set = new Set();
  for (const cls of CLASSES)
    for (const lessons of Object.values(cls.days))
      for (const { teacher } of lessons)
        teacher.split('/').forEach((t) => set.add(t.trim()));
  return [...set].sort((a, b) => a.localeCompare(b, 'fa'));
})();
