const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith(".tsx") || file.endsWith(".ts")) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk("src/app");
let count = 0;
files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("ssr: false")) {
    const newContent = content.replace(/,\s*\{\s*ssr:\s*false\s*\}/g, "");
    if (newContent !== content) {
      console.log("Fixed:", file);
      fs.writeFileSync(file, newContent);
      count++;
    }
  }
});
console.log("Fixed ssr files:", count);
