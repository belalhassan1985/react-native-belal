export const ar = {
  // Common
  common: {
    loading: 'جاري التحميل...',
    error: 'خطأ',
    retry: 'إعادة المحاولة',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    save: 'حفظ',
    close: 'إغلاق',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    done: 'تم',
    success: 'نجاح',
    failed: 'فشل',
    noData: 'لا توجد بيانات',
    notAvailable: 'غير متوفر',
  },

  // Auth
  auth: {
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    emailRequired: 'البريد الإلكتروني مطلوب',
    emailInvalid: 'البريد الإلكتروني غير صحيح',
    passwordRequired: 'كلمة المرور مطلوبة',
    passwordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    loginFailed: 'فشل تسجيل الدخول',
    sessionExpired: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى',
  },

  // Home
  home: {
    title: 'الرئيسية',
    welcome: 'مرحباً',
    myCourses: 'دوراتي',
    availableCourses: 'الدورات المتاحة',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
  },

  // Courses
  courses: {
    title: 'الدورات',
    available: 'الدورات المتاحة',
    myCourses: 'دوراتي',
    search: 'ابحث عن الدورات...',
    noCourses: 'لا توجد دورات',
    noResults: 'لا توجد نتائج للبحث',
    courseCount: 'دورة',
    viewDetails: 'عرض التفاصيل',
  },

  // Course Details
  courseDetails: {
    title: 'تفاصيل الدورة',
    progress: 'نسبة الإنجاز',
    info: 'معلومات الدورة',
    goal: 'الهدف',
    conditions: 'الشروط',
    beneficiaries: 'المستفيدون',
    startDate: 'تاريخ البداية',
    endDate: 'تاريخ النهاية',
    duration: 'المدة',
    days: 'يوم',
    traineesCount: 'عدد المتدربين',
    trainingCenter: 'مركز التدريب',
    lectures: 'المحاضرات',
    remaining: 'متبقي',
    daysLeft: 'يوم على انتهاء الدورة',
    completed: 'مكتمل',
    lesson: 'درس',
    lessons: 'الدروس',
  },

  // My Courses
  myCourses: {
    title: 'دوراتي',
    all: 'الكل',
    active: 'نشطة',
    completed: 'مكتملة',
    noCourses: 'لم تسجل في أي دورة بعد',
    noActive: 'لا توجد دورات نشطة',
    noCompleted: 'لا توجد دورات مكتملة',
  },

  // Profile
  profile: {
    title: 'الملف الشخصي',
    personalInfo: 'المعلومات الشخصية',
    adminInfo: 'المعلومات الإدارية',
    fullName: 'الاسم الكامل',
    nickname: 'اللقب',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    birthDate: 'تاريخ الميلاد',
    state: 'المحافظة',
    agency: 'الوكالة',
    generalDepartment: 'القسم العام',
    department: 'القسم',
    section: 'الشعبة',
    employeeId: 'الرقم الوظيفي',
    version: 'الإصدار',
  },

  // Notifications
  notifications: {
    title: 'الإشعارات',
    noNotifications: 'لا توجد إشعارات',
    notificationsWillAppear: 'ستظهر الإشعارات هنا عندما تصل',
    markAllRead: 'تحديد الكل مقروء',
    unread: 'غير مقروء',
    now: 'الآن',
    minutesAgo: 'منذ {n} دقيقة',
    hoursAgo: 'منذ {n} ساعة',
    daysAgo: 'منذ {n} يوم',
  },

  // Errors
  errors: {
    networkError: 'لا يوجد اتصال بالإنترنت',
    serverError: 'حدث خطأ في الخادم',
    validationError: 'يرجى التحقق من المدخلات',
    unknownError: 'حدث خطأ ما',
    loadFailed: 'فشل تحميل البيانات',
  },
};

export type TranslationKeys = typeof ar;