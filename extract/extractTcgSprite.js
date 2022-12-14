require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xsprite = getExcel('SpriteTagExcelConfigData');

const propMap = {};
const propMatch = {
	image: "ART/UI/Atlas/GCG/CardIcon/UI_Gcg_DiceS_Frost",
	name: 1659555184
}

// find property names
for(let [key, value] of Object.entries(xsprite[0])) {
	for(let [pkey, pval] of Object.entries(propMatch)) {
		if (value === pval) propMap[pkey] = key;
	}
}

const skipdupelog = [1101, 1102, 1103, 1104, 1105, 1106, 1107];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xsprite.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = language[obj[propMap.name]];

		data.image = obj[propMap.image];
		data.image = data.image.slice(data.image.lastIndexOf('/')+1);

		let filename = makeUniqueFileName(obj[propMap.name], accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;