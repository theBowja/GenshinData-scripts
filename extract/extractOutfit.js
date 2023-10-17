require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xcostume = getExcel('AvatarCostumeExcelConfigData');
const xavatar = getExcel('AvatarExcelConfigData');

// for AvatarCostumeExcelConfigData
const propertyMap = {
	id: 'BDFMGMADMGC', // 200301
	avatarId: 'PDBPABLOMMA', // 10000003
	iconName: 'MKPEEANCLCO' // UI_AvatarIcon_QinCostumeSea
}

// find property names
for([key, value] of Object.entries(xcostume[0])) {
	if(value === 200301) propertyMap.id = key;
	else if(value === 10000003) propertyMap.avatarId = key;
	else if(value === "UI_AvatarIcon_QinCostumeSea") propertyMap.iconName = key;
}

// taken from collateCharacter.js
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };

function collateOutfit(lang) {
	const language = getLanguage(lang);
	let myoutfit = xcostume.reduce((accum, obj) => {

		let data = {};
		data.id = obj[propertyMap.id];

		data.name = language[obj.nameTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);

		data.isDefault = obj.isDefault === true;

		const AvatarId = obj[propertyMap.avatarId];
		if(playerIdToTextMapHash[AvatarId])
			data.characterName = language[playerIdToTextMapHash[AvatarId]];
		else
			data.characterName = language[xavatar.find(ele => ele.id === obj[propertyMap.avatarId]).nameTextMapHash];
		data.characterId = AvatarId;

		if(obj.itemId) {
			let sauce = xsource.find(ele => ele.id === obj.itemId);
			data.source = sauce.textList.map(ele => language[ele]).filter(ele => ele !== '' && ele !== undefined);

			data.filename_card = xmat.find(ele => ele.id === obj.itemId).icon;
		} else {
			data.filename_card = 'UI_AvatarIcon_Costume_Card';
		}

		if(obj[propertyMap.iconName]) {
			data.filename_icon = obj[propertyMap.iconName];
			const name = data.filename_icon.slice(data.filename_icon.lastIndexOf('_')+1);

			data.filename_iconCircle = `UI_AvatarIcon_${name}_Circle`;
			data.filename_splash = `UI_Costume_${name}`;
		} else {
			const iconnametemp = xavatar.find(ele => ele.id === obj[propertyMap.avatarId]).iconName;
			const name = iconnametemp.slice(iconnametemp.lastIndexOf('_')+1);
			data.filename_iconCircle = `UI_AvatarIcon_${name}_Circle`;
		}

		if(obj.sideIconName)
			data.filename_sideIcon = obj.sideIconName;



		// data.nameicon = obj.icon;
		// data.namebanner = obj.useParam[0] !== "" ? obj.useParam[0] : undefined;
		// data.namebackground = obj.useParam[1];

		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(filename === '') return accum;
		if(filename === 'defaultoutfit') return accum;
		if(playerIdToTextMapHash[AvatarId])
			filename += makeFileName(getLanguage('EN')[playerIdToTextMapHash[AvatarId]]);
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return myoutfit;
}

module.exports = collateOutfit;