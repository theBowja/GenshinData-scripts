require('./globalTcg.js');
const config = require('../config.json');

const xmat = getExcel('MaterialExcelConfigData');
const xchar = getExcel('GCGCharExcelConfigData');
const xskill = getExcel('GCGSkillExcelConfigData');
const xskilltag = getExcel('GCGSkillTagExcelConfigData');
const xdeckcard = getExcel('GCGDeckCardExcelConfigData');
const xtag = getExcel('GCGTagExcelConfigData');
const xcardview = getExcel('GCGCardViewExcelConfigData');
const xavatar = getExcel('AvatarExcelConfigData');

const propMaxEnergy = getPropNameWithMatch(xchar, 'id', 1101, 3);
const propPlayable = getPropNameWithMatch(xchar, 'id', 1101, true);
const propEnemy = getPropNameWithMatch(xchar, 'id', 3202, true);
const propTags = getPropNameWithMatch(xchar, 'id', 1101, 'GCG_TAG_ELEMENT_CRYO');
const propSwitch = getPropNameWithMatch(xchar, 'id', 1101, 'Switch_Ganyu');

const propSkillKey = getPropNameWithMatch(xskill, 'Id', 11011, 'Effect_Damage_Physic_2');
const propSkillType = getPropNameWithMatch(xskill, 'Id', 11011, 'GCG_SKILL_TAG_A');
const propSkillCost = Object.entries(xskill.find(e => e.Id === 11011)).find(([k, v]) => Array.isArray(v) && v[0].count)[0];
const propSkillCostDice = Object.entries(xskill.find(e => e.Id === 11011)[propSkillCost][0]).find(([k, v]) => v === 'GCG_COST_DICE_CRYO')[0];

const propShareId = getPropNameWithMatch(xdeckcard, 'id', 1101, 1);
const propStoryText = getPropNameWithMatch(xdeckcard, 'id', 1101, 753619631);
const propCharacterSource = getPropNameWithMatch(xdeckcard, 'id', 1101, 142707039);

const propCardFace = getPropNameWithMatch(xcardview, 'id', 1101, 'Gcg_CardFace_Char_Avatar_Ganyu');

const tcgSkillKeyMap = loadTcgSkillKeyMap();
// const checkBaseDamageIgnoreLog = ['Char_Skill_11013', 'Char_Skill_13012', 'Char_Skill_16013', 'Char_Skill_22014', 'Char_Skill_13073', ''];

