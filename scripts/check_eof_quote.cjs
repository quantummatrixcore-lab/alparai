"use strict";
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "..", "dehost", "migrations", "0003_seeds.sql"), "utf8");
let inQuote = false;
let inLineComment = false;
let inBlockComment = false;
for (let i = 0; i < src.length; i++) {
  const ch = src[i];
  const next = src[i + 1];
  if (ch === "\n") { inLineComment = false; continue; }
  if (inLineComment) continue;
  if (inBlockComment) {
    if (ch === "*" && next === "/") { inBlockComment = false; i++; }
    continue;
  }
  if (inQuote) {
    if (ch === "'") {
      if (next === "'") { i++; continue; }
      inQuote = false;
    }
    continue;
  }
  if (ch === "-" && next === "-") { inLineComment = true; i++; continue; }
  if (ch === "/" && next === "*") { inBlockComment = true; i++; continue; }
  if (ch === "'") inQuote = true;
}
console.log("[EOF_CHECK] inQuote at EOF:", inQuote);
if (inQuote) process.exit(1);
