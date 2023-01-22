require('./global.js');

let xdungeon = getExcel('DungeonExcelConfigData');
const xpreview = getExcel('RewardPreviewExcelConfigData');
const xdungeonentry = getExcel('DungeonEntryExcelConfigData'); // adventure handbook
const xdisplay = getExcel('DisplayItemExcelConfigData');
const xdisorder = getExcel('DungeonLevelEntityConfigData'); // ley line disorder
const xcity = getExcel('CityConfigData');

// something inside ManualTextMapConfigData
const domainType = {
	UI_ABYSSUS_RELIC: "UI_ABYSSUS_RELIC",
	UI_ABYSSUS_WEAPON_PROMOTE: "UI_ABYSSUS_WEAPON_PROMOTE",
	UI_ABYSSUS_AVATAR_PROUD: "UI_ABYSSUS_AVATAR_PROUD"
}
function getDomainTypeTextMapHash(domaintype) {
	return xmanualtext.find(ele => ele.textMapId === domaintype).textMapContentTextMapHash;
}

/*
"UI_DUNGEON_ENTRY_27", // "Valley of Remembrance"
"UI_DUNGEON_ENTRY_29", // "Forsaken Rift"
"UI_DUNGEON_ENTRY_37", // "Cecilia Garden"
"UI_DUNGEON_ENTRY_35", // "Midsummer Courtyard"
"UI_DUNGEON_ENTRY_46", // "Taishan Mansion"
"UI_DUNGEON_ENTRY_48", // "Domain of Guyun"
"UI_DUNGEON_ENTRY_50", // "Clear Pool and Mountain Cavern"
"UI_DUNGEON_ENTRY_52", // "Hidden Palace of Lianshan Formula"
"UI_DUNGEON_ENTRY_54", // "Hidden Palace of Zhou Formula"
"UI_DUNGEON_ENTRY_282", // "Ridge Watch"
"UI_DUNGEON_ENTRY_221", // "Peak of Vindagnyr"
"UI_DUNGEON_ENTRY_361", // "Momiji-Dyed Court"
"UI_DUNGEON_ENTRY_310", // "Violet Court"
"UI_DUNGEON_ENTRY_368", // "Court of Flowing Sand"
"UI_DUNGEON_ENTRY_433", // "Slumbering Court"
"UI_DUNGEON_ENTRY_516", // "The Lost Valley"
"UI_DUNGEON_ENTRY_505", // "Steeple of Ignorance"
"UI_DUNGEON_ENTRY_507", // "Spire of Solitary Enlightenment"
"UI_DUNGEON_ENTRY_509", // "Tower of Abject Pride"
"UI_DUNGEON_ENTRY_758", // "City of Gold"
*/
function getDomainEntranceTextMapHash(englishname) {
	englishname = englishname.toLowerCase();
	function mapping(textmapid) { return xmanualtext.find(ele => ele.textMapId === textmapid).textMapContentTextMapHash; }

	if(englishname.includes('dance of steel'))
		return mapping("UI_DUNGEON_ENTRY_27");
	else if(englishname.includes('city of reflections') || englishname.includes('submerged valley') || englishname.includes('ruins of thirsting capital'))
		return mapping("UI_DUNGEON_ENTRY_37");
	else if(englishname.includes('frosted altar') || englishname.includes('frozen abyss') || englishname.includes('realm of slumber'))
		return mapping("UI_DUNGEON_ENTRY_29");
	else if(englishname.includes('fires of purification'))
		return mapping("UI_DUNGEON_ENTRY_35");
	else if(englishname.includes('altar of flames') || englishname.includes('heart of the flames') || englishname.includes('circle of embers'))
		return mapping("UI_DUNGEON_ENTRY_46");
	else if(englishname.includes('spring'))
		return mapping("UI_DUNGEON_ENTRY_48");
	else if(englishname.includes('stone chamber'))
		return mapping("UI_DUNGEON_ENTRY_50");
	else if(englishname.includes('thundercloud altar') || englishname.includes('thundering ruins') || englishname.includes('trial grounds of thunder'))
		return mapping("UI_DUNGEON_ENTRY_52");
	else if(englishname.includes('frost'))
		return mapping("UI_DUNGEON_ENTRY_54");
	else if(englishname.includes('unyielding'))
		return mapping("UI_DUNGEON_ENTRY_282");
	else if(englishname.includes('elegiac rime'))
		return mapping("UI_DUNGEON_ENTRY_221");
	else if(englishname.includes('autumn hunt'))
		return mapping("UI_DUNGEON_ENTRY_361");
	else if(englishname.includes('reign of violet') || englishname.includes('thundering valley') || englishname.includes('vine-infested ruins'))
		return mapping("UI_DUNGEON_ENTRY_310");
	else if(englishname.includes('sunken sands') || englishname.includes('altar of sands') || englishname.includes('sand burial'))
		return mapping("UI_DUNGEON_ENTRY_368");
	else if(englishname.includes('necropolis'))
		return mapping("UI_DUNGEON_ENTRY_433");
	else if(englishname.includes('machine nest'))
		return mapping("UI_DUNGEON_ENTRY_516");
	else if(englishname.includes('seven sense'))
		return mapping("UI_DUNGEON_ENTRY_507");
	else if(englishname.includes('full moon') || englishname.includes('witticism') || englishname.includes('basket of'))
		return mapping("UI_DUNGEON_ENTRY_505");
	else if(englishname.includes('tainted cloud') || englishname.includes('leading karma') || englishname.includes('obsession'))
		return mapping("UI_DUNGEON_ENTRY_509");
	else if(englishname.includes('desert citadel'))
		return mapping("UI_DUNGEON_ENTRY_758");
	else
		console.log('no domain entrance mapping found for '+englishname);
}

