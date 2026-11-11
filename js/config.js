// ============================================================================
//  INSTITUTION CONFIGURATION
//  Edit this file to adapt the app to another department, college or university.
//  Every text has an Arabic and an English form: ['Arabic', 'English'].
//  Student lists and the timetable live in js/data.js (see README for format).
// ============================================================================
window.APP_CONFIG = {
  appId: 'wre-attendance',              // storage key prefix; change when deploying for another department
  version: '1.3.0',

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

  // Absence rules (percent of the course's planned term hours).
  // Defaults follow Article 9 of Examination Instructions No. 134 (2000), amended by decision 157 (2004).
  rules: {
    warn1: 5,          // first warning
    warn2: 8,          // final warning
    failUnexcused: 10, // fail when unexcused absence exceeds this
    failTotal: 15,     // fail when total absence (excused + unexcused) exceeds this
    weeksPerTerm: 15,  // Article 15: a unit = 1 weekly hour for 15 weeks
    regulationRef: [
      'المادة (9) من التعليمات الامتحانية رقم 134 لسنة 2000 المعدلة بالقرار 157 لسنة 2004',
      'Article 9 of Examination Instructions No. 134 of 2000, amended by decision 157 of 2004',
    ],
  },

  // Academic structure
  stages: 4,                                   // number of undergraduate stages (years)
  systems: [['bologna', 'بولونيا', 'Bologna'], ['annual', 'السنوي', 'Annual']],
  terms: [['t1', 'الفصل الأول', 'Term 1'], ['t2', 'الفصل الثاني', 'Term 2']],
  weekStartsOn: 0,                             // 0 = Sunday (Iraq), 1 = Monday
  workingDays: [0, 1, 2, 3, 4],                // Sunday..Thursday

  // Access control: the app asks for this code before it opens.
  // codeHash is the SHA-256 of the code. To change the code, compute the new hash
  // (e.g. on https://emn178.github.io/online-tools/sha256.html or with: python -c "import hashlib;print(hashlib.sha256(b'NEW-CODE').hexdigest())")
  // and paste it here. The codes themselves are kept by the head of department, not in this file.
  access: {
    enabled: true,
    codeHash: '2d99ce09032d3b4605eef86c7fce2f34684655dc6e1c6da9ccfafed33e1ed48a',    // lecturers' code
    masterHash: 'a9811830bda9c2303a190bc2934e7538a7198fede100a7884ca893665d97d2eb',  // head of department's (master) code
    rememberDays: 30,   // 0 = ask at every launch; otherwise the device stays unlocked this many days
  },

  // Default report recipients (the master account can edit this list inside the app).
  // title: 'head' | 'committee' | 'person'
  recipients: [
    { id: 'r_head', title: 'head', name: '', email: '', phone: '', authorized: true },
  ],

  // Android app download offered in Settings (relative to index.html; '' hides the link)
  androidApk: 'download/WRE-Attendance.apk',

  // Default UI language: 'ar' or 'en'
  defaultLang: 'ar',
  themeColor: '#0b3d70',
};
