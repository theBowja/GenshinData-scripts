require('./global.js');

// /*
// MATERIAL_AVATAR_MATERIAL is talent level-up material, etc.

// */

// const filter = ['MATERIAL_EXCHANGE', 'MATERIAL_WOOD', 'MATERIAL_AVATAR_MATERIAL', 'MATERIAL_EXP_FRUIT',
// 				'MATERIAL_WEAPON_EXP_STONE', 'MATERIAL_CONSUME', 'MATERIAL_FISH_BAIT', 'MATERIAL_FISH_ROD'];

// // Adventure EXP, Mora, Primogems, Companionship EXP, Apple, Sunsettia
// const includeMatId = [102, 202, 201, 105, 100001, 100002];
// // Crafted Items, Primordial Essence, Raw Meat (S), Fowl (S), Original Essence (Invalidated), Original Resin (Invalidated)
// // Scarlet Quartz, Scarlet Quartz, Test Stamina Growth Item, Test Temporary stamina Growth Item
// const excludeMatId = [110000, 112001, 100086, 100087, 210, 211,
// 					  101005, 101007, 106000, 106001];

// function sortMaterials(mata, matb) {
// 	if(mata.rank < matb.rank) return -1;
// 	if(mata.rank > matb.rank) return 1;
// 	if(mata.id < matb.id) return -1;
// 	if(mata.id > matb.id) return 1;
// 	return 0;
// }

// function collateFishingPoint(lang) {
// 	const language = getLanguage(lang);
// 	const xmat = getExcel('MaterialExcelConfigData').sort(sortMaterials);
// 	const xarchive = getExcel('MaterialCodexExcelConfigData');
// 	const xdungeon = getExcel('DungeonExcelConfigData');

// 	let sortOrder = 0;

// 	let mymaterial = xmat.reduce((accum, obj) => {
// 		sortOrder++;
// 		if(!includeMatId.includes(obj.id)) {
// 			if(!obj.materialType) return accum;
// 			if(excludeMatId.includes(obj.id)) return accum;
// 			if(!filter.includes(obj.materialType)) return accum;
// 		}
// 		if(obj.icon === "UI_ItemIcon_109000") return accum; // skip recipes
// 		else if(obj.icon === "UI_ItemIcon_221003") return accum; // skip diagrams
// 		else if(obj.icon === "UI_ItemIcon_221035") return accum; // skip bait blueprint
// 		else if(obj.icon === "UI_ItemIcon_221001") return accum; // skip instruction blueprints

// 		let data = {};
// 		data.id = obj.id;
// 		data.name = language[obj.nameTextMapHash];
// 		if(data.name === '') return accum;
// 		data.sortorder = sortOrder;
// 		data.description = sanitizeDescription(language[obj.descTextMapHash]);
// 		data.category = obj.materialType ? obj.materialType.slice(9) : obj.itemType;
// 		data.materialtype = language[obj.typeDescTextMapHash];
// 		if(obj.rankLevel) data.rarity = ''+obj.rankLevel;

// 		let tmp = xsource.find(ele => ele.id === obj.id);
// 		let dungeonlist = tmp.dungeonList.filter(ele => ele !== 0);
// 		if(dungeonlist > 0) {
// 			if(dungeonlist.length > 1) console.log(`${data.name} drops from more than one dungeon!`);
// 			data.dropdomain = language[xdungeon.find(ele => ele.id === dungeonlist[0]).displayNameTextMapHash]; // artifact domains don't have DisplayNameTextMapHash
// 			data.daysofweek = getDayWeekList(dungeonlist[0], language); 
// 		}
// 		if(getLanguage('EN')[obj.typeDescTextMapHash] === 'Fish') { // get fishing locations
			
// 		}
// 		data.source = tmp.textList.map(ele => language[ele]).filter(ele => ele !== '');

// 		data.imagename = obj.icon;
// 		if(!data.imagename) console.log(data.name+' has no icon');

// 		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
// 		if(filename === '') return accum;
// 		if(filename.includes('shrineofdepthskey')) return accum;
// 		accum[filename] = data;
// 		return accum;
// 	}, {});
// 	return mymaterial;
// }

// module.exports = collateMaterial;
