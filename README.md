# Student Attendance App — نظام تسجيل غيابات الطلبة (v2.4)

Attendance and absence-reporting app for an undergraduate department, prepared for the Department of Water
Resources Engineering, College of Engineering, Mustansiriyah University. Every department-specific value
lives in one file, so any department can reuse it.

**Owner and designer / مالك التطبيق ومصممه:** Dr. Sabah H. Fartosy — د. صباح حسن الفرطوسي
dr.sabah77@uomustansiriyah.edu.iq · +9647733819837

Live web version (Chrome, Safari, Edge): https://hamfee77-max.github.io/attendance/

## How it works

Three levels: **system administrator** (everything), **head of department / delegate** (lecturers' accounts and
passwords, receiving reports, editing absences any time, committee-signed reports), **lecturer** (own courses only;
may edit a lecture within 72 hours of recording it). Lecturers get an alert for scheduled lectures not recorded,
and the head gets a "Not received" report of lectures whose absences did not arrive.

1. **Lecturers** sign in with their own name and password and see only the courses assigned to them.
   They record attendance (or import it from Excel) and send **absences-only** reports, with a data file,
   to the absence follow-up committee.
2. **The committee** imports the lecturers' files and issues the **final report**, which ends with the names
   and signatures of the committee chair and two members, addressed to the Head of Department.
3. **The head of department** (or a delegate) manages everything within the department: lecturers' accounts and
   passwords, stages, students, courses, years, the committee and report recipients. Only **the system
   administrator** changes the app's own details (names, logos, rules, settings) to fit another department and
   manages administrator accounts, and publishes `js/department.js` so every device updates.

Courses are either **Bologna (semester)** — one term, planned hours = weekly hours × 15 — or
**annual (whole year)** — both terms, planned hours = weekly hours × 30. Each system has its own absence rules:
Bologna follows chapter 4 of the Bologna Process Adoption Guide 2025/2026 (alert at 7 % = one week, final warning
at 14 %, fail above 14 % unexcused or 21 % with an approved excuse); annual follows Article 9 of Examination
Instructions No. 134 of 2000 (fail above 10 % unexcused or 15 % with an excuse).

## Files

| File | Purpose |
|---|---|
| `js/department.js` | Everything about the department: names, logos, rules, committee, recipients, **accounts** (PBKDF2 password hashes only) and lists. Exported from Settings → Administration. |
| `js/config.js` | Defaults: app id, owner, bootstrap master hash, working days. |
| `js/i18n.js` | All Arabic/English texts. |
| `js/store.js`, `auth.js`, `names.js`, `reports.js`, `excel.js`, `ui.js` | App logic. |
| `help.html`, `admin.html`, `publish-guide.html`, `privacy.html` | User guide, administrator guide, store publishing guide, privacy policy (Arabic/English). |
| `download/WRE-Attendance.apk` | Android app offered in Settings. |

## Publishing changes

Replace `js/department.js` with the file exported from the app (or edit code), bump `CACHE_VERSION` in
`sw.js` when code changes, then double-click `publish-attendance.bat` (pushes to GitHub Pages).
Devices load the new version the next time they open the app online.

## Report storage (optional)

The system administrator can choose where lecturers' absences and reports are stored (Department setup →
Report storage): **Google Drive** (`server/Code.gs`, a Google Apps Script web app in the department's Google
account), the **college data centre** or **another data centre** (`server/attendance-api.php`, PHP 7.4+ with
SQLite over HTTPS). All use the same protocol: each account sends with a private key derived from its password
(only its SHA-256 hash, `keyHash`, is published); lecturers may send only their courses and cannot change a
lecture 72 h after it first reached the server; the head pulls everything automatically. Set-up steps are in
`admin.html` (section 13).

## Native apps

The Android and iPhone projects live in the sibling folder `wre-attendance-android` (Capacitor 8,
target API 36). `scripts\build-apk.ps1` builds the signed APK and AAB into `dist\` and copies the APK here.
The iPhone project (`ios\`) must be built on a Mac with Xcode; see `publish-guide.html`.
Keep `wre-attendance-android\keys\` safe: every Android update must be signed with that key.

## New department

Copy this folder, change `appId` in `js/config.js`, replace `js/department.js` with `window.DEPT = {};`,
publish, sign in with the bootstrap “Head of Department” account and use Settings → Administration →
Department setup. Details in `admin.html`.
