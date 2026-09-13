"use strict";
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dehost", "migrations", "0003_seeds.sql");
const src = fs.readFileSync(file, "utf8");

let inQuote = false;
let inLineComment = false;
let inBlockComment = false;
let quoteStartLine = 0;
let lineNum = 1;
const unclosedSpans = [];

for (let i = 0; i < src.length; i++) {
  const ch = src[i];
  const next = src[i + 1];

  if (ch === "\n") {
    lineNum++;
    inLineComment = false;
    if (inQuote && lineNum - quoteStartLine > 20) {
      unclosedSpans.push({ start: quoteStartLine, end: lineNum, text: src.slice(Math.max(0, i - 100), i).trim() });
      inQuote = false; // reset to catch next
    }
    continue;
  }

  if (inLineComment) continue;

  if (inBlockComment) {
    if (ch === "*" && next === "/") {
      inBlockComment = false;
      i++;
    }
    continue;
  }

  if (inQuote) {
    if (ch === "'") {
      if (next === "'") {
        i++; // escaped quote ''
        continue;
      }
      inQuote = false;
    }
    continue;
  }

  if (ch === "-" && next === "-") {
    inLineComment = true;
    i++;
    continue;
  }
  if (ch === "/" && next === "*") {
    inBlockComment = true;
    i++;
    continue;
  }
  if (ch === "'") {
    inQuote = true;
    quoteStartLine = lineNum;
  }
}

console.log("Unclosed spans (>20 lines):", unclosedSpans.length);
unclosedSpans.forEach(s => {
  console.log(`Span started at line ${s.start}, exceeded 20 lines by ${s.end}`);
});
