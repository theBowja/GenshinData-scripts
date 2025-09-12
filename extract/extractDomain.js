require('./global.js');

let xdungeon = getExcel('DungeonExcelConfigData');
const xpreview = getExcel('RewardPreviewExcelConfigData');
const xdungeonentry = getExcel('DungeonEntryExcelConfigData'); // adventure handbook
const xdisplay = getExcel('DisplayItemExcelConfigData');
const xdisorder = getExcel('DungeonLevelEntityConfigData'); // ley line disorder
const xcity = getExcel('CityConfigData');

const xmonster = getExcel('MonsterExcelConfigData');
const xcodex = getExcel('AnimalCodexExcelConfigData');
const xdescribe = getExcel('MonsterDescribeExcelConfigData');

// something inside ManualTextMapConfigData
const domainType = {
	UI_ABYSSUS_RELIC: "UI_ABYSSUS_RELIC",
	UI_ABYSSUS_WEAPON_PROMOTE: "UI_ABYSSUS_WEAPON_PROMOTE",
	UI_ABYSSUS_AVATAR_PROUD: "UI_ABYSSUS_AVATAR_PROUD"
}
function getDomainTypeTextMapHash(domaintype) {
	return xmanualtext.find(ele => ele.textMapId === domaintype).textMapContentTextMapHash;
}
function mapping(textmapid) { return xmanualtext.find(ele => ele.textMapId === textmapid).textMapContentTextMapHash; }

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
"UI_DUNGEON_ENTRY_803", // "Molten Iron Fortress"
"UI_DUNGEON_ENTRY_1142", // "Waterfall Wen"
"UI_DUNGEON_ENTRY_1151", // "Faded Theater"
"UI_DUNGEON_ENTRY_1186", // "Blazing Ruins"
"UI_DUNGEON_ENTRY_1188", // "Ancient Watchtower"
"UI_DUNGEON_ENTRY_1190", // "Sanctum of Rainbow Spirits"
"UI_DUNGEON_ENTRY_1191", // "Derelict Masonry Dock"
*/
function getDomainEntranceTextMapId(englishname, levelConfigMap) {
	englishname = englishname.toLowerCase();

	if(englishname.includes('dance of steel'))
		return "UI_DUNGEON_ENTRY_27";
	else if(englishname.includes('city of reflections') || englishname.includes('submerged valley') || englishname.includes('ruins of thirsting capital'))
		return "UI_DUNGEON_ENTRY_37";
	else if(englishname.includes('frosted altar') || englishname.includes('frozen abyss') || englishname.includes('realm of slumber'))
		return "UI_DUNGEON_ENTRY_29";
	else if(englishname.includes('fires of purification'))
		return "UI_DUNGEON_ENTRY_35";
	else if(englishname.includes('altar of flames') || englishname.includes('heart of the flames') || englishname.includes('circle of embers'))
		return "UI_DUNGEON_ENTRY_46";
	else if(englishname.includes('spring'))
		return "UI_DUNGEON_ENTRY_48";
	else if(englishname.includes('stone chamber'))
		return "UI_DUNGEON_ENTRY_50";
	else if(englishname.includes('thundercloud altar') || englishname.includes('thundering ruins') || englishname.includes('trial grounds of thunder'))
		return "UI_DUNGEON_ENTRY_52";
	else if(englishname.includes('roaring fire'))
		return "UI_DUNGEON_ENTRY_54";
	else if(englishname.includes('unyielding'))
		return "UI_DUNGEON_ENTRY_282";
	else if(englishname.includes('elegiac rime'))
		return "UI_DUNGEON_ENTRY_221";
	else if(englishname.includes('autumn hunt'))
		return "UI_DUNGEON_ENTRY_361";
	else if(englishname.includes('reign of violet') || englishname.includes('thundering valley') || englishname.includes('vine-infested ruins'))
		return "UI_DUNGEON_ENTRY_310";
	else if(englishname.includes('sunken sands') || englishname.includes('altar of sands') || englishname.includes('sand burial'))
		return "UI_DUNGEON_ENTRY_368";
	else if(englishname.includes('necropolis'))
		return "UI_DUNGEON_ENTRY_433";
	else if(englishname.includes('machine nest'))
		return "UI_DUNGEON_ENTRY_516";
	else if(englishname.includes('seven sense'))
		return "UI_DUNGEON_ENTRY_507";
	else if(englishname.includes('full moon') || englishname.includes('witticism') || englishname.includes('basket of'))
		return "UI_DUNGEON_ENTRY_505";
	else if(englishname.includes('tainted cloud') || englishname.includes('leading karma') || englishname.includes('obsession'))
		return "UI_DUNGEON_ENTRY_509";
	else if(englishname.includes('desert citadel'))
		return "UI_DUNGEON_ENTRY_758";
	else if(englishname.includes('forsaken rampart'))
		return "UI_DUNGEON_ENTRY_803";
	else if(englishname.includes('rhyming rhythm') || englishname.includes('admonishing engraving') || englishname.includes('chiming recitation'))
		return "UI_DUNGEON_ENTRY_865";
	else if(englishname.includes('robotic ruse') || englishname.includes('artisanship') || englishname.includes('curious contraptions'))
		return "UI_DUNGEON_ENTRY_859";
	else if(englishname.includes('harmony'))
		return "UI_DUNGEON_ENTRY_982";
	else if(englishname.includes('crumbling assembly'))
		return "UI_DUNGEON_ENTRY_1142";
	else if(englishname.includes('variation'))
		return "UI_DUNGEON_ENTRY_1151";
	else if(englishname.includes('sublime turning') || englishname.includes('myriad illusions') || englishname.includes('return'))
		return "UI_DUNGEON_ENTRY_1186";
	else if(englishname.includes('scrying shadows') || englishname.includes('attentive observation') || englishname.includes('estimation'))
		return "UI_DUNGEON_ENTRY_1188";
	else if(englishname.includes('the burning gauntlet'))
		return "UI_DUNGEON_ENTRY_1190";
	else if(englishname.includes('deepfire construct'))
		return "UI_DUNGEON_ENTRY_1191";
	else if(englishname.includes('fallen city') || englishname.includes('shadowed legacy') || englishname.includes('overturned roost'))
		return "UI_DUNGEON_ENTRY_1690";
	else if(englishname.includes('derivations from the deep'))
		return "UI_DUNGEON_ENTRY_1692";
	else if(englishname.includes('radiant splendor') || englishname.includes('prayers sung') || englishname.includes('lunar oblation'))
		return "UI_DUNGEON_ENTRY_1694";
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
		const levelConfigMap = Object.keys(obj.levelConfigMap)[0];
		let entranceTextMapId = getDomainEntranceTextMapId(getLanguage('EN')[obj.nameTextMapHash], levelConfigMap);
		data.entranceId = parseInt(entranceTextMapId.slice(entranceTextMapId.lastIndexOf('_')+1));
		data.entranceName = language[mapping(entranceTextMapId)];// obj.entryPicPath;
		data.description = sanitizeDescription(language[obj.descTextMapHash]);

		// CITY FIX // fix no longer needed 2.7
		// if(obj.id === 5120 || obj.id === 5121 || obj.id === 5122 || obj.id === 5123) obj.cityID = 1; // Peak of Vindagnyr region fix from Liyue to Mondstadt
		// if(obj.id >= 5258 && obj.id <= 5265) obj.cityID = 2; // Taishan Mansion in Liyue
		// if(obj.id >= 5214 && obj.id <= 5225) obj.cityID = 2; // Hidden Palace of Lianshan Formula in Liyue
		// if(obj.id >= 5200 && obj.id <= 5207) obj.cityID = 3; // Slumbering Court in Inazuma, and Momiji-Dyed Court
		if(obj.id >= 4310 && obj.id <= 4313) obj.cityID = 1; // "Cecilia Garden"
		if(obj.id >= 4330 && obj.id <= 4333) obj.cityID = 1; // "Cecilia Garden"
		if(obj.id >= 4320 && obj.id <= 4323) obj.cityID = 1; // "Cecilia Garden"

		data.regionId = obj.cityID;
		data.regionName = language[xcity.find(city => city.cityId === obj.cityID)[getCityNameTextMapHash()]];

		data.recommendedLevel = obj.showLevel;
		if(typeof obj.recommendElementTypes[0] === 'string')
			data.recommendedElements = obj.recommendElementTypes.filter(ele => ele !== 'None').map(ele => language[xmanualtext.find(man => man.textMapId === ele).textMapContentTextMapHash]);
		data.daysOfWeek = getDayWeekList(obj.id, language);
		if(data.daysOfWeek.length === 0) delete data.daysOfWeek;

		data.unlockRank = obj.limitLevel;
		let rewardpreview = xpreview.find(pre => pre.id === obj.passRewardPreviewID).previewItems.filter(pre => pre.id);
		data.rewardPreview = rewardpreview.map(repre => {
			let mat = xmat.find(m => m.id === repre.id);
			if(mat) { // is material
				let reward = { id: mat.id, name: language[mat.nameTextMapHash] };
				if(mat.materialType !== 'MATERIAL_AVATAR_MATERIAL') reward.count = parseInt(repre.count);
				if((getLanguage('EN')[mat.typeDescTextMapHash]).includes('Weapon')) {
					data.domainType = domainType.UI_ABYSSUS_WEAPON_PROMOTE;
					data.domainText = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_WEAPON_PROMOTE)];
				} else {
					data.domainType = domainType.UI_ABYSSUS_AVATAR_PROUD;
					data.domainText = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_AVATAR_PROUD)];
				}
				return reward;
			} else { // is artifact
				let disp = xdisplay.find(d => d.id === repre.id);
				data.domainType = domainType.UI_ABYSSUS_RELIC;
				data.domainText = language[getDomainTypeTextMapHash(domainType.UI_ABYSSUS_RELIC)];
				return { id: disp.id, name: language[disp.nameTextMapHash], rarity: disp.rankLevel };
			}
		});
		// if(obj.disorderoverride) data.disorder = obj.disorderoverride.map(d => language[d]); // fix not needed anymore
		data.disorder = xdisorder.filter(d => d.id+'' === Object.keys(obj.levelConfigMap)[0]).map(d => language[d.descTextMapHash]).filter(ele => ele !== '' && ele !== undefined);
		
		data.monsterList = obj.previewMonsterList.map(monId => {
			let monObj = xmonster.find(e => e.id === monId);
			let des = xdescribe.find(d => d.id === monObj.describeId);
			return {
				id: xcodex.find(e => e.describeId === monObj.describeId).id, // get codex id
				name: language[des.nameTextMapHash],
			}
		});

		data.filename_image = obj.entryPicPath;

		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(filename === '') return accum;
		accum[filename] = data;
		return accum;
	}, {});
	return mydomain;
}

let cityNameTextMapHash = undefined;
function getCityNameTextMapHash() {
	if(cityNameTextMapHash !== undefined) return cityNameTextMapHash;
	for (let [key, value] of Object.entries(xcity[0])) {
		if (typeof value === 'number' && getLanguage('EN')[value] === 'Mondstadt') {
			cityNameTextMapHash = key;
			return cityNameTextMapHash;
		}
	}
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