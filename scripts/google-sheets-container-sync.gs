/**
 * Golden Frond: Google Sheets -> website container/booking synchronization.
 *
 * Sheet mapping:
 * - شراء محمد التكريتي: VIN=C, booking=N, container=O
 * - شراء عزوز: VIN=C, booking=N, container=O
 * - شراء خليل: VIN=C, booking=M, container=N
 */

const GOLDEN_FROND_SYNC = Object.freeze({
  websiteUrl: "https://golden-frond.replit.app",
  endpoint: "/api/integrations/google-sheets/container-sync",
  firstDataRow: 2,
  sheets: Object.freeze({
    "شراء محمد التكريتي": Object.freeze({ vin: 3, booking: 14, container: 15 }),
    "شراء عزوز": Object.freeze({ vin: 3, booking: 14, container: 15 }),
    "شراء خليل": Object.freeze({ vin: 3, booking: 13, container: 14 }),
  }),
});

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("مزامنة الحاويات")
    .addItem("إدخال مفتاح الربط", "setGoldenFrondSyncSecret")
    .addItem("تثبيت المزامنة التلقائية", "installGoldenFrondSyncTrigger")
    .addSeparator()
    .addItem("مزامنة الصف المحدد", "syncSelectedGoldenFrondRow")
    .addItem("مزامنة جميع الصفوف", "syncAllGoldenFrondRows")
    .addToUi();
}

function setGoldenFrondSyncSecret() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    "مفتاح الربط",
    "أدخل قيمة SHEETS_SYNC_SECRET نفسها الموجودة في Replit Secrets. لا ترسل هذا المفتاح لأي شخص.",
    ui.ButtonSet.OK_CANCEL,
  );
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const secret = response.getResponseText().trim();
  if (secret.length < 32) {
    ui.alert("المفتاح قصير. يجب أن يكون 32 خانة على الأقل.");
    return;
  }

  PropertiesService.getScriptProperties().setProperty("GOLDEN_FROND_SYNC_SECRET", secret);
  ui.alert("تم حفظ مفتاح الربط بأمان داخل إعدادات السكربت.");
}

function installGoldenFrondSyncTrigger() {
  const spreadsheet = SpreadsheetApp.getActive();
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "handleGoldenFrondEdit")
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

  ScriptApp.newTrigger("handleGoldenFrondEdit")
    .forSpreadsheet(spreadsheet)
    .onEdit()
    .create();

  SpreadsheetApp.getUi().alert("تم تفعيل المزامنة التلقائية عند تعديل رقم الشاصي أو الحجز أو الحاوية.");
}

function handleGoldenFrondEdit(event) {
  if (!event || !event.range) return;
  const sheet = event.range.getSheet();
  const mapping = GOLDEN_FROND_SYNC.sheets[sheet.getName()];
  if (!mapping) return;

  const firstRow = Math.max(event.range.getRow(), GOLDEN_FROND_SYNC.firstDataRow);
  const lastRow = event.range.getLastRow();
  if (lastRow < GOLDEN_FROND_SYNC.firstDataRow) return;

  const firstColumn = event.range.getColumn();
  const lastColumn = event.range.getLastColumn();
  const watchedColumns = [mapping.vin, mapping.booking, mapping.container];
  if (!watchedColumns.some((column) => column >= firstColumn && column <= lastColumn)) return;

  for (let row = firstRow; row <= lastRow; row += 1) {
    syncGoldenFrondRow_(sheet, row, mapping, false);
  }
}

function syncSelectedGoldenFrondRow() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const mapping = GOLDEN_FROND_SYNC.sheets[sheet.getName()];
  if (!mapping) {
    SpreadsheetApp.getUi().alert("هذه الصفحة ليست ضمن صفحات الشراء الثلاث المحددة.");
    return;
  }

  const row = SpreadsheetApp.getActiveRange().getRow();
  const result = syncGoldenFrondRow_(sheet, row, mapping, true);
  SpreadsheetApp.getUi().alert(result.message);
}

