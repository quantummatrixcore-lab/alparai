const fs = require("fs");

function fixFile(path, search, replace) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, "utf8");
  content = content.replace(search, replace);
  fs.writeFileSync(path, content, "utf8");
  console.log("Fixed", path);
}

// press-kit/releases/[slug]/page.tsx
fixFile(
  "src/app/[locale]/press-kit/releases/[slug]/page.tsx",
  /if \(!release\) notFound\(\);/g,
  "if (!release) { notFound(); return null; }",
);

// profile/page.tsx
fixFile(
  "src/app/[locale]/profile/page.tsx",
  /if \(!user\) redirect\(`\/\$\{locale\}\/auth\/signin\?next=\/\$\{locale\}\/profile`\);/g,
  "if (!user) { redirect(`/${locale}/auth/signin?next=/${locale}/profile`); return null; }",
);

// ratings/[modelSlug]/history/page.tsx
fixFile(
  "src/app/[locale]/ratings/[modelSlug]/history/page.tsx",
  /if \(!model\) notFound\(\);/g,
  "if (!model) { notFound(); return null; }",
);

// settings/page.tsx
fixFile(
  "src/app/[locale]/settings/page.tsx",
  /if \(!user\) redirect\(`\/\$\{locale\}\/auth\/signin\?next=\/\$\{locale\}\/settings`\);/g,
  "if (!user) { redirect(`/${locale}/auth/signin?next=/${locale}/settings`); return null; }",
);

// suggestions/[id]/page.tsx
fixFile(
  "src/app/[locale]/suggestions/[id]/page.tsx",
  /if \(!suggestion\) notFound\(\);/g,
  "if (!suggestion) { notFound(); return null; }",
);
