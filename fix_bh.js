const fs = require("fs");

function applyChange(file, replaceFn) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, "utf8");
  let newContent = replaceFn(content);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log("Fixed", file);
  } else {
    console.log("No change needed or pattern not found in", file);
  }
}

// 1. src/components/incidents/share-buttons.tsx
applyChange("src/components/incidents/share-buttons.tsx", (content) => {
  return content.replace(
    /return `\$\{window\.location\.origin\}\$\{url\}`;/g,
    'const constructed = new URL(url, window.location.origin);\n    constructed.searchParams.set("ref", "alparai_platform");\n    return constructed.toString();',
  );
});

// 2. src/components/feed/feed-card.tsx
applyChange("src/components/feed/feed-card.tsx", (content) => {
  return content.replace(
    /const relativeUrl = `\/incidents\/\$\{incident\.id\}`;/g,
    "const relativeUrl = `/incidents/${incident.id}?ref=alparai_platform`;",
  );
});

// 3. src/components/incidents/incident-card.tsx
applyChange("src/components/incidents/incident-card.tsx", (content) => {
  return content.replace(
    /const relativeUrl = `\/incidents\/\$\{incident\.id\}`;/g,
    "const relativeUrl = `/incidents/${incident.id}?ref=alparai_platform`;",
  );
});

// 4. src/components/layout/footer.tsx
applyChange("src/components/layout/footer.tsx", (content) => {
  return content
    .replace(
      /href="https:\/\/twitter\.com\/ALPAR_AI"/g,
      'href="https://twitter.com/ALPAR_AI?ref=alparai_platform"',
    )
    .replace(
      /href="https:\/\/github\.com\/quantummatrixcore-lab\/alparai-platform"/g,
      'href="https://github.com/quantummatrixcore-lab/alparai-platform?ref=alparai_platform"',
    )
    .replace(
      /href="https:\/\/linkedin\.com\/company\/alpar-ai"/g,
      'href="https://linkedin.com/company/alpar-ai?ref=alparai_platform"',
    );
});

// 5. src/components/marketing/trust-bar.tsx
applyChange("src/components/marketing/trust-bar.tsx", (content) => {
  return content.replace(
    /href: "https:\/\/github\.com\/quantummatrixcore-lab\/alparai-platform",/g,
    'href: "https://github.com/quantummatrixcore-lab/alparai-platform?ref=alparai_platform",',
  );
});

// 6. src/app/[locale]/press-kit/releases/[slug]/page.tsx
applyChange("src/app/[locale]/press-kit/releases/[slug]/page.tsx", (content) => {
  return content
    .replace(
      /url=`\$\{baseUrl\}\$\{locale\}\/press-kit\/releases\/\$\{release\.slug\}`/g,
      "url={`${baseUrl}${locale}/press-kit/releases/${release.slug}?ref=alparai_platform`",
    )
    .replace(
      /url: `\$\{baseUrl\}\$\{locale\}\/press-kit\/releases\/\$\{release\.slug\}`/g,
      "url: `${baseUrl}${locale}/press-kit/releases/${release.slug}?ref=alparai_platform`",
    );
});

// 7. src/app/[locale]/about/page.tsx
applyChange("src/app/[locale]/about/page.tsx", (content) => {
  return content.replace(
    /href="https:\/\/www\.linkedin\.com\/in\/ercument-erden"/g,
    'href="https://www.linkedin.com/in/ercument-erden?ref=alparai_platform"',
  );
});

// 8. src/lib/constants/index.ts
applyChange("src/lib/constants/index.ts", (content) => {
  return content
    .replace(
      /export const GITHUB_URL = "https:\/\/github\.com\/quantummatrixcore-lab\/alparai-platform";/g,
      'export const GITHUB_URL = "https://github.com/quantummatrixcore-lab/alparai-platform?ref=alparai_platform";',
    )
    .replace(
      /export const LINKEDIN_URL = "https:\/\/www\.linkedin\.com\/company\/alpar-ai";/g,
      'export const LINKEDIN_URL = "https://www.linkedin.com/company/alpar-ai?ref=alparai_platform";',
    )
    .replace(
      /export const TWITTER_URL = "https:\/\/twitter\.com\/ALPAR_AI";/g,
      'export const TWITTER_URL = "https://twitter.com/ALPAR_AI?ref=alparai_platform";',
    );
});