function syncAllGoldenFrondRows() {
  const spreadsheet = SpreadsheetApp.getActive();
  const summary = { synced: 0, unchanged: 0, skipped: 0, failed: 0 };

  Object.keys(GOLDEN_FROND_SYNC.sheets).forEach((sheetName) => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      summary.failed += 1;
      return;
    }

    const mapping = GOLDEN_FROND_SYNC.sheets[sheetName];
    for (let row = GOLDEN_FROND_SYNC.firstDataRow; row <= sheet.getLastRow(); row += 1) {
      const result = syncGoldenFrondRow_(sheet, row, mapping, false);
      summary[result.category] += 1;
    }
  });

  SpreadsheetApp.getUi().alert(
    `انتهت المزامنة\nتم التحديث: ${summary.synced}\nدون تغيير: ${summary.unchanged}\nصفوف فارغة: ${summary.skipped}\nأخطاء: ${summary.failed}`,
  );
}

function syncGoldenFrondRow_(sheet, row, mapping, addToast) {
  if (row < GOLDEN_FROND_SYNC.firstDataRow) {
    return { category: "skipped", message: "هذا صف عناوين وليس صف سيارة." };
  }

  const vinCell = sheet.getRange(row, mapping.vin);
  const bookingCell = sheet.getRange(row, mapping.booking);
  const containerCell = sheet.getRange(row, mapping.container);
  const vin = normalizeGoldenFrondVin_(vinCell.getDisplayValue());
  const bookingNumber = String(bookingCell.getDisplayValue() || "").trim();
  const containerNumber = String(containerCell.getDisplayValue() || "").trim();

  if (!bookingNumber && !containerNumber) {
    return { category: "skipped", message: "لا يوجد رقم حجز أو حاوية في هذا الصف." };
  }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    const message = `لم تتم المزامنة: رقم الشاصي غير صحيح في الصف ${row}`;
    setGoldenFrondNote_(bookingCell, containerCell, message);
    return { category: "failed", message };
  }

  const secret = PropertiesService.getScriptProperties().getProperty("GOLDEN_FROND_SYNC_SECRET");
  if (!secret) {
    const message = "لم تتم المزامنة: يجب إدخال مفتاح الربط من قائمة مزامنة الحاويات.";
    setGoldenFrondNote_(bookingCell, containerCell, message);
    return { category: "failed", message };
  }

  const payload = { vin };
  if (bookingNumber) payload.bookingNumber = bookingNumber;
  if (containerNumber) payload.containerNumber = containerNumber;

  try {
    const response = UrlFetchApp.fetch(GOLDEN_FROND_SYNC.websiteUrl + GOLDEN_FROND_SYNC.endpoint, {
      method: "post",
      contentType: "application/json",
      headers: { "x-sheet-sync-key": secret },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    const status = response.getResponseCode();
    let body = {};
    try {
      body = JSON.parse(response.getContentText() || "{}");
    } catch (_error) {}

    if (status >= 200 && status < 300 && body.ok) {
      const message = body.changed
        ? `تم تحديث الموقع بنجاح — ${new Date().toLocaleString("ar-JO")}`
        : `الموقع محدث مسبقًا — ${new Date().toLocaleString("ar-JO")}`;
      setGoldenFrondNote_(bookingCell, containerCell, message);
      if (addToast) SpreadsheetApp.getActive().toast(message, "مزامنة الحاويات", 5);
      return { category: body.changed ? "synced" : "unchanged", message };
    }

    const message = `فشلت المزامنة للصف ${row}: ${body.message || `HTTP ${status}`}`;
    setGoldenFrondNote_(bookingCell, containerCell, message);
    return { category: "failed", message };
  } catch (error) {
    const message = `تعذر الاتصال بالموقع للصف ${row}: ${error.message || error}`;
    setGoldenFrondNote_(bookingCell, containerCell, message);
    return { category: "failed", message };
  }
}

function normalizeGoldenFrondVin_(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function setGoldenFrondNote_(bookingCell, containerCell, message) {
  bookingCell.setNote(message);
  containerCell.setNote(message);
}
