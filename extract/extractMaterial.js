require('./global.js');
const xsource = getExcel('MaterialSourceDataExcelConfigData');

/*
MATERIAL_AVATAR_MATERIAL is talent level-up material, etc.

check MaterialSourceDataExcelConfigData should have
{
	Id: 114007,
	DungeonList: [
		4320,
		4321,
		4322,
		4323
	],
	TextList: [
		4083257751,
		4201531456,
		3807357581,
		2886122308,
		3675025673,
		2276455088
	]
}


*/

const filter = ['MATERIAL_EXCHANGE', 'MATERIAL_WOOD', 'MATERIAL_AVATAR_MATERIAL', 'MATERIAL_EXP_FRUIT',
				'MATERIAL_WEAPON_EXP_STONE', 'MATERIAL_CONSUME', 'MATERIAL_FISH_BAIT', 'MATERIAL_FISH_ROD', 'MATERIAL_ELEM_CRYSTAL'];

// Adventure EXP, Mora, Primogems, Companionship EXP, Apple, Sunsettia, Starshroom, Activated Starshroom, Scorched Starshroom
const includeMatId = [102, 202, 201, 105, 100001, 100002, 101212, 101226, 101227];
// Crafted Items, Primordial Essence, Raw Meat (S), Fowl (S), Original Essence (Invalidated), Original Resin (Invalidated)
// Scarlet Quartz, Scarlet Quartz, Test Stamina Growth Item, Test Temporary stamina Growth Item, Fragrant Seasoning
const excludeMatId = [110000, 112001, 100086, 100087, 210, 211,
					  101005, 101007, 106000, 106001, 141115];

function sortMaterials(mata, matb) {
	if(mata.rank === undefined) mata.rank = 99999999;
	if(matb.rank === undefined) matb.rank = 99999999;
	if(mata.rank < matb.rank) return -1;
	if(mata.rank > matb.rank) return 1;
	if((mata.rankLevel || 0) > (matb.rankLevel || 0)) return -1;
	if((mata.rankLevel || 0) < (matb.rankLevel || 0)) return 1;
	if(mata.id < matb.id) return -1;
	if(mata.id > matb.id) return 1;
	return 0;
}

