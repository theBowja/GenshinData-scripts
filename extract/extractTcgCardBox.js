require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xbox = getExcel('GCGDeckFieldExcelConfigData');
xbox[0].id = 100;


const propMap = {};
const propMatch = {
	// id: 'BDFMGMADMGC',
	// storyDescTextHashMap: 753619631,
	source: 1908811578
}

// find property names
for(let [key, value] of Object.entries(xbox[0])) {
	for(let [pkey, pval] of Object.entries(propMatch)) {
		if (value === pval) propMap[pkey] = key;
	}
}

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xbox.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = language[obj.nameTextMapHash];

		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.descriptionraw = language[obj.descTextMapHash];

		data.source = language[obj[propMap.source]];

		const mat = xmat.find(e => e.id === obj.itemId);
		data.rarity = mat.rankLevel;
		data.filename_icon = mat.icon;

		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;