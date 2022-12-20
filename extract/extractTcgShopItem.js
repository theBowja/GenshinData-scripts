require('./globalTcg.js');

const xmat = getExcel('MaterialExcelConfigData');
const xshop = getExcel('ShopGoodsExcelConfigData');

// const propMap = {};
// const propMatch = {
// 	// id: 'BDFMGMADMGC',
// 	storyDescTextHashMap: 753619631,
// 	source: 142707039
// }

// // find property names
// for(let [key, value] of Object.entries(xcard[0])) {
// 	for(let [pkey, pval] of Object.entries(propMatch)) {
// 		if (value === pval) propMap[pkey] = key;
// 	}
// }

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xshop.reduce((accum, obj) => {
		if (obj.shopType !== 2001) return accum;

		let data = {};
		data.id = obj.goodsId;

		const mat = xmat.find(e => obj.itemId === e.id);

		data.name = language[mat.nameTextMapHash];
		if (language[obj.subTagNameTextMapHash] && !language[obj.subTagNameTextMapHash].startsWith('（test）'))
			console.log('TcgShopItem has subTagNameTextMapHash: ' + language[obj.subTagNameTextMapHash]);
		data.limit = obj.buyLimit;

		// data.description = sanitizeDescription(language[obj.descTextMapHash]);



		let filename = makeUniqueFileName(mat.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;