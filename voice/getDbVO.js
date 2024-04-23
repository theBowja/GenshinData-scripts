
const fs = require('fs');
const config = require('../config.json');

// exportData('voiceovers', require('./extract/extractVoiceover'));
writeVOFile();
function writeVOFile() {
    const xfetter = getExcel('FettersExcelConfigData');
    const avatarIdSet = new Set(getPlayableCharacters());

    // Set of strings
    const voiceFileIds = xfetter.reduce((accum, obj) => {
        if (avatarIdSet.has(obj.avatarId)) accum.add(obj.voiceFile);
        return accum;
    }, new Set());

    const sourceNames = [];
    const filelist = fs.readdirSync(`${config.GenshinData_folder}/BinOutput/Voice/Items`);
    for (const voiceitemfile of filelist) {
		if (!voiceitemfile.endsWith('.json')) continue;

		const fileObj = require(`${config.GenshinData_folder}/BinOutput/Voice/Items/${voiceitemfile}`);
        for (const fetterObj of Object.values(fileObj)) {
            if (fetterObj.GameTrigger !== 'Fetter') continue;
            if (!voiceFileIds.has(fetterObj.gameTriggerArgs+'')) continue;

            sourceNames.push(...(fetterObj.SourceNames||[]).map(sn => sn.sourceFileName));
        }
    }

    const dbvo = new Set(fs.readFileSync('./db-vo.txt').toString().split('\n'));
    // console.log(sourceNames);
    for (const sn of sourceNames) {
        if (!dbvo.has(sn)) {
            console.log(`extra ${sn}`);
        }
    }
    

	// const voiceovers = require(`${config.genshin_export_folder}/EN/voiceovers.json`);

	// let vofiles = Object.values(voiceovers).flatMap(voiceover => {
	// 	const friendFiles = voiceover.friendLines.flatMap(line => {
	// 		if (line.hasGenderedVoicefile) return [line.voicefile, line.voicefile_male];
	// 		else return line.voicefile;
	// 	});
	// 	const actionFiles = voiceover.actionLines.flatMap(line => {
	// 		if (line.hasGenderedVoicefile) return [line.voicefile, line.voicefile_male];
	// 		else return line.voicefile;
	// 	});

	// 	return friendFiles.concat(actionFiles);
	// });

	// vofiles = vofiles.map(file => file.replaceAll('/', '\\')+'.wem');

	// fs.writeFileSync('./db-vo.txt', vofiles.join('\n'));
}

/**
 * Gets a list of avatarIds for playable characters.
 * @returns {number[]}
 */
function getPlayableCharacters() {
    const xavatar = getExcel('AvatarExcelConfigData'); 
    return xavatar.filter(obj => obj.avatarPromoteId !== 2 || obj.id === 10000002).map(obj => obj.id); // array
}

function getExcel(file) { return require(`${config.GenshinData_folder}/ExcelBinOutput/${file}.json`); }
function getTextMaplangcode() { return require(`${config.GenshinData_folder}/TextMap/TextMap${langcode}.json`); }
