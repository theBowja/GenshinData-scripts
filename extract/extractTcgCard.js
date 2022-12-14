require('./global.js');

const xcard = getExcel('GCGDeckCardExcelConfigData');
const xchar = getExcel('GCGCharExcelConfigData');
const xmat = getExcel('MaterialExcelConfigData');
// const xsource = getExcel('MaterialSourceDataExcelConfigData');

const propMap = {};
const propMatch = {
	// id: 'BDFMGMADMGC',
	storyDescTextHashMap: 753619631,
	source: 142707039
}

// find property names
// xcard.find(e => e.id === )
for(let [key, value] of Object.entries(xcard[0])) {
	for(let [pkey, pval] of Object.entries(propMatch)) {
		if (value === pval) propMap[pkey] = key;
	}
}

function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xcard.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		const mat = xmat.find(e => obj.itemID === e.id);
		data.name = language[mat.nameTextMapHash];
		// data.name = language[obj.nameTextMapHash];
		// data.description = language[obj.descTextMapHash];


		// let tmp = xsource.find(ele => ele.id === mat.id);
		data.source = language[obj[propMap.source]];
		// data.sourceA = getMatSourceText(obj.itemID, language);



		let filename = makeUniqueFileName(mat.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;