require('./globalTcg.js');

const xmat = getExcel('MaterialExcelConfigData');
const xcard = getExcel('GCGCardExcelConfigData');

// const propImage = getPropNameWithMatch(xdetail, 'id', 1001, "UI_Gcg_InSide_01");

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xcard.reduce((accum, obj) => {
		if (obj.cardType !== 'GCG_CARD_STATE') return accum;
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