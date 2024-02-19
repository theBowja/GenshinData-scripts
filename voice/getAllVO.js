const fs = require('fs');
const path = require('path');

const NAMES = [];
const BASE = 'D:/Workspace/Node/GenshinData/BinOutput/Voice/Items';
const LANGUAGES = ['English(US)', 'Japanese', 'Chinese', 'Korean'];

console.log('working...');

fs.readdirSync(BASE, { withFileTypes: true }).forEach((dirent) => {
  const filePath = path.join(BASE, dirent.name);
  if (dirent.isFile()) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const doc = JSON.parse(fileContent);
    Object.values(doc).forEach((v0) => {
      if ('SourceNames' in v0) {
        v0['SourceNames'].forEach((i) => {
          const values = LANGUAGES.map((lang) => `${lang}\\${i['sourceFileName']}`);
          NAMES.push(...values);
        });
      }
    });
  }
});

fs.writeFileSync('vo.txt', NAMES.join('\n'));
console.log("done !!");