// these are removed from the game
function isSundaySpecial(englishname) {
	englishname = englishname.toLowerCase();
	return englishname.includes('altar of the falls') || englishname.includes('electrostatic field') || 
	       englishname.includes('abyss of embers') || englishname.includes('biting frost');
}

function collateDomain(lang) {
	const language = getLanguage(lang);
	const xmat = getExcel('MaterialExcelConfigData');
	// xdungeon = moredungeons.concat(xdungeon);
	let mydomain = xdungeon.reduce((accum, obj) => {
		if(obj.type !== "DUNGEON_DAILY_FIGHT" || obj.stateType !== "DUNGEON_STATE_RELEASE") return accum;
		if(isSundaySpecial(getLanguage('EN')[obj.nameTextMapHash])) return accum;
		// console.log(obj.id);
		let data = {};
		data.id = obj.id;
		data.name = language[obj.nameTextMapHash];
		// data.displayname = language[obj.displayNameTextMapHash]; // doesn't exist for artifact domains
		data.domainentrance = language[getDomainEntranceTextMapHash(getLanguage('EN')[obj.nameTextMapHash])];// obj.entryPicPath;
		data.description = sanitizeDescription(language[obj.descTextMapHash]);

		// CITY FIX // fix no longer needed 2.7
		// if(obj.id === 5120 || obj.id === 5121 || obj.id === 5122 || obj.id === 5123) obj.cityID = 1; // Peak of Vindagnyr region fix from Liyue to Mondstadt
		// if(obj.id >= 5258 && obj.id <= 5265) obj.cityID = 2; // Taishan Mansion in Liyue
		// if(obj.id >= 5214 && obj.id <= 5225) obj.cityID = 2; // Hidden Palace of Lianshan Formula in Liyue
		// if(obj.id >= 5200 && obj.id <= 5207) obj.cityID = 3; // Slumbering Court in Inazuma, and Momiji-Dyed Court
		if(obj.id >= 4310 && obj.id <= 4313) obj.cityID = 1; // "Cecilia Garden"
		if(obj.id >= 4330 && obj.id <= 4333) obj.cityID = 1; // "Cecilia Garden"
		if(obj.id >= 4320 && obj.id <= 4323) obj.cityID = 1; // "Cecilia Garden"


		data.region = language[xcity.find(city => city.cityId === obj.cityID).cityNameTextMapHash];

		data.recommendedlevel = obj.showLevel;
		if(typeof obj.recommendElementTypes[0] === 'string')
			data.recommendedelements = obj.recommendElementTypes.filter(ele => ele !== 'None').map(ele => language[xmanualtext.find(man => man.textMapId === ele).textMapContentTextMapHash]);
		data.daysofweek = getDayWeekList(obj.id, language);
		if(data.daysofweek.length === 0) delete data.daysofweek;

		data.unlockrank = obj.limitLevel;
		let rewardpreview = xpreview.find(pre => pre.id === obj.passRewardPreviewID).previewItems.filter(pre => pre.id);
		data.rewardpreview = rewardpreview.map(repre => {
			let mat = xmat.find(m => m.id === repre.id);
			if(mat) { // is material
				let reward = { name: language[mat.nameTextMapHash] };
				if(mat.materialType !== 'MATERIAL_AVATAR_MATERIAL') reward.count = parseInt(repre.count);
				if((getLanguage('EN')[mat.typeDescTextMapHash]).includes('Weapon')) {
					data.domaintype = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_WEAPON_PROMOTE)];
				} else {
					data.domaintype = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_AVATAR_PROUD)];
				}
				return reward;
			} else { // is artifact
				let disp = xdisplay.find(d => d.id === repre.id);
				data.domaintype = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_RELIC)];
				return { name: language[disp.nameTextMapHash], rarity: disp.rankLevel+'' };
			}
		});
		// if(obj.disorderoverride) data.disorder = obj.disorderoverride.map(d => language[d]); // fix not needed anymore
		data.disorder = xdisorder.filter(d => d.id+'' === Object.keys(obj.levelConfigMap)[0]).map(d => language[d.descTextMapHash]).filter(ele => ele !== '' && ele !== undefined);
		data.imagename = obj.entryPicPath;

		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(filename === '') return accum;
		accum[filename] = data;
		return accum;
	}, {});
	return mydomain;
}

