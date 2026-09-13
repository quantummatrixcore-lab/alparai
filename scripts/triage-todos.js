import fs from "fs";
import path from "path";

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".md") || file.endsWith(".css")) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const dirsToScan = ["src", "scripts", "dehost", "tests"];
let files = [];
for (const dir of dirsToScan) {
  if (fs.existsSync(dir)) {
    files = files.concat(getAllFiles(dir, []));
  }
}

let modifiedCount = 0;
let occurrenceCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  if (content.includes("PENDING_ISSUE")) {
    const updatedContent = content.replace(/PENDING_ISSUE/g, "PENDING_ISSUE");
    if (content !== updatedContent) {
      fs.writeFileSync(file, updatedContent, "utf8");
      modifiedCount++;
      occurrenceCount += (content.match(/PENDING_ISSUE/g) || []).length;
    }
  }
}

console.log(`Replaced ${occurrenceCount} PENDING_ISSUEs across ${modifiedCount} files.`);
