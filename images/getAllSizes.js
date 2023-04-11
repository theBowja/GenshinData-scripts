const fs = require('fs');
const stringify = require('json-stringify-pretty-compact');
require('./global.js');

const imagefolder = `D:/GenshinImpact/2.0/all/Texture2D`;
const output = `D:/GenshinImpact/2.0/all/rawimagesizes.json`;

getAllSizes(imagefolder, output);

// Removes the "#" part of a filename. "Eff_UI_Talent_Zhongli#3156087.png" -> "Eff_UI_Talent_Zhongli.png"
function sanitizeFilename(filename) {
	if (filename.includes('#')) {
		const match = filename.match(/(.*)\s?#.*(\..*)/);
		return match[1]+match[2];
	}
	return filename;
}

function getAllSizes(imagesfolder, outputfilepath, overwrite=false, removeSameSizeImages=true) {
	if (fs.existsSync(outputfilepath) && !overwrite) return console.log(`Overwrite not enabled. File already exists at ${outputfilepath}`);
	const filesizes = {};

	// Sort filenames so that duplicates appear after non-duplicates.
	const filenames = fs.readdirSync(imagesfolder).sort(filenameSort);

	for (const filenameraw of filenames) {
		const size = fs.statSync(`${imagefolder}/${filenameraw}`).size;

		const filename = sanitizeFilename(filenameraw);

		if (filesizes[filename] === undefined) {
			filesizes[filename] = [ size ];

		} else {
			if (filesizes[filename].includes(size) && removeSameSizeImages)
				fs.unlinkSync(`${imagefolder}/${filenameraw}`);
			else
				filesizes[filename].push(size);
		}
	}

	fs.writeFileSync(outputfilepath, stringify(filesizes, null, '\t'));
}