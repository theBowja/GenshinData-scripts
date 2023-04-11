require('./global.js');
const fs = require('fs');
const path = require("path");
const sizeOf = require('image-size');

const overwrite = false;

const imagesfolder = `D:/GenshinImpact/2.0/all/Texture2D`;
handleDuplicatesPrefix(imagesfolder, true);

// function handleDuplicates(imagesfolder, log=false) {
// 	handleDuplicatesSpecific(imagesfolder, log);
// 	handleDuplicatesPrefix(imagesfolder, log);
// }

// 


function handleDuplicatesPrefix(imagesfolder, log=false) {
	const allfilenames = fs.readdirSync(imagesfolder);
	let duplicatedfiles = filterDuplicatedFilenames(allfilenames);

	for (const dupefilename of duplicatedfiles) {
		const basefilename = extractBaseFilename(dupefilename);


		// Weapons have two images that are the same except one is only slightly bigger than the other.
		//   One is the icon in the inventory. The other is for the card that shows up after you select a weapon to view its details. 
		//   It is impossible to identify which image is for which so we'll just split it by file size.
		if (dupefilename.startsWith('UI_EquipIcon_')) {
			if (checkDimensions(imagesfolder, dupefilename, [[256, 256]])) {
				handleBySizeSmall(imagesfolder, dupefilename, '_copy', log);
			}

		// According to my limited IQ, the non-dupe images are for the item card.
		} else if (dupefilename.startsWith('UI_FlycloakIcon_')) {
			moveFile(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, '_card')}`, overwrite, log);
			moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${basefilename}`, overwrite, log);

		// UI_ItemIcon smaller token images.
		} else if (dupefilename.startsWith('UI_ItemIcon_')) {
			if (checkDimensions(imagesfolder, dupefilename, [[256, 256], [64, 64]])) {
				handleByDimensionsSmall(imagesfolder, dupefilename, '_SM', log);
			}

		// Append (Size)
		} else if (dupefilename.startsWith('UI_Activity_Dragonspine_Bg')) {
			handleAppendSize(imagesfolder, dupefilename, log);

		// Append _HD
		} else if (dupefilename.startsWith('UI_TheatreMechanicusMap_')
				|| dupefilename.startsWith('UI_Codex_Scenery_')
				// || dupefilename.startsWith('')
				|| dupefilename.startsWith('UI_HideandSeek_Scenery_')) {
			handleByDimensionsBig(imagesfolder, dupefilename, '_HD', log);

		// Just delete. There's no way to tell which image is correct.
		} else if (dupefilename.startsWith('UI_MapBack_')
				|| dupefilename.startsWith('UI_Fog_Homeworld_Exterior_Above_')
				|| dupefilename.startsWith('UI_Fog_MapBack_')
				// || dupefilename.startsWith('')
				|| dupefilename.startsWith('UI_LostParadise_')) {
			removeFile(`${imagesfolder}/${dupefilename}`, log);

		// } else if (dupefilename.startsWith('')) {
		// } else if (dupefilename.startsWith('')) {
		// } else if (dupefilename.startsWith('')) {
		// } else if (dupefilename.startsWith('')) {

		} else {
			console.log(`Unhandled dupe in Prefix handler: ${dupefilename}`);
		}
	}
}

// check if dimensions are properly 256x256 or 64x64 or etc.
function checkDimensions(imagesfolder, filename, sizes) {
	const dim = sizeOf(`${imagesfolder}/${filename}`);
	for (let size of sizes) {
		if (dim.width === size[0] && dim.height === size[1]) return true;
	}
	console.log(`Unhandled dimensions for ${filename} ${dim.width}x${dim.height}`);
	return false;
}

// Appends a string to the end of file name. For example: "UI_Codex_Scenery_DQgaolu.png" -> "UI_Codex_Scenery_DQgaolu_HD.png".
function addStrToFilename(filename, str) {
	const match = filename.match(/(.*)(\..*)/);
	return `${match[1]}${str}${match[2]}`;
}

