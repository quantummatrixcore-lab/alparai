const fs = require("fs");
const pageContent = fs.readFileSync("src/app/[locale]/admin/page.tsx", "utf8");
const sidebarContent = fs.readFileSync("src/components/admin/sidebar.tsx", "utf8");

const pageLinks = [
  ...pageContent.matchAll(
    /href:\s*(?:\x60\/\$\{locale\}\/admin\/([^\x60]+)\x60|'\/admin\/([^']+)'|\"\/admin\/([^"]+)\")/g,
  ),
].map((m) => "/admin/" + (m[1] || m[2] || m[3]));
const sidebarLinks = [...sidebarContent.matchAll(/href:\s*\"\/admin\/([^\"]+)\"/g)].map(
  (m) => "/admin/" + m[1],
);

const pageSet = new Set(pageLinks);
const sidebarSet = new Set(sidebarLinks);

const missingInSidebar = [...pageSet].filter((link) => !sidebarSet.has(link));
const missingInPage = [...sidebarSet].filter((link) => !pageSet.has(link));

console.log("Routes in page.tsx but NOT in sidebar.tsx:", missingInSidebar);
console.log("Routes in sidebar.tsx but NOT in page.tsx:", missingInPage);
