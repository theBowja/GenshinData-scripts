require('./global.js');
const fs = require('fs');

const xmat = getExcel('MaterialExcelConfigData');
const xfetter = getExcel('FettersExcelConfigData');
let mycharacter;

const skipdupelog = [];
function collateVoiceover(lang) {
	const language = getLanguage(lang);

	if (!mycharacter) mycharacter = require(`${config.genshin_export_folder}/EN/characters.json`);
	loadVoiceMap();
	return Object.entries(mycharacter).reduce((accum, [filename, charObj]) => {
		let data = {};
		data.id = charObj.id;
		data.name = charObj.name;

		let xvoices = xfetter.filter(ele => ele.avatarId === data.id);

		data.friendLines = [];
		data.actionLines = [];

		xvoices.forEach(fetterObj => {
			const voiceMapData = voiceMap[data.id][fetterObj.voiceFile].sort((a,b) => a.gender-b.gender);

			const voiceData = {
				voicelineId: fetterObj.fetterId,
				title: language[fetterObj.voiceTitleTextMapHash],
				voicelineType: fetterObj.voiceFile,
				description: sanitizeDescription(language[fetterObj.voiceFileTextTextMapHash]),
				voicefile: voiceMapData[0].sourceFileName.replaceAll('\\', '/')
			};
			voiceData.voicefile = voiceData.voicefile.substring(0, voiceData.voicefile.lastIndexOf('.')); // remove .wem

			if (voiceMapData.length > 1) { // has two voicelines for lumine and aether
				voiceData.voicefile_male = voiceMapData[1].sourceFileName.replaceAll('\\', '/');
				voiceData.voicefile_male = voiceData.voicefile_male.substring(0, voiceData.voicefile_male.lastIndexOf('.')); // remove .wem
				voiceData.hasGenderedVoicefile = true;
			}

			// check unlock conditions
			for (let i = 0; i < fetterObj.openConds.length; i++) {
				if (fetterObj.openConds[i].condType) {
					voiceData.hasUnlockConditions = true;
					if (!voiceData.unlockConditions) voiceData.unlockConditions = [];
					voiceData.unlockConditions.push({
						unlockText: language[fetterObj.tips[i]],
						conditionType: fetterObj.openConds[i].condType,
						paramList: fetterObj.openConds[i].paramList
					});
				}
			}

			if (fetterObj.type === 1)
				data.friendLines.push(voiceData);
			else if (fetterObj.type === 2)
				data.actionLines.push(voiceData);
			else {
				console.log(`unknown voiceline tab type ${fetterObj.type} for ${data.name}`);
				console.log(voiceData);
			}
		});

		accum[filename] = data;

		return accum;
	}, {});

	// xv.voiceFile maps to
	// GameTrigger: Fetter
	// gameTriggerArgs: 6011
}

let iconMap; // maps the last part of a characters icon to their avatar id
const switchMap = {
	// 'Switch_qin': 10000003,
	// 'Switch_ayaka': 10000002,
	'Switch_heroine': 10000007,
	'Switch_hero': 10000005,
	'Switch_heizou': 10000059
};
function mapAvatarNameToAvatarId(avatarName) {
	if (switchMap[avatarName]) return switchMap[avatarName];
	
	if (!mycharacter) mycharacter = require(`${config.genshin_export_folder}/EN/characters.json`);
	if (!iconMap) iconMap = Object.values(mycharacter).reduce((accum, curr) => {
		const iconname = curr.filename_icon.substring(curr.filename_icon.lastIndexOf('_')+1).toLowerCase();
		accum[iconname] = curr.id;
		return accum;
	}, {});

	const fname = avatarName.substring(avatarName.indexOf('_')+1).toLowerCase();
	if (mycharacter[fname]) {
		switchMap[avatarName] = mycharacter[fname].id;
		return switchMap[avatarName];
	} else if (iconMap[fname]) {
		switchMap[avatarName] = iconMap[fname];
		return switchMap[avatarName];
	}

	console.log(`Error mapAvatarNameToAvatarId is missing a manual map for ${avatarName} to an avatarId`);
	return switchMap[avatarName];
}

/**
 * {
 *   [avatarId]: {
 * 	   [voiceItemId]: [sourceFileName]
 *   }
 * }
 */
const voiceMap = {};
function loadVoiceMap() {
	if (voiceMap.loaded) return voiceMap;
	const starttime = Date.now();
	const filelist = fs.readdirSync(`${config.GenshinData_folder}/BinOutput/Voice/Items`);
	for (const voiceitemfile of filelist) {
		if (!voiceitemfile.endsWith('.json')) continue;

		const fileObj = require(`${config.GenshinData_folder}/BinOutput/Voice/Items/${voiceitemfile}`);

		const fetterObjList = Object.values(fileObj).filter(value => value.GameTrigger === "Fetter");
		for (const fetterObj of fetterObjList) {
			for (const source of fetterObj.SourceNames||[]) {
				const avatarId = mapAvatarNameToAvatarId(source.avatarName);
				if (!voiceMap[avatarId]) voiceMap[avatarId] = {};
				if (!voiceMap[avatarId][fetterObj.gameTriggerArgs]) voiceMap[avatarId][fetterObj.gameTriggerArgs] = [];

				// delete unneeded properties
				if (source.rate === 1) delete source.rate;
				else console.log(`loadVoiceMap source.rate = ${source.rate}`);
				if (source.emotion === '') delete source.emotion;
				else console.log(`loadVoiceMap source.emotion = ${source.emotion}`);

				if (Object.keys(source).length > 2 && !Object.keys(source).includes('gender'))
					console.log(`loadVoiceMap source has extra keys: ${Object.keys(source).join(', ')}`);

				voiceMap[avatarId][fetterObj.gameTriggerArgs].push(source);
				// if (voiceMap[avatarId][fetterObj.gameTriggerArgs].length > 1) console.log(`Error loadVoiceMap filename:${voiceitemfile} gameTriggerArgs:${fetterObj.gameTriggerArgs} has multiple of the same avatarName:${source.avatarName}`);
			}
		}
	}

	voiceMap.loaded = true;
	// console.log(`loadVoiceMap elapsed time ${(Date.now()-starttime) / 1000} seconds`)
	return voiceMap;
}

module.exports = collateVoiceover;