import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("./google-sheets-container-sync.gs", import.meta.url), "utf8");
const requests = [];

function makeCell(value) {
  return {
    getDisplayValue: () => value,
    setNote: () => {},
  };
}

const context = {
  console,
  Date,
  JSON,
  Object,
  String,
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: () => "a".repeat(64),
      setProperty: () => {},
    }),
  },
  UrlFetchApp: {
    fetch: (url, options) => {
      requests.push({ url, options, payload: JSON.parse(options.payload) });
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ ok: true, changed: true }),
      };
    },
  },
  SpreadsheetApp: {
    getActive: () => ({ toast: () => {} }),
  },
};

vm.createContext(context);
vm.runInContext(source, context);

const cases = [
  { name: "شراء محمد التكريتي", mapping: { vin: 3, booking: 14, container: 15 } },
  { name: "شراء عزوز", mapping: { vin: 3, booking: 14, container: 15 } },
  { name: "شراء خليل", mapping: { vin: 3, booking: 13, container: 14 } },
];

for (const testCase of cases) {
  const values = new Map([
    [testCase.mapping.vin, " KNDJ33AU8S7256363 "],
    [testCase.mapping.booking, "10254522"],
    [testCase.mapping.container, "CAAU8757303"],
  ]);
  const sheet = {
    getRange: (_row, column) => makeCell(values.get(column) || ""),
  };

  const result = context.syncGoldenFrondRow_(sheet, 2, testCase.mapping, false);
  assert.equal(result.category, "synced", testCase.name);
}

assert.equal(requests.length, 3);
for (const request of requests) {
  assert.equal(request.url, "https://golden-frond.replit.app/api/integrations/google-sheets/container-sync");
  assert.equal(request.options.headers["x-sheet-sync-key"], "a".repeat(64));
  assert.deepEqual(request.payload, {
    vin: "KNDJ33AU8S7256363",
    bookingNumber: "10254522",
    containerNumber: "CAAU8757303",
  });
}

console.log("Google Sheets sync tests passed for all three sheet mappings.");
