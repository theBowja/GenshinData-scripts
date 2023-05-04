require('./global.js');

const xview = getExcel('ViewCodexExcelConfigData');
// const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xcity = getExcel('CityConfigData');
const xarea = getExcel('WorldAreaConfigData');

function collageGeography(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mygeography = xview.reduce((accum, obj) => {

		let data = {};
		data.id = obj.Id;

		data.name = language[obj.nameTextMapHash];
		data.area = language[xarea.find(area => area.ID === obj.worldAreaId).AreaNameTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.region = language[xcity.find(city => city.cityId === obj.cityId).cityNameTextMapHash];
		data.showonlyunlocked = obj.showOnlyUnlocked ? true : undefined;
		data.sortorder = obj.SortOrder;

		// console.log(obj.cityID);

		data.nameimage = obj.image;

		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		checkDupeName(data, dupeCheck);
		accum[filename] = data;
		return accum;
	}, {});

	return mygeography;
}

module.exports = collageGeography;