const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "..", "dehost", "migrations", "0001_full_schema.sql");
const content = fs.readFileSync(schemaPath, "utf-8");
const lines = content.split("\n");

const tableReasonMap = {
  user_reputation: "runtime insert inside stored function adjust_user_reputation_rpc",
  reputation_logs: "audit log insert inside stored function adjust_user_reputation_rpc",
  sybil_detection_logs: "security detection log insert inside stored function evaluate_sybil_risk_rpc",
  admin_login_events: "security audit insert inside admin login trigger function",
  platform_stats_cache: "cache population inside platform statistics refresh trigger/function",
  ai_rap_sheet_entries: "tribunal verdict record insert inside resolve_tribunal_case_rpc",
  incidents: "incident creation record inside submit_anonymous_incident RPC",
  submission_attempts: "rate-limit tracking record inside submit_anonymous_incident RPC",
  age_declarations: "legal age compliance record inside submit_anonymous_incident RPC",
  consent_log: "compliance consent tracking record inside submit_anonymous_incident RPC",
  users: "user profile bootstrap insert inside handle_new_user auth trigger",
  email_preferences: "default email preferences insert inside handle_new_user auth trigger",
  platform_statistics: "aggregate statistics record inside platform metric trigger/function",
};

const targetTables = Object.keys(tableReasonMap);
let matchCount = 0;

const newLines = lines.map((line, idx) => {
  for (const tbl of targetTables) {
    const reg = new RegExp(`INSERT\\s+INTO\\s+(?:public\\.)?${tbl}\\b`, "i");
    if (reg.test(line)) {
      matchCount++;
      if (line.includes("-- KEEP:")) {
        return line; // already annotated
      }
      const reason = tableReasonMap[tbl];
      return `${line} -- KEEP: ${reason}`;
    }
  }
  return line;
});

fs.writeFileSync(schemaPath, newLines.join("\n"), "utf-8");
console.log(`SUCCESS: Annotated ${matchCount} INSERT statements in 0001_full_schema.sql`);