function collateMaterial(lang) {
	const language = getLanguage(lang);
	const xmat = getExcel('MaterialExcelConfigData').sort(sortMaterials);
	const xarchive = getExcel('MaterialCodexExcelConfigData');
	const xdungeon = getExcel('DungeonExcelConfigData');

	const xfish = getExcel('FishExcelConfigData');
	const xstock = getExcel('FishStockExcelConfigData');
	const xpool = getExcel('FishPoolExcelConfigData');

	let sortOrder = 0;
	const dupeCheck = {};

	let mymaterial = xmat.reduce((accum, obj) => {
		sortOrder++;
		if(!includeMatId.includes(obj.id)) {
			if(!obj.materialType) return accum;
			if(excludeMatId.includes(obj.id)) return accum;
			if(!filter.includes(obj.materialType)) return accum;
		}
		if(obj.icon === "UI_ItemIcon_109000") return accum; // skip recipes
		else if(obj.icon === "UI_ItemIcon_221003") return accum; // skip diagrams
		else if(obj.icon === "UI_ItemIcon_221035") return accum; // skip bait blueprint
		else if(obj.icon === "UI_ItemIcon_221001") return accum; // skip instruction blueprints

		let data = {};
		data.id = obj.id;
		data.name = language[obj.nameTextMapHash];
		if(data.name === '') return accum;
		data.sortRank = obj.rank;
		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.category = obj.materialType ? obj.materialType.slice(9) : obj.itemType;
		data.typeText = language[obj.typeDescTextMapHash];
		// data.bagtab = 
		if(obj.rankLevel) data.rarity = obj.rankLevel;

		let tmp = xsource.find(ele => ele.id === obj.id);
		let dungeonlist = tmp.dungeonList.filter(ele => ele !== 0);
		if(dungeonlist > 0) {
			if(dungeonlist.length > 1) console.log(`${data.name} drops from more than one dungeon!`);
			if(xdungeon.find(ele => ele.id === dungeonlist[0])) {
				data.dropDomainName = language[xdungeon.find(ele => ele.id === dungeonlist[0]).displayNameTextMapHash]; // artifact domains don't have DisplayNameTextMapHash
				data.dropDomainId = dungeonlist[0];
				data.daysOfWeek = getDayWeekList(dungeonlist[0], language); 
			}
		}
		// get fishing locations
		// if(getLanguage('EN')[obj.typeDescTextMapHash] === 'Fish') {
			// let fishId = xfish.find(ele => ele.itemId === obj.id).id;
			// let stockIds = xstock.reduce((stockAccum, stockObj) => {
			// 	if(stockObj.fishWeight[fishId] !== undefined) stockAccum.push(stockObj.id);
			// 	return stockAccum;
			// }, []);
			// data.fishinglocations = stockIds.reduce((poolAccum, stockId) => {
			// 	let pool = xpool.find(p => p.stockList.includes(stockId));
			// 	if(pool === undefined) return poolAccum;
			// 	if(!poolAccum.includes(language[pool.poolNameTextMapHash]))
			// 		poolAccum.push(language[pool.poolNameTextMapHash]);
			// 	return poolAccum;
			// }, []);
		// }
		const sourcelist = tmp.textList.concat(tmp.jumpList).concat(tmp[getPropJumpDescs()]);
		// if (obj.id === 112075) console.log(tmp)
		data.sources = sourcelist.map(ele => language[ele]).filter(ele => ele !== '' && ele !== undefined); // TextList/JumpList

		data.filename_icon = obj.icon;
		if(!data.filename_icon) console.log(data.name+' has no icon');

		let filename = makeUniqueFileName(obj.nameTextMapHash, accum, data);
		if(filename === '') return accum;
		if(filename.includes('shrineofdepthskey')) return accum;
		checkDupeName(data, dupeCheck);
		accum[filename] = data;
		return accum;
	}, {});

	// console.log(Object.values(mymaterial).filter(e => e.materialtype === "Material").map(e => e.name));
	// console.log(Object.values(mymaterial).map(e => e.name));

	return mymaterial;
}

// format returned is translated and sorted array ["Monday", "Thursday", "Sunday"]
function getDayWeekList(dungeonId, langmap) {
	const xdailyd = getExcel('DailyDungeonConfigData');
	let mylist = [];
	for(const ele of xdailyd)
		for(const [key, value] of Object.entries(mapENtoNum()))
			if(ele[key].includes(dungeonId)) mylist.push(value);
	mylist = mylist.sort((a, b) => a - b);
	return mylist.map(ele => langmap[dayOfWeek(ele)]);
}

let propJumpDescs = undefined;
function getPropJumpDescs() {
	if(propJumpDescs !== undefined) return propJumpDescs;
	for (let [key, value] of Object.entries(xsource[0])) {
		if (Array.isArray(value) && value[0] === 2918309764) {
			propJumpDescs = key;
			return propJumpDescs;
		}
	}
}

module.exports = collateMaterial;


// commented out because this issue has been fixed
// MaterialSourceDataExcelConfigData
// Each object has a duplicate DungeonList property :/
// Remove it.
// function cleanupMaterialSourceFile() {
// 	const fs = require('fs');
// 	let data = fs.readFileSync('../ExcelBinOutput/MaterialSourceDataExcelConfigData.json', 'utf8');
// 	data = data.replace(/("DungeonList"[^\]]*?],)\s*"DungeonList".*?],/gs, '$1');
// 	fs.writeFileSync('../ExcelBinOutput/MaterialSourceDataExcelConfigData.json', data);
// }
// cleanupMaterialSourceFile();