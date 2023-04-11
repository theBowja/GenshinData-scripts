// Some images have incorrect dimensions. For example "UI_EquipIcon_Sword_Narukami.png" is 512x512 when it should be 256x256.
// This script will fix that by resizing them.

const fs = require('fs');
const sharp = require('sharp');
const sizeOf = require('image-size');
require('./global.js');

const imagesfolder = "D:/GenshinImpact/2.0/all/Texture2D";
const rules = [
	{
		startswith: "UI_EquipIcon_",
		fromdimensions: { width: 512, height: 512 },
		todimensions: { width: 256, height: 256 }
	}
]
fixImageDimensions(imagesfolder, true);

async function fixImageDimensions(imagesfolder, log=false) {
	const allfilenames = fs.readdirSync(imagesfolder);

	for (const filename of allfilenames) {
		const rule = matchesRule(imagesfolder, filename);
		if (rule) {
			// TODO: log
			if (log) console.log(`Resizing ${filename}`);
			await sharp(`${imagesfolder}/${filename}`)
				.resize({
					width: rule.todimensions.width,
					height: rule.todimensions.height
				}).toBuffer(function(err, buffer) {
				    fs.writeFileSync(`${imagesfolder}/${filename}`, buffer);
				});
		}
	}
}

function matchesRule(imagesfolder, filename) {
	const dimwidth = sizeOf(`${imagesfolder}/${filename}`).width;
	const dimheight = sizeOf(`${imagesfolder}/${filename}`).height;
	const size = fs.statSync(`${imagesfolder}/${filename}`).size;

	for (const rule of rules) {
		if (rule.startswith && !filename.startsWith(rule.startswith)) continue;
		if (rule.size && size !== rule.size) continue;
		if (rule.fromdimensions && !(dimwidth === rule.fromdimensions.width && dimheight === rule.fromdimensions.height)) continue;
		return rule;
	}
	return false;
}