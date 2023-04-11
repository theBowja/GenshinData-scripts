const fs = require('fs');
const path = require("path");
const sizeOf = require('image-size');

function getDuplicatedFiles(filelist) {
	return filelist.filter(f => f.includes('#'));
	// !f.startsWith('UI_Frame') && !f.startsWith('UI_Img_Light_32'));
}

function extractDupeImageBaseFilename(filename) {
	const match = filename.match(/(.*)#.*(\..*)/);
	return match[1]+match[2];
}

function addHDToFilename(filename) {
	const match = filename.match(/(.*)(\..*)/);
	return match[1]+'_HD'+match[2];
}

function addbiggerToFilename(filename) {
	const match = filename.match(/(.*)(\..*)/);
	return match[1]+'_bigger'+match[2];
}

function addStringToFilename(filename, x) {
	const match = filename.match(/(.*)(\..*)/);
	return `${match[1]}_${x}${match[2]}`;
}

const makeBackup = false;
const imagesfolder = "D:/GenshinImpact/2.0/all/Texture2D";
// const imagesfolder = "D:/GenshinImpact/3.4/Texture2D";
// const imagesfolder = "C:/Users/ericx/Desktop/Workspace/GenshinImages/Texture2D";

function removeObviousDuplicates() {
	
}

main2();
function main2() {
	const allfilenames = fs.readdirSync(imagesfolder);
	let duplicatedfiles = getDuplicatedFiles(allfilenames);
	console.log(duplicatedfiles);

}

// main();
function main() {
	const allfilenames = fs.readdirSync(imagesfolder);
	// console.log(allfilenames);
	// fs.mkdirSync(unique, { recursive: true });
	// let newfiles = fs.readdirSync(folder);
	let duplicatedfiles = getDuplicatedFiles(allfilenames);
	let untouched = [];

	for (let df of duplicatedfiles) {
		let basefilename = extractDupeImageBaseFilename(df);
		if (!allfilenames.includes(basefilename)) {
			console.log(`${df} has a # without a matching ${basefilename}`);
			fs.renameSync(`${imagesfolder}/${df}`, `${imagesfolder}/${basefilename}`);
			continue;
		}

		const dfsize = fs.statSync(`${imagesfolder}/${df}`).size;
		const dfdim = sizeOf(`${imagesfolder}/${df}`);
		const basesize = fs.statSync(`${imagesfolder}/${basefilename}`).size;
		const basedim = sizeOf(`${imagesfolder}/${basefilename}`);

		// console.log(sizeOf(`${imagesfolder}/${df}`))
		// // console.log(fs.statSync(`${imagesfolder}/${df}`))
		// if (basefilename === 'UI_AchievementIcon_A012.png') {
		// 	console.log(df);
		// 	console.log(dfsize);
		// }

		// some random image
		if (basefilename === 'Skill_E_Gorou_01.png' && dfdim.height === 100 && dfdim.width === 100) {
			console.log(`Removing extra Skill_E_Gorou_01 100x100 image`);
			fs.unlinkSync(`${imagesfolder}/${df}`);
		}

		// if image is same size
		else if (dfsize === basesize) {
			console.log(`Images are same size ${dfsize}. Removing ${df}`);
			fs.unlinkSync(`${imagesfolder}/${df}`);
		}

		// if images are different dimensions. might need multiple passes?
		else if (dfdim.height !== basedim.height && dfdim.width !== basedim.width) {
			if (dfdim.height > basedim.height && dfdim.width > basedim.width) {
				console.log(`Dimension diff dupe is HD. Renamed ${df} to ${addHDToFilename(basefilename)}`);
				fs.renameSync(`${imagesfolder}/${df}`, `${imagesfolder}/${addHDToFilename(basefilename)}`);
			} else if (dfdim.height < basedim.height && dfdim.width < basedim.width) {
				console.log(`Dimension diff base is HD. Renamed ${basefilename} to ${addHDToFilename(basefilename)}`);
				console.log(`Dimension diff base is HD. Renamed ${df} to ${basefilename}`);
				fs.renameSync(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addHDToFilename(basefilename)}`);
				fs.renameSync(`${imagesfolder}/${df}`, `${imagesfolder}/${basefilename}`);
			} else {
				console.log(`Something weird going on with dimensions. ${df}`);
			}
		}

		// Weapons have two images that are the same except one is only slightly bigger than the other.
		//   One is the icon in the inventory. The other is for the card that shows up after you select a weapon to view its details. 
		//   It is impossible to identify which image is for which so we'll just split it by file size.
		else if (basefilename.startsWith('UI_EquipIcon_') && dfdim.height === 256 && dfdim.width === 256) {
			if (dfsize > basesize) {
				console.log(`UI_EquipIcon dupe bigger. Renamed ${df} to ${addbiggerToFilename(basefilename)}`);
				fs.renameSync(`${imagesfolder}/${df}`, `${imagesfolder}/${addbiggerToFilename(basefilename)}`);
			} else if (basesize > dfsize) {
				console.log(`UI_EquipIcon base bigger. Renamed ${basefilename} to ${addbiggerToFilename(basefilename)}`);
				console.log(`UI_EquipIcon base bigger. Renamed ${df} to ${basefilename}`);
				fs.renameSync(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addbiggerToFilename(basefilename)}`);
				fs.renameSync(`${imagesfolder}/${df}`, `${imagesfolder}/${basefilename}`);
			} else {
				console.log(`Something weird going on with UI_EquipIcon sizes. ${df}`);
			}
		}

		// According to my limited IQ, the non-dupe images are for the item card.
		else if (basefilename.startsWith('UI_FlycloakIcon_')) {
			console.log(`UI_FlycloakIcon. Renamed ${basefilename} to ${addStringToFilename(basefilename, 'card')}`);
			console.log(`UI_FlycloakIcon. Renamed ${df} to ${basefilename}`);
			fs.renameSync(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addStringToFilename(basefilename, 'card')}`);
			fs.renameSync(`${imagesfolder}/${df}`, `${imagesfolder}/${basefilename}`);
		}

		// Furniture fish in a jar. There's fish in a jar and fish not in a jar but not every fish has an image where they are not in a jar.
		//   They're all in a jar basically. Jar image is bigger.
		else if (basefilename.startsWith('UI_Homeworld_Fishable_Maritime_')) {
			const str = 'extra';
			if (dfsize > basesize) {
				console.log(`UI_Homeworld_Fishable_Maritime dupe bigger. Renamed ${basefilename} to ${addStringToFilename(basefilename, str)}`);
				console.log(`UI_Homeworld_Fishable_Maritime dupe bigger. Renamed ${df} to ${basefilename}`);
				fs.renameSync(`${imagesfolder}/${basefilename}`, `${imagesfolder}/${addStringToFilename(basefilename, str)}`);
				fs.renameSync(`${imagesfolder}/${df}`, `${imagesfolder}/${basefilename}`);
			} else if (basesize > dfsize) {
				console.log(`UI_Homeworld_Fishable_Maritime base bigger. Renamed ${df} to ${addStringToFilename(basefilename, str)}`);
				fs.renameSync(`${imagesfolder}/${df}`, `${imagesfolder}/${addStringToFilename(basefilename, str)}`);
			} else {
				console.log(`Something weird going on with UI_Homeworld_Fishable_Maritime sizes. ${df}`);
			}
		}

		else {
			untouched.push(df);
		}
	}


	fs.writeFileSync(`./hashtaglist.json`, JSON.stringify(duplicatedfiles, null, '\t'));
	fs.writeFileSync(`./untouched.json`, JSON.stringify(untouched, null, '\t'));
}

async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    let entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        entry.isDirectory() ?
            await copyDir(srcPath, destPath) :
            await fs.copyFile(srcPath, destPath);
    }
}