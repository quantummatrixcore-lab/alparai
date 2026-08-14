const fs = require('fs');
const path = require('path');

const srcDir = path.join('D:', 'Alparai', 'src');
const appDir = path.join(srcDir, 'app');

// 1. Gather all actual routes from src/app
function getRoutes(dir, baseRoute = '') {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
        // Route group, does not affect URL
        routes = routes.concat(getRoutes(fullPath, baseRoute));
      } else if (entry.name === '[locale]') {
        // Locale param
        routes = routes.concat(getRoutes(fullPath, ''));
      } else {
        routes = routes.concat(getRoutes(fullPath, `${baseRoute}/${entry.name}`));
      }
    } else if (entry.isFile() && (entry.name === 'page.tsx' || entry.name === 'page.ts' || entry.name === 'route.ts' || entry.name === 'route.tsx')) {
      routes.push({
        url: baseRoute || '/',
        file: fullPath,
        type: entry.name.startsWith('page') ? 'page' : 'api'
      });
    }
  }
  return routes;
}

const existingRoutes = getRoutes(appDir);
console.log(`Total existing routes/pages found: ${existingRoutes.length}`);

// 2. Find all internal links in src/
function getAllFiles(dir, exts = ['.tsx', '.ts', '.jsx', '.js']) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        files = files.concat(getAllFiles(fullPath, exts));
      }
    } else if (entry.isFile() && exts.some(e => entry.name.endsWith(e))) {
      files.push(fullPath);
    }
  }
  return files;
}

const allFiles = getAllFiles(srcDir);
console.log(`Total source files scanned: ${allFiles.length}`);

const linkRegexes = [
  /href=["'](\/[^"'#?]*)/g,
  /href=\{`(\/[^`$#?]*)`/g,
  /router\.push\(["'](\/[^"'#?]*)/g,
  /router\.push\(\{[\s\S]*?pathname:\s*["'](\/[^"'#?]*)/g,
  /redirect\(["'](\/[^"'#?]*)/g
];

const foundLinks = new Map();

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const regex of linkRegexes) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      let link = match[1];
      // strip query / hash if any
      link = link.split('?')[0].split('#')[0];
      // ignore empty or external or api links if not route
      if (!foundLinks.has(link)) {
        foundLinks.set(link, []);
      }
      foundLinks.get(link).push(file);
    }
  }
}

console.log(`Unique internal links extracted: ${foundLinks.size}`);

// Match links against routes
function matchRoute(link, routes) {
  // Normalize link: remove trailing slash
  if (link.length > 1 && link.endsWith('/')) {
    link = link.slice(0, -1);
  }
  if (link === '' || link === '/') return true;

  // Check static matches
  for (const r of routes) {
    let routeUrl = r.url;
    if (routeUrl.length > 1 && routeUrl.endsWith('/')) {
      routeUrl = routeUrl.slice(0, -1);
    }
    if (routeUrl === link) return true;

    // Check dynamic routes like /incidents/[id] or /admin/experts/[id] or /blog/[slug]
    const routeParts = routeUrl.split('/').filter(Boolean);
    const linkParts = link.split('/').filter(Boolean);

    if (routeParts.length === linkParts.length) {
      let match = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith('[') && routeParts[i].endsWith(']')) {
          continue; // dynamic param matches any segment
        }
        if (routeParts[i] !== linkParts[i]) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }

    // Catch-all [[...slug]] or [...slug]
    if (routeUrl.includes('[...')) {
      const prefix = routeUrl.split('/[...')[0];
      if (link.startsWith(prefix)) return true;
    }
    if (routeUrl.includes('[[...')) {
      const prefix = routeUrl.split('/[[...')[0];
      if (link.startsWith(prefix) || link === prefix) return true;
    }
  }
  return false;
}

const brokenLinks = [];
for (const [link, files] of foundLinks.entries()) {
  // Check if link is an asset like /logo.svg, /favicon.ico, /images/*, /fonts/*
  if (link.startsWith('/_next') || link.endsWith('.svg') || link.endsWith('.png') || link.endsWith('.ico') || link.endsWith('.jpg') || link.endsWith('.webp') || link.endsWith('.xml') || link.endsWith('.txt') || link.endsWith('.json')) {
    continue;
  }
  // Check if it's api route
  if (link.startsWith('/api/')) {
    // Check if api route file exists
    const matched = matchRoute(link, existingRoutes);
    if (!matched) {
      brokenLinks.push({ link, files, isApi: true });
    }
    continue;
  }

  const isMatched = matchRoute(link, existingRoutes);
  if (!isMatched) {
    brokenLinks.push({ link, files, isApi: false });
  }
}

console.log('\n--- POTENTIAL BROKEN LINKS / UNMATCHED ROUTES ---');
console.log(JSON.stringify(brokenLinks, null, 2));
