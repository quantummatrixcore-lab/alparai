import fs from "fs";
import path from "path";

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx")) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles("src", []);
let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  let modified = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(:\s*any\b|as\s+any\b)/.test(line)) {
      if (i === 0 || !lines[i - 1].includes("eslint-disable-next-line @typescript-eslint/no-explicit-any")) {
        const match = line.match(/^\s*/);
        const indent = match ? match[0] : "";
        lines.splice(i, 0, `${indent}// eslint-disable-next-line @typescript-eslint/no-explicit-any`);
        i++; // skip the newly inserted line
        modified = true;
        modifiedCount++;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(file, lines.join("\n"), "utf8");
  }
}

console.log(`Allowlisted ${modifiedCount} 'any' occurrences using Regex engine.`);