const skipdupelog = [2602]; // Azhdaha
function collate(lang, doEnemy=false) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let includeTfs = [];
	let mydata = xchar.reduce((accum, obj) => {
		if (obj.skillList.includes(80)) return accum;
		if (!includeTfs.includes(obj.id)) {
			if (doEnemy && !obj[propEnemy]) return accum; // enemy cards only
			if (!doEnemy && !obj[propPlayable]) return accum; // playable characters cards only
		}
		const deckcardObj = xdeckcard.find(e => e.id === obj.id);

		let isWanderer = false;

		let data = {};
		data.id = obj.id;

		if (language[obj.nameTextMapHash].includes('ID(1)')) isWanderer = true;

		if (isWanderer) {
			data.name = sanitizeName(language[getWandererNameTextMapHash()]);
		} else {
			data.name = sanitizeName(language[obj.nameTextMapHash]);
		}

		if (deckcardObj) data.shareid = deckcardObj[propShareId];
		if (data.id === data.shareid) console.log(`tcg character card ${deck.id} has same shareid`);

		if (tfMap[obj.id] !== undefined) {
			data.transformsinto = tfMap[obj.id];
			includeTfs = includeTfs.concat(tfMap[obj.id]);
		}
		if (tfList.includes(obj.id)) {
			data.istransformation = true; 
		}

		data.hp = obj.hp;
		data.maxenergy = obj[propMaxEnergy];

		data.tags = obj[propTags].filter(e => e !== 'GCG_TAG_NONE');
		data.tagstext = data.tags.map(tag => language[xtag.find(e => e.type === tag).nameTextMapHash]);
		data.filename_tagsicon = data.tags.map(tag => getTcgTagImage(tag));
		// data.element = language[xtag.find(e => e.type === data.tags[0]).nameTextMapHash];
		// data.weapon = language[xtag.find(e => e.type === data.tags[1]).nameTextMapHash];
		// data.nation = language[xtag.find(e => e.type === data.tags[2]).nameTextMapHash];

		if (obj[propPlayable]) {
			data.storytitle = language[deckcardObj.storyTitleTextMapHash];
			data.storytext = sanitizeDescription(language[deckcardObj[propStoryText]]);
			data.source = language[deckcardObj[propCharacterSource]];
		}

		data.skills = [];
		for (const skillId of obj.skillList) {
			const skillObj = xskill.find(e => e.Id === skillId);
			const stypetag = skillObj[propSkillType][0]
			// if (stypetag === 'GCG_SKILL_TAG_NONE') continue; // i have no idea what these skills are but they dont seem to be important

			const skill = {};
			skill.id = skillId;
			skill.name = language[skillObj.nameTextMapHash] || ''; 
			if (skillId !== 23035) skill.name = sanitizeName(skill.name); // that one random _none skill has undefined skill name
			skill.descriptionraw = language[skillObj.descTextMapHash];
			if (skill.descriptionraw === undefined) skill.descriptionraw = ''; // tartaglia Ranged Stance is missing description. im too lazy to figure this out
			if (tcgSkillKeyMap[skillObj[propSkillKey]]) {
				// console.log(skill)
				if (skill.descriptionraw.includes('D__KEY__DAMAGE')) {
					skill.basedamage = tcgSkillKeyMap[skillObj[propSkillKey]].basedamage;
				}
				if (skill.descriptionraw.includes('D__KEY__ELEMENT')) {
					skill.baseelement = tcgSkillKeyMap[skillObj[propSkillKey]].baseelement;
				}
			}
			skill.descriptionreplaced = getDescriptionReplaced(skill, skill.descriptionraw, language, skillObj[propSkillKey]);
			skill.description = sanitizeDescription(skill.descriptionreplaced, true);
			skill.typetag = stypetag;
			if (skill.typetag === 'GCG_SKILL_TAG_NONE')
				skill.type = '';
			else
				skill.type = language[xskilltag.find(e => e.type === skill.typetag).nameTextMapHash];
			if (skillObj[propSkillType][1] !== "GCG_SKILL_TAG_NONE") console.log(`tcg character skill ${skillId} ${skill.name} does not have a second skill tag of NONE`);

			skill.playcost = skillObj[propSkillCost].filter(e => e.count).map(e => ({ costtype: e[propSkillCostDice], count: e.count }));

			data.skills.push(skill);
		}

		// IMAGE
		const cardface = xcardview.find(e => e.id === obj.id)[propCardFace]; // example: Gcg_CardFace_Char_Avatar_Qin
		const imagebase = cardface.substring(cardface.lastIndexOf('_')+1); // example: Ganyu

		data.filename_cardface = `UI_${cardface}`;
		data.filename_cardface_golden = `UI_${cardface}_Golden`;
		data.filename_cardface_HD = `UI_${cardface}_HD`;
		let parts = cardface.split('_');
		parts.splice(1, 1); // remove CardFace
		parts[2] = parts[2]+'Icon';
		data.filename_icon = `UI_${parts.join('_')}`;

		let filename;
		if ([6601, 6602, 6603, 6604].includes(obj.id)) { // if Azhdaha clones, then give better filename
			filename = getAzhdahaFilename(obj);
			if(filename === '') return accum;
			if(accum[filename] !== undefined) console.log(`ERROR: tcg character cards this Azhdaha element clone already exists`);
		} else {
			filename = makeUniqueFileName(isWanderer ? getWandererNameTextMapHash() : obj.nameTextMapHash, accum);
			if(filename === '') return accum;
		}
		checkDupeName(data, dupeCheck, skipdupelog, doEnemy);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name}`);

		return accum;
	}, {});

	return mydata;
}

function getWandererNameTextMapHash() {
	return nameHashWanderer = xavatar.find(ele => ele.id === 10000075).nameTextMapHash;
}

function getAzhdahaFilename(obj) {
	let name = getLanguage('EN')[obj.nameTextMapHash];
	if (name === "" || name === undefined) return "";
	let filename = makeFileName(name);
	if (obj.id === 6601) return `${filename}-cryo`;
	else if (obj.id === 6602) return `${filename}-hydro`;
	else if (obj.id === 6603) return `${filename}-pyro`;
	else if (obj.id === 6604) return `${filename}-electro`;
}

/**
* Some characters cards can transform into a different character card which usually has different tags, skills, and images.
*   Example: Signora and Azhdaha.
* We can use image names to map characters to their different transformation targets that have the same hp and same playable/enemy tag.
*   Example: UI_Gcg_CardFace_Char_Monster_Dahaka to ...DahakaElec, ...DahakaFire, ...DahakaIce, etc.
* It's not foolproof but it's the best way I've got to do this automatically.
*
* Note: Hili does not actually transform into HiliClub or HiliElectric.
* Note: Pneuma/Ousia enemies transform into their base version and must be reversed.
*/
let tfMap = {}; // mapping from base card ids to a list of their transformed card ids. see below this function
let tfList = []; // list of transformed card ids
function buildTransformationMap() {
	const language = getLanguage('EN');
	const data = xchar.filter(obj => !obj.skillList.includes(80)).map(obj => {
		const cardface = xcardview.find(e => e.id === obj.id)[propCardFace]; // example: Gcg_CardFace_Char_Avatar_Qin
		const imagebase = cardface.substring(cardface.lastIndexOf('_')+1); // example: Ganyu

		const hasArkhe = obj.skillList.some(skillId => {
			const skillObj = xskill.find(e => e.Id === skillId);
			const description = language[skillObj.descTextMapHash];
			return description && description.includes('[K1014]'); // K1014, enemy can be Deactivated
		});

		return {
			id: obj.id,
			name: language[obj.nameTextMapHash],
			enemy: obj[propEnemy],
			arkhe: hasArkhe, // boolean
			playable: obj[propPlayable],
			hp: obj.hp,
			imagebase: imagebase
		}
	});

	// build the transformation map and list
	for (let base of data) {
		for (let target of data) {
			if (base.imagebase === 'Hili') continue; // skip hilichurls

			if (base.imagebase !== target.imagebase &&
				target.imagebase.startsWith(base.imagebase) &&
				base.hp === target.hp &&
				base.enemy === target.enemy) {

				// if base is Pneuma/Ousia, then we must reverse the mapping
				if (target.arkhe) {
					if (tfMap[target.id] === undefined) tfMap[target.id] = [];
					tfMap[target.id].push(base.id);
					tfList.push(base.id);
				} else {
					if (tfMap[base.id] === undefined) tfMap[base.id] = [];
					tfMap[base.id].push(target.id);
					tfList.push(target.id);
				}
			}
		}
	}
	tfList = tfList.sort();
}
buildTransformationMap();

// sanity checking tfList
const correctTfList = '3006,3006,3007,3007,6301,6302,6303,6304,6601,6602,6603,6604';
if (correctTfList !== tfList.sort()+'') {
	console.log(`WARNING: tcg character/enemy cards has an unverified transformation-exclusive card`);
	console.log('new tfMap:');
	console.log(tfMap);
	console.log(tfList.sort()+'');
}
/*
tfMap = {
  '2102': [ 6301 ], // signora character
  '2602': [ 6601, 6602, 6603, 6604 ], // azdahah character
  '3307': [ 3006 ], // pneuma enemy
  '3308': [ 3007 ], // ousia enemy
  '3408': [ 3006 ], // pneuma enemy
  '3704': [ 3007 ], // ousia enemy
  '4103': [ 6302 ], // signora boss 35 hp
  '4104': [ 6303 ], // signora boss 50 hp
  '4105': [ 6304 ] // signora enemy
}
*/

module.exports = collate;