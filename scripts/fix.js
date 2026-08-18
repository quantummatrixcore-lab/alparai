const fs = require("fs");
const path = require("path");

const iconToLabel = {
  RefreshCw: "Refresh",
  ChevronLeft: "Previous",
  ChevronRight: "Next",
  ExternalLink: "Open link",
  Linkedin: "LinkedIn profile",
  Check: "Approve",
  X: "Close",
  ArrowRight: "Next",
  MessageSquare: "Comment",
  Cpu: "Process",
  Eye: "View",
  Code: "Source code",
  Send: "Send",
  UserCog: "Promote",
  Mail: "Email",
  Plus: "Add",
  Loader2: "Loading",
  Flag: "Report",
};

function fixFile(file) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;

  // Fix <button>...</button> and <a>...</a>
  const tagRegex = /<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  content = content.replace(tagRegex, (match, tag, props, inner) => {
    if (!props.includes("aria-label") && !props.includes("aria-labelledby")) {
      const textContent = inner.replace(/<[^>]*>/g, "").trim();
      if (textContent === "") {
        const iconMatch = inner.match(/<([A-Z][a-zA-Z0-9]+)\b/);
        const iconName = iconMatch ? iconMatch[1] : "Action";
        const label = iconToLabel[iconName] || iconName;
        changed = true;
        return `<${tag}${props} aria-label="${label}">${inner}</${tag}>`;
      }
    }
    return match;
  });

  // Fix self-closing <Button ... />
  const selfClosingRegex = /<Button\b([^>]*)\/>/g;
  content = content.replace(selfClosingRegex, (match, props) => {
    if (
      !props.includes("aria-label") &&
      !props.includes("aria-labelledby") &&
      !props.includes("children=")
    ) {
      const iconMatch = props.match(/<([A-Z][a-zA-Z0-9]+)\b/);
      const iconName = iconMatch ? iconMatch[1] : "Action";
      const label = iconToLabel[iconName] || iconName;
      changed = true;
      return `<Button${props} aria-label="${label}" />`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, "utf8");
    console.log("Fixed:", file);
  }
}

function walk(dir) {
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      walk(file);
    } else if (file.endsWith(".tsx")) {
      fixFile(file);
    }
  });
}

walk(path.join(__dirname, "src", "components"));
