// ============================================================================
//  BASE CONFIGURATION (defaults)
//  Department-specific values (names, logos, rules, committee, accounts and
//  lists) live in js/department.js, which the master account exports from
//  Settings → Administration. Values there override the defaults below.
//  Every text has an Arabic and an English form: ['Arabic', 'English'].
// ============================================================================
window.APP_CONFIG = {
  appId: 'wre-attendance',              // storage key prefix; change when deploying for another department
  version: '2.6.0',

  // Owner and designer of the app (shown in About, the lock screen and the guides)
  owner: {
    name:  ['د. صباح حسن الفرطوسي', 'Dr. Sabah H. Fartosy'],
    role:  ['مالك التطبيق ومصممه', 'Owner and designer of the app'],
    email: 'dr.sabah77@uomustansiriyah.edu.iq',
    phone: '+9647733819837',
  },

  // Absence follow-up committee printed at the end of final reports (set by the master account)
  committee: {
    title: ['لجنة متابعة غيابات الطلبة', 'Student Absence Follow-up Committee'],
    chair: '', member1: '', member2: '',
  },

  institution: {
    university: ['الجامعة المستنصرية', 'Mustansiriyah University'],
    college:    ['كلية الهندسة', 'College of Engineering'],
    department: ['قسم هندسة الموارد المائية', 'Department of Water Resources Engineering'],
    headTitle:  ['رئيس قسم هندسة الموارد المائية', 'Head of the Water Resources Engineering Department'],
    city:       ['بغداد', 'Baghdad'],
  },

  // Logo files (relative to index.html). PNG/SVG with transparent background work best.
  // Replace the files in /logos to change them. Set a value to '' to hide that logo.
  logos: {
    university: 'logos/university.png',
    college:    'logos/college.png',
    department: 'logos/department.svg',
  },

  // Absence rules (percent of the course's planned hours), one set per teaching system.
  rules: {
    // Bologna (semester courses): Bologna Process Adoption Guide for Iraqi Universities 2025/2026,
    // chapter 4, "Attendance and examination requirements": alert at 7 % (= one study week),
    // final warning at 14 % (two weeks), fail above 14 % without an official excuse, or above 21 %
    // (three weeks) with an excuse approved by the college council; the course is repeated.
    bologna: {
      warn1: 7, warn2: 14, failUnexcused: 14, failTotal: 21,
      weekEquivalent: true,   // a warning is also due once absence reaches 1 / 2 study weeks of the course
      regulationRef: [
        'الفصل الرابع (ثانياً: متطلبات الدوام والامتحانات) من دليل اعتماد عملية بولونيا في الجامعات العراقية للسنة الدراسية 2025/2026',
        'Chapter 4 (Attendance and examination requirements) of the Bologna Process Adoption Guide for Iraqi Universities 2025/2026',
      ],
    },
    // Annual system (year-long courses): Article 9 of Examination Instructions No. 134 of 2000,
    // amended by decision 157 of 2004: fail above 10 % unexcused or 15 % with an approved excuse.
    annual: {
      warn1: 5, warn2: 8, failUnexcused: 10, failTotal: 15,
      regulationRef: [
        'المادة (9) من التعليمات الامتحانية رقم 134 لسنة 2000 المعدلة بالقرار 157 لسنة 2004',
        'Article 9 of Examination Instructions No. 134 of 2000, amended by decision 157 of 2004',
      ],
    },
    weeksPerTerm: 15,  // Article 15: a unit = 1 weekly hour for 15 weeks
    editWindowHours: 72,       // lecturers may change a recorded lecture within this many hours
    trackFrom: '2026-11-15',   // alerts for lectures not recorded / not received start from this date
  },

  // Academic structure
  stages: 4,                                   // number of undergraduate stages (years)
  systems: [['bologna', 'بولونيا', 'Bologna'], ['annual', 'السنوي', 'Annual']],
  terms: [['t1', 'الفصل الأول', 'Term 1'], ['t2', 'الفصل الثاني', 'Term 2']],
  // Teaching systems of a course: Bologna = semester course (one term); annual = year-long course (both terms)
  courseSystems: [['semester', 'بولونيا (فصلي)', 'Bologna (semester)'], ['year', 'سنوي (العام كاملاً)', 'Annual (whole year)']],
  weekStartsOn: 0,                             // 0 = Sunday (Iraq), 1 = Monday
  workingDays: [0, 1, 2, 3, 4],                // Sunday..Thursday

  // Access control. Each person signs in with their own account (js/department.js → accounts).
  // Passwords are stored only as PBKDF2-SHA256 hashes. bootstrapMasterHash (SHA-256) lets the head
  // of department sign in on a fresh deployment that has no accounts yet.
  access: {
    enabled: true,
    bootstrapMasterHash: '95714c52531b6e66d8ac0f78fb5e0b2a4c061c3eb56461116d353c097e8c6820',
    pbkdf2Iterations: 120000,
    rememberDays: 7,              // lecturers may keep their own phone signed in this many days (0 = never)
    rememberRoles: ['lecturer'],  // administrators and heads are asked for their password at every opening
    idleLockMinutes: 15,          // sessions that are not remembered lock after this many minutes without use
  },

  // Default report recipients (the master account can edit this list inside the app).
  // title: 'head' | 'committee' | 'person'
  recipients: [
    { id: 'r_head', title: 'head', name: '', email: '', phone: '', authorized: true },
  ],

  // Google Drive storage (Google Apps Script web app installed in the department's Google account; see admin.html).
  // Empty url = off: reports are then exchanged as files. Usually set from Settings → Department setup.
  // provider: 'none' | 'gdrive' (Google Apps Script in a Google account) | 'college' (college data centre) | 'server' (another data centre)
  cloud: { provider: 'none', url: '', label: '' },

  // Android app download offered in Settings (relative to index.html; '' hides the link)
  androidApk: 'download/WRE-Attendance.apk',

  // Default UI language: 'ar' or 'en'
  defaultLang: 'ar',
  themeColor: '#0b3d70',
};
