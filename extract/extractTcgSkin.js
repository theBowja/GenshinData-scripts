require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xface = getExcel('GCGCardFaceExcelConfigData');

const propMap = {};
const propMatch = {
	// id: 'BDFMGMADMGC',
	storyDescTextHashMap: 753619631,
	source: 142707039
}

// find property names
for(let [key, value] of Object.entries(xcard[0])) {
	for(let [pkey, pval] of Object.entries(propMatch)) {
		if (value === pval) propMap[pkey] = key;
	}
}

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xface.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = language[obj.nameTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);



		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;