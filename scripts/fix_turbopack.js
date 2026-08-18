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

const files = walk("src");
let count = 0;
files.forEach((file) => {
  const content = fs.readFileSync(file, "utf8");
  if (
    /useState|useEffect|useRef|useRouter|usePathname|useSearchParams|useCallback|useMemo|useContext/.test(
      content,
    ) &&
    !content.includes('"use client"') &&
    !content.includes("\x27use client\x27") &&
    !file.includes("src\\\\actions") &&
    !file.includes("src/actions")
  ) {
    console.log("Fixing:", file);
    fs.writeFileSync(file, '"use client";\n\n' + content);
    count++;
  }
});
console.log("Fixed files:", count);
