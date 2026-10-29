/**
 * Saffet Education — requests from the website into this Google Sheet.
 *
 * Paste this file into Extensions → Apps Script of the spreadsheet, run `setup` once,
 * then deploy as a web app (see google-sheets/README.md). The site posts each request here;
 * the script appends it as a row on the matching sheet.
 *
 *   kind "form" → requests from the ad landing page (/form)
 *   kind "site" → requests from the consultation form on the site (/apply)
 */

const BRAND = "#0a79c2";
const HEADER_TEXT = "#ffffff";
const ZEBRA = "#f4f9fd";

const STATUSES = [
  { name: "Новая", color: "#fff4d6" },
  { name: "В работе", color: "#dcecfb" },
  { name: "Связались", color: "#e6e1fa" },
  { name: "Поступил", color: "#d9f2e3" },
  { name: "Отказ", color: "#f6dcdc" },
];

// One sheet per form: header, key in the posted data, column width in pixels, wrap long text.
const SHEETS = {
  form: {
    name: "Анкеты (реклама)",
    tab: "#ff9e1b",
    columns: [
      ["Дата", "date", 140],
      ["Кто", "role", 140],
      ["ФИО", "name", 200],
      ["Телефон", "phone", 160],
      ["Специальность", "field", 200, true],
      ["Бюджет в год", "budget", 140],
      ["Язык сайта", "locale", 90],
      ["Статус", "status", 120],
      ["Комментарий менеджера", "note", 280, true],
    ],
  },
  site: {
    name: "Заявки с сайта",
    tab: BRAND,
    columns: [
      ["Дата", "date", 140],
      ["Имя", "name", 200],
      ["Телефон", "phone", 160],
      ["Уровень", "level", 130],
      ["Вуз / программа", "interest", 260, true],
      ["Комментарий клиента", "message", 280, true],
      ["Язык сайта", "locale", 90],
      ["Статус", "status", 120],
      ["Комментарий менеджера", "note", 280, true],
    ],
  },
};

/** Adds a "Saffet" menu to the spreadsheet, so the sheets can be re-styled without opening the editor. */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("Saffet").addItem("Оформить листы", "setup").addToUi();
}

/**
 * Creates (or re-styles) both sheets and makes the secret token the site must send.
 * Safe to run again: existing rows stay, only the look is reapplied.
 */
function setup() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(SHEETS).forEach((kind) => styleSheet(book, SHEETS[kind]));

  // The default empty "Лист1" / "Sheet1" is no longer needed.
  book.getSheets().forEach((sheet) => {
    const isOurs = Object.keys(SHEETS).some((k) => SHEETS[k].name === sheet.getName());
    if (!isOurs && sheet.getLastRow() === 0 && book.getSheets().length > 1) book.deleteSheet(sheet);
  });

  const props = PropertiesService.getScriptProperties();
  let token = props.getProperty("TOKEN");
  if (!token) {
    token = Utilities.getUuid().replace(/-/g, "");
    props.setProperty("TOKEN", token);
  }
  Logger.log("SHEETS_TOKEN=" + token);
}

function styleSheet(book, spec) {
  const sheet = book.getSheetByName(spec.name) || book.insertSheet(spec.name);
  const cols = spec.columns.length;
  sheet.setTabColor(spec.tab);

  // A column dropped from `columns` is removed with its data, so the rows below keep lining up with the headers.
  const wanted = spec.columns.map((c) => c[0]);
  if (sheet.getLastColumn() > 0) {
    const current = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i] !== "" && !wanted.includes(current[i])) sheet.deleteColumn(i + 1);
    }
  }
  if (sheet.getMaxColumns() > cols) sheet.deleteColumns(cols + 1, sheet.getMaxColumns() - cols);

  const header = sheet.getRange(1, 1, 1, cols);
  header
    .setValues([spec.columns.map((c) => c[0])])
    .setBackground(BRAND)
    .setFontColor(HEADER_TEXT)
    .setFontWeight("bold")
    .setFontSize(11)
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("left")
    .setWrap(true);
  sheet.setRowHeight(1, 40);
  sheet.setFrozenRows(1);

  const body = sheet.getRange(2, 1, sheet.getMaxRows() - 1, cols);
  body.setVerticalAlignment("top").setFontSize(10);
  // Plain text everywhere except the date, so "+7…" phones and "=…" input stay as typed.
  body.setNumberFormat("@");
  spec.columns.forEach(([, key, width, wrap], i) => {
    sheet.setColumnWidth(i + 1, width);
    const column = sheet.getRange(2, i + 1, sheet.getMaxRows() - 1, 1);
    if (key === "date") column.setNumberFormat("dd.mm.yyyy hh:mm");
    column.setWrap(Boolean(wrap));
  });

  const statusCol = spec.columns.findIndex((c) => c[1] === "status") + 1;
  const statusRange = sheet.getRange(2, statusCol, sheet.getMaxRows() - 1, 1);
  statusRange.setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUSES.map((s) => s.name), true).setAllowInvalid(false).build(),
  );

  // Status colours first (they win), then light zebra rows across the whole table.
  const letter = columnLetter(cols);
  const statusLetter = columnLetter(statusCol);
  const rules = STATUSES.map((s) =>
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(s.name).setBackground(s.color).setRanges([statusRange]).build(),
  );
  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(`=AND($A2<>"", ISEVEN(ROW()))`)
      .setBackground(ZEBRA)
      .setRanges([sheet.getRange(`A2:${letter}`)])
      .build(),
  );
  sheet.setConditionalFormatRules(rules);

  if (!sheet.getFilter()) sheet.getRange(`A1:${letter}`).createFilter();
  sheet.getRange(`${statusLetter}1`).setNote("Новая → В работе → Связались → Поступил / Отказ");
}

/** Receives one request from the site: { token, kind: "form" | "site", data: { … } }. */
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply({ ok: false, error: "bad json" });
  }
  if (!body || body.token !== PropertiesService.getScriptProperties().getProperty("TOKEN")) {
    return reply({ ok: false, error: "forbidden" });
  }
  const spec = SHEETS[body.kind];
  if (!spec) return reply({ ok: false, error: "unknown kind" });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    if (!book.getSheetByName(spec.name)) styleSheet(book, spec);
    const sheet = book.getSheetByName(spec.name);
    const data = body.data || {};
    const row = spec.columns.map(([, key]) => {
      if (key === "date") return new Date();
      if (key === "status") return STATUSES[0].name;
      const value = String(data[key] == null ? "" : data[key]).slice(0, 2000);
      // A leading apostrophe keeps "+7…" phones and "=…" text as plain text instead of a number or formula.
      return /^[=+\-@]/.test(value) ? "'" + value : value;
    });
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function columnLetter(n) {
  let s = "";
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}
