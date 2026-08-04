import fs from "fs";
import path from "path";

export interface CodebaseHygieneResult {
  success: boolean;
  strayFilesCount: number;
  archiveDirExists: boolean;
  timestamp: string;
}

export function checkCodebaseHygiene(): CodebaseHygieneResult {
  const docsDir = path.join(process.cwd(), "docs");
  const archiveDir = path.join(docsDir, "ARCHIVE");

  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }

  const rootFiles = fs.readdirSync(process.cwd());
  const strayFiles = rootFiles.filter(
    (f) => (f.endsWith(".tmp") || f.endsWith(".bak") || f.endsWith(".swp")) && !f.startsWith("."),
  );

  return {
    success: true,
    strayFilesCount: strayFiles.length,
    archiveDirExists: fs.existsSync(archiveDir),
    timestamp: new Date().toISOString(),
  };
}

if (process.argv[1] && process.argv[1].endsWith("codebase-hygiene.ts")) {
  const report = checkCodebaseHygiene();
  console.log(JSON.stringify(report, null, 2));
}
