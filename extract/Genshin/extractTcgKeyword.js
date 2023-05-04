require('./globalTcg.js');

const xmat = getExcel('MaterialExcelConfigData');
const xkey = getExcel('GCGKeywordExcelConfigData');

// for AvatarCostumeExcelConfigData
// const propertyMap = {
// 	id: 'BDFMGMADMGC', // 200301
// 	avatarId: 'PDBPABLOMMA', // 10000003
// 	iconName: 'MKPEEANCLCO' // UI_AvatarIcon_QinCostumeSea
// }

// // find property names
// for([key, value] of Object.entries(xcostume[0])) {
// 	if(value === 200301) propertyMap.id = key;
// 	else if(value === 10000003) propertyMap.avatarId = key;
// 	else if(value === "UI_AvatarIcon_QinCostumeSea") propertyMap.iconName = key;
// }

function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xkey.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = sanitizeName(sanitizeDescription(language[obj.titleTextMapHash]));
		data.nameraw = language[obj.titleTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.descriptionraw = language[obj.descTextMapHash];


		let filename = makeUniqueFileName(obj.titleTextMapHash, accum, true);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name}`);

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;