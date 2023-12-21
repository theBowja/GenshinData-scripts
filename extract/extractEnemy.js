require('./global.js');

const xdungeon = getExcel('DungeonExcelConfigData');
const xpreview = getExcel('RewardPreviewExcelConfigData');
const xdungeonentry = getExcel('DungeonEntryExcelConfigData'); // adventure handbook
const xdisplay = getExcel('DisplayItemExcelConfigData');
const xdisorder = getExcel('DungeonLevelEntityConfigData'); // ley line disorder
const xcity = getExcel('CityConfigData');

const xmonster = getExcel('MonsterExcelConfigData');
const xcodex = getExcel('AnimalCodexExcelConfigData');
const xdescribe = getExcel('MonsterDescribeExcelConfigData');
const xspecial = getExcel('MonsterSpecialNameExcelConfigData');

//xmanualtext
/*
UI_CODEX_ANIMAL_CATEGORY_ELEMENTAL
UI_CODEX_ANIMAL_CATEGORY_HILICHURL
*/

function round(number, decimalplaces) {
	let mult = Math.pow(10, decimalplaces);
	let out = Math.round(number * mult) / mult;
if(out === null) console.log('enemy null resistance rounding');
	return out;
}


function collateEnemy(lang) {
	const language = getLanguage(lang);
	const xmat = getExcel('MaterialExcelConfigData');
	const dupeCheck = {};
	let bossRewardIndex = 0; // spaghetti

	let mymonster = xcodex.reduce((accum, obj) => {
		if(obj.type !== 'CODEX_MONSTER') return accum;
		if(obj.isDisuse) return accum;
		if(obj.Id === 29010101) obj.Id = 29010104; // use correct stormterror
		let mon = xmonster.find(m => m.id === obj.Id);
		if (!mon) return accum;
		let des = xdescribe.find(d => d.id === obj.describeId);
		let spe = xspecial.find(s => s.specialNameLabID === des.specialNameLabID);
		let inv = findInvestigation(obj.Id);
		if(!spe) console.log('no special for '+obj.Id);

		let data = {};
		data.id = obj.Id;

		// data.nameTextMapHash = des.nameTextMapHash;
		data.name = language[des.nameTextMapHash];
		data.specialName = language[spe.specialNameTextMapHash];
		if(inv) {
			data.investigation = {};
			data.investigation.name = language[inv.nameTextMapHash];
			data.investigation.category = language[xmanualtext.find(e => e.textMapId === `INVESTIGATION_${inv.monsterCategory.toUpperCase()}_MONSTER`).textMapContentTextMapHash];
			data.investigation.description = language[inv.descTextMapHash];
			if(language[inv.lockDescTextMapHash] !== "") data.investigation.lockdesc = language[inv.lockDescTextMapHash];
			data.filename_investigationIcon = inv.icon;
			// REWARD PREVIEW
			let rewardpreview = xpreview.find(pre => pre.id === inv.rewardPreviewId).previewItems;
			data.rewardPreviewId = inv.rewardPreviewId;
			data.rewardPreview = mapRewardList(rewardpreview, language);
		} else {
			if (obj.subType === 'CODEX_SUBTYPE_BOSS') {
				let rewardpreview = bossRewardQueue[bossRewardIndex].previewItems;
				data.rewardPreviewId = bossRewardQueue[bossRewardIndex].id;
				data.rewardPreview = mapRewardList(rewardpreview, language);
				bossRewardIndex++;
			}

			if(obj.Id === 20020101) { // Eye of the Storm
				// data.rewardPreviewId = 
				data.rewardPreview = mapRewardList(eyestormreward, language);
			} else if(obj.Id === 21011501) { // Unusual Hilichurl
				data.rewardPreview = mapRewardList(unusualreward, language);
			} else if(obj.Id === 22030101 || obj.Id === 22020101 || obj.Id === 22030201 ||
					  obj.Id === 22020201 ||
				      obj.Id === 26060201 || obj.Id === 26060101 || obj.Id === 26060301) {
				// Abyss Lector: Violet Lightning, Abyss Herald: Wicked Torrents, Abyss Lector: Fathomless Flames
				// Abyss Herald: Frost Fall
				// Hydro Cicin, Electro Cicin, Cryo Cicin
				data.rewardPreview = [];
			} else if(obj.Id === 26050801) { // Bathysmal Vishap twins
				data.rewardPreviewId = 15177;
				let rewardpreview = xpreview.find(pre => pre.id === data.rewardPreviewId).previewItems;
				data.rewardPreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 24070301) { // Icewind Suite
				data.rewardPreviewId = 15190;
				let rewardpreview = xpreview.find(pre => pre.id === data.rewardPreviewId).previewItems;
				data.rewardPreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 22100501) { // Iniquitous Baptist
				data.rewardPreviewId = 15185;
				let rewardpreview = xpreview.find(pre => pre.id === data.rewardPreviewId).previewItems;
				data.rewardPreview = mapRewardList(rewardpreview, language);
			} else if(obj.Id === 24068801 || obj.Id === 24068901 || obj.Id === 24069001 || obj.Id === 24069201) {
				// Assault/Suppression/AnnihilationConstruction Specialist Mek
				data.rewardPreviewId = 16020;
				let rewardpreview = xpreview.find(pre => pre.id === data.rewardPreviewId).previewItems;
				data.rewardPreview = mapRewardList(rewardpreview, language);
			}
		}
		if(!data.rewardPreview) {
			if (lang === 'EN') console.log('no reward list for '+obj.Id+' : '+data.name); 
			data.rewardPreview = [];
		}

		let sub = obj.subType || 'CODEX_SUBTYPE_ELEMENTAL';
		sub = sub.slice(sub.lastIndexOf('_')+1);
		// console.log(obj.Id);
		// console.log(sub);
		sub = xmanualtext.find(m => m.textMapId === `UI_CODEX_ANIMAL_CATEGORY_${sub}`).textMapContentTextMapHash;
		data.enemyType = mon.securityLevel || 'COMMON';
		data.category = language[sub];
		data.filename_icon = des.icon;
		data.description = sanitizeDescription(language[obj.descTextMapHash]);

		data.aggroRange = mon.visionLevel;
		data.bgm = mon.combatBGMLevel;
		data.budget = mon.entityBudgetLevel;

		// particle drops
		let drops = [];
		for(let x of mon.hpDrops) {
			if(x.dropId) drops.push(x.dropId);
		}
		drops.push(mon.killDropId);
		data.drops = drops;

		let stats = {};
		stats.resistance = {};
		stats.resistance.physical = round(mon.physicalSubHurt, 2) || 0;
		stats.resistance.pyro = round(mon.fireSubHurt, 2) || 0;
		stats.resistance.dendro = round(mon.grassSubHurt, 2) || 0;
		stats.resistance.hydro = round(mon.waterSubHurt, 2) || 0;
		stats.resistance.geo = round(mon.rockSubHurt, 2) || 0;
		stats.resistance.anemo = round(mon.windSubHurt, 2) || 0;
		stats.resistance.cryo = round(mon.iceSubHurt, 2) || 0;
		stats.resistance.electro = round(mon.elecSubHurt, 2) || 0;
		stats.base = {};
		stats.base.hp = mon.hpBase;
		stats.base.attack = mon.attackBase;
		stats.base.defense = mon.defenseBase;
		stats.curve = {};
		try {
			// if(obj.Id === 29010101) console.log(mon.propGrowCurves);
			stats.curve.hp = mon.propGrowCurves.find(ele => ele.type === 'FIGHT_PROP_BASE_HP').growCurve;
			stats.curve.attack = mon.propGrowCurves.find(ele => ele.type === 'FIGHT_PROP_BASE_ATTACK').growCurve;
			stats.curve.defense = mon.propGrowCurves.find(ele => ele.type === 'FIGHT_PROP_BASE_DEFENSE').growCurve;
		} catch(e) {
			console.log(obj.Id + " - " + data.name + " - failed PropGrowCurves");
		}

		data.stats = stats;

		let filename = makeFileName(getLanguage('EN')[des.nameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename]) return accum;
		checkDupeName(data, dupeCheck);

		accum[filename] = data;
		return accum;
	}, {});
	return mymonster;
}

