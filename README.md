# Student Attendance App — نظام تسجيل غيابات الطلبة

Installable web app (PWA) for recording student absences in an undergraduate department.
Prepared for the Department of Water Resources Engineering, College of Engineering, Mustansiriyah University,
but every name, logo and rule lives in one configuration file so any department can reuse it.

Works on **Android** (Chrome) and **iPhone / iPad** (Safari) as a home-screen app, fully offline, no app store and no paid account needed.

---

## 1. Features

| Area | What it does |
|---|---|
| Languages | Full Arabic / English interface (toggle in the header). Reports can be produced in either language regardless of the interface language. |
| Academic years | Any number of years, each with Term 1 and Term 2 (dates and number of weeks editable). The 2026-2027 year is preloaded from the official university calendar: term 1 = 20 Sep – 31 Dec 2026, term 2 = 31 Jan – 13 May 2027, 15 weeks each. |
| Stages / sections | Stage 1–4, Bologna or annual system, sections A/B… Preloaded with the department's current lists (135 students in 5 groups). |
| Courses | Per stage, per term: name (AR/EN), lecturer, type (theory / tutorial / practical), weekly hours, schedule, room. 97 term-1 courses preloaded from the timetable. One tap copies a stage's courses to the other term. |
| Recording | Pick the course (today's lectures are suggested automatically), set date and hours, tap each student: present / absent / excused / late, with an excuse note. Edit or delete any past lecture. |
| Rules | Article 9 of Examination Instructions No. 134 (2000), amended 2004: fail at > 10 % unexcused or > 15 % total absence of the planned hours (weekly hours × 15 weeks). First warning (5 %) and final warning (8 %) thresholds are editable. |
| Reports | Daily / weekly / monthly / whole-term / custom-period **memo to the head of department**: per student, absence days, hours, cumulative percentage, status and recommended action, with official header and logos. Also course report, student report, stage overview matrix and the attendance register (dates × students). Each prints to PDF or exports CSV (opens in Excel). |
| Excel import | In *Record*, **Import attendance from Excel** reads a professor's .xlsx / .xls / .csv sheet: one names column plus one column per lecture date (like the department's paper form). Codes: غ / A / x = absent, ع / E = excused, ت / L = late, empty / ✓ / 1 = present. Hours may follow a date in brackets, e.g. `05/10/2026 (2)`. Names are matched to the stage list (tolerating hamza/taa-marbuta differences and shortened names) or by student ID, and a preview shows dates, matches, unmatched names and how each cell value was read before anything is saved. **Excel template** downloads a ready sheet with the stage's students and every lecture date of the term from the course's timetable day. Student lists can also be imported from Excel in the *Students* tab. |
| Backup | Export / import JSON backup (share via WhatsApp, email…). Backups from several lecturers can be merged on one device. |

---

## 2. Installing on phones

The app must be served over **HTTPS** (a requirement of phones for installable apps). The simplest free host is GitHub Pages:

1. Create a free account at github.com and a new **public** repository, e.g. `attendance`.
2. Upload the whole contents of this folder (`index.html`, `sw.js`, `manifest.webmanifest`, and the folders `css`, `js`, `icons`, `logos`).
3. In the repository: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save**.
4. After a minute the app is live at `https://<your-user>.github.io/attendance/`. Share that link with the lecturers.

Any other static host works too (Netlify Drop, Cloudflare Pages, the university web server).

**Android (Chrome):** open the link → menu ⋮ → *Install app* (or *Add to Home screen*).
**iPhone / iPad (Safari):** open the link → Share button → *Add to Home Screen*.

The app then opens full-screen from its icon and works without internet. Data is stored on the device.