// format returned is translated and sorted array ["Monday", "Thursday", "Sunday"]
function getDayWeekList(dungeonId, langmap) {
	const xdailyd = getExcel('DailyDungeonConfigData');
	const mapENtoNum = { 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 7 };
	let mylist = [];
	for(const ele of xdailyd)
		for(const [key, value] of Object.entries(mapENtoNum))
			if(ele[key].includes(dungeonId)) mylist.push(value);
	mylist = mylist.sort((a, b) => a - b);
	return mylist.map(ele => langmap[dayOfWeek(ele)]);
}

module.exports = collateDomain;

// DungeonExcelConfigData
// Each object has duplicate RecommendElementTypes properties :/
// Remove it.
function cleanupDungeonFile() {
	const fs = require('fs');
	let data = fs.readFileSync('../ExcelBinOutput/DungeonExcelConfigData.json', 'utf8');
	data = data.replace(/("RecommendElementTypes"[^\]]*?],[^\]]*?)"RecommendElementTypes".*?],/gs, '$1');
	fs.writeFileSync('../ExcelBinOutput/DungeonExcelConfigData.json', data);
}

// cleanupDungeonFile();

// Fire, Water, Ice, Rock, Electric, Wind, Grass

// not used anymore since it was fixed 2.7
// let moredungeons = [
// { // machine nest 1
// 	Id: 99991,
// 	Type: "DUNGEON_DAILY_FIGHT",
// 	StateType: "DUNGEON_STATE_RELEASE",
// 	NameTextMapHash: 4233644080,
// 	DescTextMapHash: 1269716077,
// 	CityID: 2,
// 	ShowLevel: 59,
// 	RecommendElementTypes: ['Fire', 'Electric', 'Rock', 'Wind'],
// 	LimitLevel: 30,
// 	PassRewardPreviewID: 22443,
// 	EntryPicPath: 'UI_DungeonPic_CycleDungeonChasm',
// 	disorderoverride: [4145618250]
// },
// { // machine nest 2
// 	Id: 99992,
// 	Type: "DUNGEON_DAILY_FIGHT",
// 	StateType: "DUNGEON_STATE_RELEASE",
// 	NameTextMapHash: 1948966872,
// 	DescTextMapHash: 1269716077,
// 	CityID: 2,
// 	ShowLevel: 59,
// 	RecommendElementTypes: ['Fire', 'Electric', 'Rock', 'Wind'],
// 	LimitLevel: 35,
// 	PassRewardPreviewID: 22444,
// 	EntryPicPath: 'UI_DungeonPic_CycleDungeonChasm',
// 	disorderoverride: [4145618250]
// },
// { // machine nest 3
// 	Id: 99993,
// 	Type: "DUNGEON_DAILY_FIGHT",
// 	StateType: "DUNGEON_STATE_RELEASE",
// 	NameTextMapHash: 2797186184,
// 	DescTextMapHash: 1269716077,
// 	CityID: 2,
// 	ShowLevel: 59,
// 	RecommendElementTypes: ['Fire', 'Electric', 'Rock', 'Wind'],
// 	LimitLevel: 40,
// 	PassRewardPreviewID: 22445,
// 	EntryPicPath: 'UI_DungeonPic_CycleDungeonChasm',
// 	disorderoverride: [4145618250]
// },
// { // machine nest 4
// 	Id: 99994,
// 	Type: "DUNGEON_DAILY_FIGHT",
// 	StateType: "DUNGEON_STATE_RELEASE",
// 	NameTextMapHash: 1531297112,
// 	DescTextMapHash: 1269716077,
// 	CityID: 2,
// 	ShowLevel: 59,
// 	RecommendElementTypes: ['Fire', 'Electric', 'Rock', 'Wind'],
// 	LimitLevel: 45,
// 	PassRewardPreviewID: 22446,
// 	EntryPicPath: 'UI_DungeonPic_CycleDungeonChasm',
// 	disorderoverride: [4145618250]
// },
// ];