const fs = require('fs');
const path = require("path");
const sizeOf = require('image-size');
require('./global.js');

// Goes through every # image in the specified folder and removes any images that already have the same exact size.

function removeSameSizeImages(imagesfolder, log) {
	const allfilenames = fs.readdirSync(imagesfolder);
	let duplicatedfiles = getDuplicatedFilenames(allfilenames);
	// if (log) console.log(duplicatedfiles);

	for (let dupefilename of duplicatedfiles) {
		const basefilename = extractBaseFilename(dupefilename);

		const dupefilesize = fs.statSync(`${imagesfolder}/${dupefilename}`).size;
		const basefilesize = fs.statSync(`${imagesfolder}/${basefilename}`).size;

		if (dupefilesize === basefilesize) {
			if (log) console.log(`removeSameSizeImages: removing ${dupefilesize}`);
			fs.unlinkSync(`${imagesfolder}/${dupefilename}`);
		}
	}
}
