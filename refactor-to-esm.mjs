import fs from 'fs';
import path from 'path';

const scriptsDir = './scripts';

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.js') && file !== 'refactor-to-esm.mjs') {
      let content = fs.readFileSync(filePath, 'utf8');
      const original = content;

      // require('dotenv').config()
      content = content.replace(/require\(['"]dotenv['"]\)\.config\(\);?/g, "import 'dotenv/config';");

      // const { X } = require('Y')
      content = content.replace(/(?:const|let|var)\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g, "import { $1 } from '$2';");

      // const X = require('Y')
      content = content.replace(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, "import $1 from '$2';");

      // X = require('Y') where X is already declared or global
      content = content.replace(/^([a-zA-Z0-9_]+)\s*=\s*require\(['"]([^'"]+)['"]\);?/gm, "import $1 from '$2';");
      
      // module.exports = X
      content = content.replace(/module\.exports\s*=\s*/g, "export default ");

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Converted ${filePath}`);
      }
    }
  }
}

processDir(scriptsDir);