// mapping for monsters that don't have rewardlist to use another monster's rewardlist
// FROM missing id TO monster id with rewardlist // Missing Monster Name
const noRewardListMonsterMap = {
	21011601: 21010601, // Electro Hilichurl Grenadier
	21020701: 21020101, // Crackling Axe Mitachurl
	21020801: 21020401, // Thunderhelm Lawachurl
	21030601: 21030101, // Electro Samachurl
	22010401: 22010101, // Electro Abyss Mage
	26010301: 26010201, // Electro Whopperflower
	20060601: 20060201, // Pyro Specter
	20060501: 20060201, // Electro Specter
	20060401: 20060201, // Cryo Specter
	22080101: 22070101, // Black Serpent Knight: Windcutter
	22080201: 22070101, // Black Serpent Knight: Rockbreaker Ax
	25010101: 25010201, // Treasure Hoarders: Liuliu
	25020101: 25010201, // Treasure Hoarders: Raptor
	25030101: 25010201, // Treasure Hoarders: Carmen
	25040101: 25010201, // Treasure Hoarders: Boss
	25050101: 25010201, // Millelith Soldier
	25050201: 25010201, // Millelith Sergeant
	25410201: 25210301, // Eremite Galehunter
	25410101: 25210301, // Eremite Stone Enchanter
	25410301: 25210301, // Eremite Scorching Loremaster
	25410401: 25210301, // Eremite Floral Ring-Dancer
	26090101: 26090201, // Floating Hydro Fungus
	26090301: 26090201, // Floating Anemo Fungus
	26090601: 26090401, // Whirling Pyro Fungus
	26091001: 26090901, // Stretch Electro Fungus
	26120401: 26120301, // Grounded Geoshroom
	26100101: 26100301, // Consecrated Horned Crocodile
	26100201: 26100301, // Consecrated Fanged Beast
	24068101: 24060401, // Recon Log Mek
	24068201: 24060401, // Arithmetic Enhancer Mek
	24068701: 24060401, // Nimble Harvester Mek
	24069101: 24060401, // Area Alert Mek
	24068301: 24060401, // Underwater Survey Mek
	24068501: 24060401, // Underwater Patrol Mek
	24068601: 24060401, // Deepwater Assault Mek

}

