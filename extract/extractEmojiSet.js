require('./global.js');

const xemoji = getExcel('EmojiDataExcelConfigData');
const xset = getExcel('EmojiSetDataExcelConfigData');

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xset.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = obj.id+'';

		data.sortOrder = obj.order;

		data.filename_icon = obj.icon;

		let filename = data.name;
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog, true);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name} ${lang} ${data.id}`);

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;