### Android app (APK)
A native Android package is built from this same code in the sibling folder `wre-attendance-android` (Capacitor 6). Rebuild after any change with:
```
powershell -ExecutionPolicy Bypass -File scripts\build-apk.ps1
```
The signed APK appears in `wre-attendance-android\dist\`. Send it by WhatsApp, Telegram or email; on the phone tap it and allow *Install unknown apps* once. Keep the `keys\` folder safe and private: every future update must be signed with the same key, or phones will refuse to install it over the old version.
Inside the Android app, Print / Export / Send use Android's share sheet (WhatsApp, Gmail, Drive…); printed reports are shared as an HTML file that opens in Chrome for *Print → Save as PDF*.

### iPhone / iPad
Use the Safari home-screen install above. A native iOS app needs a Mac with Xcode and a paid Apple Developer account, so it is not built here.

### Updating the app
Replace the changed files on the host and bump `CACHE_VERSION` in `sw.js` (e.g. `v1.0.1`). The service worker is network-first, so phones get the new version the next time they open the app while online, and the cached copy only when offline.

---

## 3. Adapting the app to another department

Only two files need editing:

### `js/config.js` — names, logos, rules
```js
institution: {
  university: ['الجامعة المستنصرية', 'Mustansiriyah University'],
  college:    ['كلية الهندسة', 'College of Engineering'],
  department: ['قسم هندسة الموارد المائية', 'Department of Water Resources Engineering'],
  headTitle:  ['رئيس قسم هندسة الموارد المائية', 'Head of the Water Resources Engineering Department'],
},
logos: { university: 'logos/university.png', college: 'logos/college.png', department: 'logos/department.svg' },
rules: { warn1: 5, warn2: 8, failUnexcused: 10, failTotal: 15, weeksPerTerm: 15 },
stages: 4,
```
Put the new logo files in `/logos` (PNG or SVG with transparent background). If a file named `logos/department.png` exists it is used automatically in place of the SVG.
Change `appId` so the new department's data is stored separately from this one.

### `js/data.js` — preloaded year, stages, students and courses
This file is plain JSON. You can edit it by hand or regenerate it. Structure:
```js
window.WRE_SEED = {
  years:    [{ id: '2026-2027', name: '2026-2027', start: '2026-09-20', end: '2027-05-13',
               terms: [{ id: 't1', start: '2026-09-20', end: '2026-12-31', weeks: 15 },
                       { id: 't2', start: '2027-01-31', end: '2027-05-13', weeks: 15 }],
               events: [{ nameAr: 'العطلة الربيعية', nameEn: 'Spring break', start: '2027-01-17', end: '2027-01-30' }] }],
  groups:   [{ id: 'g4A', yearId: '2026-2027', stage: 4, system: 'bologna', section: 'A', nameAr: '...', nameEn: '...' }],
  students: [{ id: 's_g4A_1', groupId: 'g4A', name: 'اسم الطالب', sid: '', note: '' }],
  courses:  [{ id: 'c_g4A_1', yearId: '2026-2027', termId: 't1', groupId: 'g4A', nameAr: '...', nameEn: '...',
               lecturer: '...', type: 'T', weeklyHours: 2, schedule: 'الأحد 8:30-10:30', room: 'ق3' }]
};
```
`type` is `T` theory, `U` tutorial, `P` practical, `X` other.
Everything in this file can also be changed later inside the app (Students, Courses and Settings tabs), and a new academic year can be created in-app with one tap that copies stages, students and courses forward.

### Access code (`js/config.js` → `access`)
The app opens only after the department access code is entered. The code itself is not stored anywhere; only its SHA-256 hash is in `config.js`. The head of department keeps the codes and gives the lecturer code to authorized staff. To change a code:
```
python -c "import hashlib;print(hashlib.sha256(b'NEW-CODE').hexdigest())"
```
Paste the printed hash into `access.codeHash`, upload the file and bump `CACHE_VERSION` in `sw.js`. `rememberDays` controls how long a device stays unlocked (0 = ask at every launch). *Settings → Lock the app now* locks a device immediately.
Note: this is a client-side lock suitable for keeping casual users out; it does not encrypt the data on the phone.

### Master account and report recipients
There are two codes: the **lecturer code** (`access.codeHash`) and the **master code** (`access.masterHash`) for the head of department. Signing in with the master code unlocks *Settings → Report administration*, where the head defines who receives absence reports: the head, an absence committee, or any authorized person, each with email and WhatsApp number. Default recipients can also be preset in `config.js → recipients` so that every lecturer's phone starts with the same list.
In *Reports*, the **Send report** button shares the memo (HTML) and its CSV through the phone's share sheet (WhatsApp, Mail…) addressed to those recipients; on a computer it downloads both files and opens the mail app with the recipients and a summary filled in.

### Other files
* `js/i18n.js` — every interface and report sentence, Arabic first, English second.
* `css/app.css` — colours (`:root` variables) and print layout.
* `icons/` — home-screen icons (192, 512, maskable, Apple touch).

---

## 4. How absence is calculated

* Planned hours of a course in a term = weekly hours × weeks of the term (15 by default).
* Unexcused % = unexcused absent hours ÷ planned hours. Total % adds excused hours.
* Status: *within limit* → *1st warning* (≥ 5 %) → *final warning* (≥ 8 %) → *failed by absence* (> 10 % unexcused or > 15 % total).
* In the periodic memo, "absence days" counts distinct dates the student missed any lecture in the period, while percentages are always cumulative for the term, because the regulation applies per course per term.

---

## 5. Sharing data between lecturers

Each phone keeps its own data. Lecturers export a backup (Settings → Export backup) and send it to the coordinator, who imports it with *Merge*. Merging keeps every lecture from every file; if the same lecture exists in two files the newer version wins. The coordinator can then print department-wide memos.

A shared online database can be added later if the department wants live sync; the data model is already keyed by stable ids to make that straightforward.
