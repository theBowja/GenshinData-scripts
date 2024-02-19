const fs = require('fs');
const config = require('../config.json');

checkVO('./db-vo.txt');
function checkVO(path) {
	const vofiles = fs.readFileSync(path).toString().split('\n');

	for (let vofile of vofiles) {
		for (let lang of config.read_audio_languages) {
            const file = `${lang}\\${vofile}`;

            if (!fs.existsSync(`../voice/${file}`)) {
                console.log(`missing ${file}`);
            }
        }
	}
    console.log(`done checking`);
}