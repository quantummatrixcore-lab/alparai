import fs from 'fs';
import path from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(process.cwd(), dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const adminDir = './src/app/[locale]/admin';
const files = getAllFiles(adminDir);
const enFile = JSON.parse(fs.readFileSync('./messages/en.json', 'utf8'));
const trFile = JSON.parse(fs.readFileSync('./messages/tr.json', 'utf8'));

const keyRegex = /t\(['"`](.*?)['"`]\)/g;
const missingEn = [];
const missingTr = [];

function checkKey(key, obj, namespace) {
  const parts = key.split('.');
  let current = obj;
  if (namespace && current[namespace]) {
     current = current[namespace];
  }
  for (let i = 0; i < parts.length; i++) {
    if (current && typeof current === 'object' && current[parts[i]]) {
      current = current[parts[i]];
    } else {
      return false;
    }
  }
  return true;
}

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  
  // Try to find the namespace from useTranslations("namespace")
  let namespaceMatch = content.match(/useTranslations\(['"`](.*?)['"`]\)/) || content.match(/getTranslations\(\{\s*locale\s*,\s*namespace:\s*['"`](.*?)['"`]\s*\}\)/);
  let namespace = namespaceMatch ? (namespaceMatch[1] || namespaceMatch[2]) : null;

  while ((match = keyRegex.exec(content)) !== null) {
    const key = match[1];
    
    // Check if key contains variables or expressions, skip if dynamic
    if (key.includes('${')) continue;

    if (!checkKey(key, enFile, namespace)) {
      missingEn.push({ file, key, namespace });
    }
    if (!checkKey(key, trFile, namespace)) {
      missingTr.push({ file, key, namespace });
    }
  }
});

console.log("Missing EN:", missingEn);
console.log("Missing TR:", missingTr);
