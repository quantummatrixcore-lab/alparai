import fs from "fs";
import path from "path";

function findPageFiles(dir, baseRoute = "/tr/admin") {
  let routes = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      routes = routes.concat(findPageFiles(fullPath, `${baseRoute}/${item.name}`));
    } else if (item.name === "page.tsx" || item.name === "page.jsx") {
      routes.push(baseRoute === "/tr/admin/page.tsx" ? "/tr/admin" : baseRoute.replace(/\/page\.tsx$/, ""));
    }
  }
  return routes;
}

const adminDir = "d:/Alparai/src/app/[locale]/admin";
const allRoutes = findPageFiles(adminDir).map(r => r.replace(/\/page$/, ""));
console.log(`TOTAL ADMIN ROUTES FOUND: ${allRoutes.length}`);
console.log(JSON.stringify(allRoutes, null, 2));