// makes sure each monster has a corresponding "investigation" data
function findInvestigation(monId) {
	const xinvest = getExcel('InvestigationMonsterConfigData');
	if(noRewardListMonsterMap[monId]) monId = noRewardListMonsterMap[monId];
	return xinvest.find(i => i.monsterIdList.includes(monId));
}

function mapRewardList(rewardlist, language) {
	const xmat = getExcel('MaterialExcelConfigData');
	const xdisplay = getExcel('DisplayItemExcelConfigData');
	return rewardlist.filter(pre => pre.id).map(repre => {
		let mat = xmat.find(m => m.id === repre.id);
		if(mat) { // is material
			let reward = { id: mat.id, name: language[mat.nameTextMapHash] };
			if(repre.count && repre.count !== "") reward.count = parseFloat(repre.count);
			return reward;
		} else { // is artifact
			let disp = xdisplay.find(d => d.id === repre.id);
			return { id: disp.id, name: language[disp.nameTextMapHash], rarity: disp.rankLevel };
		}
	});
}

const eyestormreward = [
    {
        "id": 202
    },
    {
        "id": 400022
    },
    {
        "id": 400032
    },
    {
        "id": 400042
    },
    {
        "id": 400062
    },
    {
        "id": 400023
    },
    {
        "id": 400033
    },
    {
        "id": 400043
    }
];

const unusualreward = [
	{
		"id": 102 // Adventure EXP
	},
    {
        "id": 202 // Mora
    },
    {
    	"id": 100018// Cabbage
    }
]

// the reward list for bosses is not mapped so i'll have to figure it out myself
let bossRewardIndex = 0;
const bossRewardQueue = getBossRewardQueue();
function getBossRewardQueue() {
	let matidmap = {};

	let bossrewardlists = xpreview.filter(obj => {
		// filter by dream solvent
		if (!obj.Desc.endsWith('_90级') || !obj.previewItems.some(item => item.id === 113021)) return false;

		const matid = obj.previewItems[obj.previewItems.findIndex(item => item.id === 113021)+1].id;
		if (matidmap[matid]) return false; // filter out lists with same drops we already looked at (for example Azhdaha has multiple reward lists)

		matidmap[matid] = true;

		return true; 
	});

	return bossrewardlists;
}

// commented out because this issue has been fixed
// use id: 21010101
// function fixAnimalCodexSubType() {
// 	const fs = require('fs');
// 	let obfu = require('../[Obfuscated] ExcelBinOutput/AnimalCodexExcelConfigData.json');
// 	let out = require('../ExcelBinOutput/AnimalCodexExcelConfigData.json');
// 	for(let ob of obfu) {
// 		let match = out.find(ele => ele.id === ob.KABAHENDGOO); // replace with ID
// 		match.subType = ob.JKOLEMPKHMI; // replace with CODEX_SUBTYPE_HILICHURL
// 	}
// 	// manual fixes for 2.6 update
// 	out.find(ele => ele.Id === 22080101).subType = "CODEX_SUBTYPE_ABYSS";
// 	out.find(ele => ele.Id === 24010401).subType = "CODEX_SUBTYPE_AUTOMATRON";
// 	out.find(ele => ele.Id === 26090101).subType = "CODEX_SUBTYPE_BEAST";

// 	out = JSON.stringify(out, null, '\t');
// 	fs.writeFileSync('../ExcelBinOutput/AnimalCodexExcelConfigData.json', out);
// }
// fixAnimalCodexSubType();

// commented out because this issue has been fixed
// function fixInvestigationMonsterList() {
// 	const fs = require('fs');
// 	let obfu = require('../[Obfuscated] ExcelBinOutput/InvestigationMonsterConfigData.json');
// 	let out = require('../ExcelBinOutput/InvestigationMonsterConfigData.json');

// 	for(let ob of obfu) {
// 		let match = out.find(ele => ele.id === ob.JNAAGOAENLE); // replace with ID
// 		match.monsterIdList = ob.ENEMLKMDNFJ; // replace with CODEX_SUBTYPE_HILICHURL
// 	}

// 	out = JSON.stringify(out, null, '\t');
// 	fs.writeFileSync('../ExcelBinOutput/InvestigationMonsterConfigData.json', out);
// }
// fixInvestigationMonsterList();

module.exports = collateEnemy;
