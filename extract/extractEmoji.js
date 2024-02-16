require('./global.js');

const xemoji = getExcel('EmojiDataExcelConfigData');
const xset = getExcel('EmojiSetDataExcelConfigData');

// const propImage = getPropNameWithMatch(xdetail, 'id', 1001, "UI_Gcg_InSide_01");

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xemoji.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = sanitizeName(language[obj.contentTextMapHash]);

		data.setId = obj.setID;
		data.sortOrder = obj.order;

		data.filename_icon = obj.icon;

		let filename = makeUniqueFileName(obj.contentTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog, true);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name} ${lang} ${data.id}`);

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;