const xmat = getExcel('MaterialExcelConfigData');



function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xmat.reduce((accum, obj) => {
		let data = {};
		data.id = obj.Id;

		data.name = language[obj.nameTextMapHash];
		data.description = sanitizeDescription(language[obj.descTextMapHash]);



		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;