// Appends filesize to end of file name. For example: "UI_Activity_Dragonspine_Bg(471248).png"
function handleAppendSize(imagesfolder, dupefilename, log=false) {
	const basefilename = extractBaseFilename(dupefilename);

	const dupesize = fs.statSync(`${imagesfolder}/${dupefilename}`).size;
	const basesize = fs.statSync(`${imagesfolder}/${basefilename}`).size;

	if (dupesize > basesize) {
		moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, `(${dupesize})`)}`, overwrite, log);

	} else  {
		moveFile(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, `(${basesize})`)}`, overwrite, log);
		moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${basefilename}`, overwrite, log);
	}
}

// If images are different dimensions. Might need multiple passes?
// Sets the image with the smaller dimensions as the base image.
function handleByDimensionsBig(imagesfolder, dupefilename, suffix, log=false) {
	const basefilename = extractBaseFilename(dupefilename);

	const dupedim = sizeOf(`${imagesfolder}/${dupefilename}`);
	const basedim = sizeOf(`${imagesfolder}/${basefilename}`);

	if (dupedim.height > basedim.height && dupedim.width > basedim.width) {
		// console.log(`Dimension diff dupe is HD. Renamed ${dupefilename} to ${addHDToFilename(basefilename)}`);
		moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, suffix)}`, overwrite, log);

	} else if (dupedim.height < basedim.height && dupedim.width < basedim.width) {
		// console.log(`Dimension diff base is HD. Renamed ${basefilename} to ${addHDToFilename(basefilename)}`);
		// console.log(`Dimension diff base is HD. Renamed ${dupefilename} to ${basefilename}`);
		moveFile(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, suffix)}`, overwrite, log);
		moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${basefilename}`, overwrite, log);

	} else {
		console.log(`Error in handleByDimensionsBig: something weird going on with dimensions for ${dupefilename}`);
	}
}

// If images are different dimensions. Might need multiple passes?
// Sets the image with the bigger dimensions as the base image.
function handleByDimensionsSmall(imagesfolder, dupefilename, suffix, log=false) {
	const basefilename = extractBaseFilename(dupefilename);

	const dupedim = sizeOf(`${imagesfolder}/${dupefilename}`);
	const basedim = sizeOf(`${imagesfolder}/${basefilename}`);

	if (dupedim.height > basedim.height && dupedim.width > basedim.width) {
		moveFile(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, suffix)}`, overwrite, log);
		moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${basefilename}`, overwrite, log);

	} else if (dupedim.height < basedim.height && dupedim.width < basedim.width) {
		moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, suffix)}`, overwrite, log);

	} else {
		console.log(`Error in handleByDimensionsSmall: something weird going on with dimensions for ${dupefilename}`);
	}
}

// Sets the image with the smaller size as the base image.
function handleBySizeSmall(imagesfolder, dupefilename, suffix, log=false) {
	const basefilename = extractBaseFilename(dupefilename);

	const dupesize = fs.statSync(`${imagesfolder}/${dupefilename}`).size;
	const basesize = fs.statSync(`${imagesfolder}/${basefilename}`).size;

	const dupedim = sizeOf(`${imagesfolder}/${dupefilename}`);
	const basedim = sizeOf(`${imagesfolder}/${basefilename}`);

	if (dupedim.width !== basedim.width || dupedim.height !== basedim.height) {
		console.log(`Error in handleBySizeSmall: mismatching dimensions between ${basefilename} and ${dupefilename}`);
	}
	else if (dupesize < basesize) {
		moveFile(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, suffix)}`, overwrite, log);
		moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${basefilename}`, overwrite, log);
	} else {
		moveFile(`${imagesfolder}/${dupefilename}`, `${imagesfolder}/${addStrToFilename(basefilename, suffix)}`, overwrite, log);
	}
}