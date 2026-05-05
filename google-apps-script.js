/*
  ================================================================
  GOOGLE APPS SCRIPT — שמירת לידים מדף הנחיתה לגוגל שיטס
  ================================================================

  הוראות הגדרה (פעם אחת בלבד):
  ─────────────────────────────
  1. פתח את Google Sheets ב:  https://sheets.google.com
     צור גיליון חדש עם השם שתרצה (למשל: "לידים — השקעות בלי חליפות")

  2. בשורה הראשונה (כותרות), הכנס בעמודות A-E:
     A1: שם מלא
     B1: טלפון
     C1: שלב
     D1: תאריך
     E1: שעה

  3. מהתפריט העליון: Extensions → Apps Script
     (או כלים → עורך סקריפטים)

  4. מחק את כל הקוד הקיים, ו-הדבק את הקוד הבא:
  ─────────────────────────────────────────────────
*/

// ← העתק מכאן

const SHEET_NAME = 'Sheet1'; // שנה לשם טאב הגיליון אם שינית אותו

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    sheet.appendRow([
      data.name    || '',
      data.phone   || '',
      data.segment || '',
      data.date    || new Date().toLocaleDateString('he-IL'),
      data.time    || new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }),
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET handler — לבדיקה שהסקריפט פועל
function doGet() {
  return ContentService
    .createTextOutput('Script is running OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

// ← עד כאן

/*
  ─────────────────────────────────────────────────
  5. לחץ Save (Ctrl+S)

  6. לחץ "Deploy" → "New deployment"
     - Type: Web app
     - Execute as: Me
     - Who has access: Anyone
     → לחץ Deploy

  7. העתק את ה-URL שמופיע (נראה כמו:
     https://script.google.com/macros/s/XXXXXXXX/exec)

  8. פתח את קובץ script.js בתיקיית דף הנחיתה.
     שורה 5: שנה את הערך של SHEETS_URL מ:
       'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
     ל-URL שהעתקת:
       'https://script.google.com/macros/s/XXXXXXXX/exec'

  9. שמור את script.js — הטופס מחובר!

  ─────────────────────────────────────────────────
  בדיקה:
  - פתח את דף הנחיתה בדפדפן
  - מלא את הטופס ולחץ שלח
  - פתח את הגיליון בגוגל שיטס — צריכה להופיע שורה חדשה

  שים לב: שינויים בקוד ה-Apps Script דורשים
  Deployment חדש (Deploy → New deployment) — לא עריכה ישירה.
  ─────────────────────────────────────────────────
*/
