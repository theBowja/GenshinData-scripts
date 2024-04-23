require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xcodex = getExcel('AnimalCodexExcelConfigData');
const xdescribe = getExcel('AnimalDescribeExcelConfigData');
const xcapture = getExcel('CaptureExcelConfigData');

// FIX THIS EVERY VERSION
let propCOUNTTYPE = "FEBIEOGMDMF"; // AnimalCodexExcelConfigData

// find property names
for([key, value] of Object.entries(xcodex[0])) {
	if(value === "CODEX_COUNT_TYPE_KILL") propCOUNTTYPE = key;
}

function collateAnimal(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xcodex.reduce((accum, obj) => {
		if(obj.type === 'CODEX_MONSTER') return accum;
		if(obj.isDisuse) return accum;
		let data = {};
		data.id = obj.id;

		let mydescribe = xdescribe.find(ele => ele.id === obj.describeId);

		data.name = language[mydescribe.nameTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);

		const catType = obj.subType.substring(obj.subType.lastIndexOf('_')+1);
		data.categoryType = obj.subType.substring(obj.subType.indexOf('_')+1);
		data.categoryText = language[xmanualtext.find(ele => ele.textMapId === `UI_CODEX_ANIMAL_CATEGORY_${catType}`).textMapContentTextMapHash]
		// data.capturable = xcapture.find(ele => ele.monsterID === obj.id) ? true : undefined;
		let counttype = obj[propCOUNTTYPE] || "_COUNT_TYPE_NONE";
		data.countType = counttype.substring(counttype.indexOf('_')+1);
		data.sortOrder = obj.sortOrder;

		data.filename_icon = mydescribe.icon;

		// console.log(mydescribe.nameTextMapHash)
		let filename = makeUniqueFileName(mydescribe.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck);
		accum[filename] = data;
		return accum;
	}, {});

	return mydata;
}



module.exports = collateAnimal;