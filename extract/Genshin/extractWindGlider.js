require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xfly = getExcel('AvatarFlycloakExcelConfigData');

function collateWindGlider(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xfly.reduce((accum, obj) => {
		let data = {};
		data.id = obj.flycloakId;

		data.name = language[obj.nameTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);

		data.story = getReadable(`Wings${obj.flycloakId}${(lang != 'CHS') ? ('_' + lang) : ''}`, lang);

		let flymat = xmat.find(ele => ele.id === obj.materialId) || {};

		data.rarity = flymat.rankLevel;
		// data.sortorder = obj.flycloakId;
		data.isHidden = obj.hide ? true : undefined;

		// let sauce = xsource.find(ele => ele.id === obj.id);
		// data.source = sauce.textList.map(ele => language[ele]).filter(ele => ele !== '');
		data.source = getMatSourceText(obj.materialId, language);

		data.filename_icon = flymat.icon;
		data.filename_gacha = obj.icon;


		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		checkDupeName(data, dupeCheck);
		accum[filename] = data;
		return accum;
	}, {});

	return mydata;
}

module.exports = collateWindGlider;