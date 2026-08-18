const fs = require("fs");
const path = require("path");

const targetDir = path.join(process.cwd(), "src", "components");

const regexMap = [
  // Danger
  { pattern: /\b(text|bg|border|ring|shadow)-(red|rose)-([1-9]00)\b/g, replace: "$1-danger-$3" },
  { pattern: /\bfrom-(red|rose)-([1-9]00)\b/g, replace: "from-danger-$2" },
  { pattern: /\bvia-(red|rose)-([1-9]00)\b/g, replace: "via-danger-$2" },
  { pattern: /\bto-(red|rose)-([1-9]00)\b/g, replace: "to-danger-$2" },

  // Success
  {
    pattern: /\b(text|bg|border|ring|shadow)-(emerald|green)-([1-9]00)\b/g,
    replace: "$1-success-$3",
  },
  { pattern: /\bfrom-(emerald|green)-([1-9]00)\b/g, replace: "from-success-$2" },
  { pattern: /\bvia-(emerald|green)-([1-9]00)\b/g, replace: "via-success-$2" },
  { pattern: /\bto-(emerald|green)-([1-9]00)\b/g, replace: "to-success-$2" },

  // Warning
  {
    pattern: /\b(text|bg|border|ring|shadow)-(amber|yellow|orange)-([1-9]00)\b/g,
    replace: "$1-warning-$3",
  },
  { pattern: /\bfrom-(amber|yellow|orange)-([1-9]00)\b/g, replace: "from-warning-$2" },
  { pattern: /\bvia-(amber|yellow|orange)-([1-9]00)\b/g, replace: "via-warning-$2" },
  { pattern: /\bto-(amber|yellow|orange)-([1-9]00)\b/g, replace: "to-warning-$2" },

  // Brand
  {
    pattern: /\b(text|bg|border|ring|shadow)-(blue|indigo|violet|purple)-([1-9]00)\b/g,
    replace: "$1-brand-$3",
  },
  { pattern: /\bfrom-(blue|indigo|violet|purple)-([1-9]00)\b/g, replace: "from-brand-$2" },
  { pattern: /\bvia-(blue|indigo|violet|purple)-([1-9]00)\b/g, replace: "via-brand-$2" },
  { pattern: /\bto-(blue|indigo|violet|purple)-([1-9]00)\b/g, replace: "to-brand-$2" },

  // Accent
  { pattern: /\b(text|bg|border|ring|shadow)-(cyan|teal)-([1-9]00)\b/g, replace: "$1-accent-$3" },

  // Gray -> semantic
  { pattern: /\btext-(slate|gray|zinc)-400\b/g, replace: "text-fg-muted" },
  { pattern: /\btext-(slate|gray|zinc)-500\b/g, replace: "text-fg-disabled" },
  { pattern: /\btext-(slate|gray|zinc)-300\b/g, replace: "text-fg-secondary" },
  { pattern: /\bbg-(slate|gray|zinc)-900\b/g, replace: "bg-bg-elevated" },
  { pattern: /\bbg-(slate|gray|zinc)-950\b/g, replace: "bg-bg-tertiary" },
  { pattern: /\bborder-(slate|gray|zinc)-800\b/g, replace: "border-border-subtle" },
  { pattern: /\bborder-(slate|gray|zinc)-700\b/g, replace: "border-border-strong" },
];

let changedFiles = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");
      let originalContent = content;

      for (const { pattern, replace } of regexMap) {
        content = content.replace(pattern, replace);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, "utf8");
        changedFiles++;
      }
    }
  }
}

scanDir(targetDir);
console.log("Total files updated: " + changedFiles);
