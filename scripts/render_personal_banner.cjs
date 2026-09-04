const { execSync } = require('child_process');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const inSvg = 'file:///D:/01_SaaS_Products/Alparai/public/brand/ercument_erden_linkedin_banner_1584x396.svg';
const outPng = 'D:\\01_SaaS_Products\\Alparai\\public\\ercument_erden_linkedin_banner_1584x396.png';

const cmd = `"${chromePath}" --headless --disable-gpu --window-size=1584,396 --screenshot="${outPng}" --default-background-color=00000000 "${inSvg}"`;
console.log('Running render...');
execSync(cmd);
console.log('Success! Rendered file size:', fs.statSync(outPng).size, 'bytes');
