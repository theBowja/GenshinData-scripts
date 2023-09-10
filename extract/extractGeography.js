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
		data.areaName = language[xarea.find(area => area.ID === obj.worldAreaId).AreaNameTextMapHash];
		data.areaId = obj.worldAreaId;
		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.regionName = language[xcity.find(city => city.cityId === obj.cityId).cityNameTextMapHash];
		data.regionId = obj.cityId;
		data.showOnlyUnlocked = obj.showOnlyUnlocked ? true : undefined;
		data.sortOrder = obj.SortOrder;

		// console.log(obj.cityID);

		data.filename_image = obj.image;

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