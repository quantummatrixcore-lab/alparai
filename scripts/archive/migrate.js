const fs = require("fs");

const files = [
  "src/app/[locale]/admin/ai-hub/autopilot/analytics/page.tsx",
  "src/app/[locale]/admin/ai-hub/autopilot/page.tsx",
  "src/app/[locale]/admin/ai-hub/jules/page.tsx",
  "src/app/[locale]/admin/ai-hub/orchestrator/page.tsx",
  "src/app/[locale]/admin/analytics-hub/analysis/page.tsx",
  "src/app/[locale]/admin/analytics-hub/expert-analysis/page.tsx",
  "src/app/[locale]/admin/analytics-hub/k-benchmark/page.tsx",
  "src/app/[locale]/admin/metrics-hub/api-metrics/page.tsx",
  "src/app/[locale]/admin/metrics-hub/signals/page.tsx",
  "src/app/[locale]/admin/metrics-hub/slo-dashboard/page.tsx",
  "src/app/[locale]/admin/cross-audit-dashboard/page.tsx",
  "src/app/[locale]/admin/innovations/page.tsx",
  "src/app/[locale]/admin/geo/page.tsx",
];

files.forEach((f) => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, "utf8");
  let replaced = false;

  // Pattern 1: The standard two divs wrapper
  const wrapperRegex1 =
    /<div className=\"min-h-screen bg-\[\#070709\] px-3 py-4 text-zinc-100 sm:px-6 sm:py-6 md:p-8\">\s*<div className=\"(?:animate-in fade-in )?(?:space-y-[0-8]+ )?rounded-3xl bg-zinc-900\/40 p-4 shadow-2xl ring-1 ring-white\/10 backdrop-blur-xl (?:duration-500 )?sm:p-6 md:p-8\">/g;

  // Pattern 2: Existing <AdminContainer> that lacks shell
  const wrapperRegex2 = /<AdminContainer>/g;

  if (wrapperRegex1.test(c)) {
    c = c.replace(wrapperRegex1, "<AdminContainer shell>");

    // Replace the closing divs. This handles optional metadata exports at the end.
    c = c.replace(
      /<\/div>\s*<\/div>\s*\);\s*\}\s*(export const metadata[\s\S]*)?$/,
      "</AdminContainer>\n  );\n}\n\n$1",
    );
    replaced = true;
  } else if (wrapperRegex2.test(c)) {
    c = c.replace(wrapperRegex2, "<AdminContainer shell>");
    replaced = true;
  }

  // Handle nested <AdminContainer> (like in signals/page.tsx)
  if (c.includes("<AdminContainer shell>") && c.includes("<AdminContainer>")) {
    c = c.replace("<AdminContainer>", "");
    c = c.replace(/<\/AdminContainer>\s*<\/AdminContainer>/, "</AdminContainer>");
  }

  if (replaced) {
    if (c.includes("@/components/admin/admin-design-kit") && !c.includes("AdminContainer")) {
      c = c.replace(
        /\} from \"@\/components\/admin\/admin-design-kit\";/,
        ', AdminContainer } from "@/components/admin/admin-design-kit";',
      );
    } else if (
      !c.includes("AdminContainer") ||
      !c.includes("@/components/admin/admin-design-kit")
    ) {
      c = 'import { AdminContainer } from "@/components/admin/admin-design-kit";\n' + c;
    }

    c = c.replace(/\nundefined/, ""); // cleanup metadata glitch
    fs.writeFileSync(f, c);
    console.log("Updated " + f);
  }
});
