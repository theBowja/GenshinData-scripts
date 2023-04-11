const fs = require('fs');
const stringify = require('json-stringify-pretty-compact');

const imagefolder = `D:/GenshinImpact/2.1/patch/Texture2D`;

function filenameSort(x, y) {
	const xd = x.substring(0, x.lastIndexOf('.'));
	const yd = y.substring(0, y.lastIndexOf('.'));
	return xd == yd ? 0 : xd < yd ? -1 : 1;
}

function sanitizeFilename(filename) {
	if (filename.includes('#')) {
		const match = filename.match(/(.*)\s?#.*(\..*)/);
		return match[1]+match[2];
	}
	return filename;
}

const allfilesizes = require(`D:/GenshinImpact/2.0/all/filesizes.json`);
function fileAlreadyExists(filename, filesize) {
	if (Array.isArray(allfilesizes[filename]))
		return allfilesizes[filename].includes(filesize);
	else
		return allfilesizes[filename] === filesize;
}

const output = `D:/GenshinImpact/2.1/patch/filesizes.json`;
let filesizes = {};
try { filesizes = require(output) } catch(e) {}

const filenames = fs.readdirSync(imagefolder).sort(filenameSort);

for (const filenameraw of filenames) {
	const size = fs.statSync(`${imagefolder}/${filenameraw}`).size;

	const filename = sanitizeFilename(filenameraw);

	if (fileAlreadyExists(filename, size)) {
		fs.unlinkSync(`${imagefolder}/${filenameraw}`);
	} else {

		if (filesizes[filename] === undefined)
			filesizes[filename] = size;
		else if (typeof filesizes[filename] === 'number') {
			if (filesizes[filename] === size) {
				fs.unlinkSync(`${imagefolder}/${filenameraw}`);
			}
			else
				filesizes[filename] = [filesizes[filename], size];
		} else {
			if (filesizes[filename].includes(size)) {
				fs.unlinkSync(`${imagefolder}/${filenameraw}`);
			}
			else
				filesizes[filename].push(size);
		}
	}
}

fs.writeFileSync(output, stringify(filesizes, null, '\t'));
