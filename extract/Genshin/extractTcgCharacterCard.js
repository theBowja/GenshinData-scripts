require('./globalTcg.js');
const config = require('../../config.json');

const xmat = getExcel('MaterialExcelConfigData');
const xchar = getExcel('GCGCharExcelConfigData');
const xskill = getExcel('GCGSkillExcelConfigData');
const xskilltag = getExcel('GCGSkillTagExcelConfigData');
const xdeckcard = getExcel('GCGDeckCardExcelConfigData');
const xtag = getExcel('GCGTagExcelConfigData');
const xcardview = getExcel('GCGCardViewExcelConfigData');

const propMaxEnergy = getPropNameWithMatch(xchar, 'id', 1101, 3);
const propPlayable = getPropNameWithMatch(xchar, 'id', 1101, true);
const propEnemy = getPropNameWithMatch(xchar, 'id', 3202, true);
const propTags = getPropNameWithMatch(xchar, 'id', 1101, 'GCG_TAG_ELEMENT_CRYO');
const propSwitch = getPropNameWithMatch(xchar, 'id', 1101, 'Switch_Ganyu');

const propSkillKey = getPropNameWithMatch(xskill, 'Id', 11011, 'Effect_Damage_Physic_2');
const propSkillType = getPropNameWithMatch(xskill, 'Id', 11011, 'GCG_SKILL_TAG_A');
const propSkillCost = Object.entries(xskill.find(e => e.Id === 11011)).find(([k, v]) => Array.isArray(v) && v[0].count)[0];
const propSkillCostDice = Object.entries(xskill.find(e => e.Id === 11011)[propSkillCost][0]).find(([k, v]) => v === 'GCG_COST_DICE_CRYO')[0];

const propStoryText = getPropNameWithMatch(xdeckcard, 'id', 1101, 753619631);
const propCharacterSource = getPropNameWithMatch(xdeckcard, 'id', 1101, 142707039);

const propCardFace = getPropNameWithMatch(xcardview, 'id', 1101, 'Gcg_CardFace_Char_Avatar_Ganyu');

const tcgSkillKeyMap = loadTcgSkillKeyMap();
// const checkBaseDamageIgnoreLog = ['Char_Skill_11013', 'Char_Skill_13012', 'Char_Skill_16013', 'Char_Skill_22014', 'Char_Skill_13073', ''];

const skipdupelog = [];
function collate(lang, doEnemy=false) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xchar.reduce((accum, obj) => {
		if (obj.skillList.includes(80)) return accum;
		if (doEnemy && !obj[propEnemy]) return accum;
		if (!doEnemy && !obj[propPlayable]) return accum;

		let data = {};
		data.id = obj.id;

		data.name = sanitizeName(language[obj.nameTextMapHash]);
		data.hp = obj.hp;
		data.maxenergy = obj[propMaxEnergy];

		data.tags = obj[propTags].filter(e => e !== 'GCG_TAG_NONE');
		data.tagstext = data.tags.map(tag => language[xtag.find(e => e.type === tag).nameTextMapHash]);
		data.filename_tagsicon = data.tags.map(tag => getTcgTagImage(tag));
		// data.element = language[xtag.find(e => e.type === data.tags[0]).nameTextMapHash];
		// data.weapon = language[xtag.find(e => e.type === data.tags[1]).nameTextMapHash];
		// data.nation = language[xtag.find(e => e.type === data.tags[2]).nameTextMapHash];

		const deckcardObj = xdeckcard.find(e => e.id === obj.id);
		if (obj[propPlayable]) {
			data.storytitle = language[deckcardObj.storyTitleTextMapHash];
			data.storytext = sanitizeDescription(language[deckcardObj[propStoryText]]);
			data.source = language[deckcardObj[propCharacterSource]];
		}

		data.skills = [];
		for (const skillId of obj.skillList) {
			const skillObj = xskill.find(e => e.Id === skillId);
			const skill = {};
			skill.id = skillId;
			skill.name = sanitizeName(language[skillObj.nameTextMapHash]);
			skill.descriptionraw = language[skillObj.descTextMapHash];
			if (skill.descriptionraw === undefined) skill.descriptionraw = ''; // tartaglia Ranged Stance is missing description. im too lazy to figure this out
			if (tcgSkillKeyMap[skillObj[propSkillKey]]) {
				// console.log(skill)
				if (skill.descriptionraw.includes('D__KEY__DAMAGE')) {
					// const dmglistnums = tcgSkillKeyMap[skillObj[propSkillKey]].filter(e => e.$type === tcgSkillKeyMap.DAMAGE).map(e => e.value);
					// console.log(tcgSkillKeyMap[skillObj[propSkillKey]].find(e => e.hash === '-2060930438').value);
					// if (dmglistnums.length > 1 && !checkBaseDamageIgnoreLog.includes(skillObj[propSkillKey])) console.log(`Tcg character skill ${skillId}: Check base damage for ` + skillObj[propSkillKey])
					// skill.basedamage = Math.min(...dmglistnums);
					skill.basedamage = tcgSkillKeyMap[skillObj[propSkillKey]].find(e => e.hash === '-2060930438')[tcgSkillKeyMap.DAMAGEVALUEPROP];
				}
				if (skill.descriptionraw.includes('D__KEY__ELEMENT')) {
					// console.log(skill.descriptionraw);
					skill.baseelement = tcgSkillKeyMap[skillObj[propSkillKey]].find(e => e.$type === tcgSkillKeyMap.ELEMENTTYPE)?.[tcgSkillKeyMap.ELEMENTVALUEPROP] || 'GCG_ELEMENT_NONE';
				}
			}
			skill.descriptionreplaced = getDescriptionReplaced(skill, skill.descriptionraw, language);
			skill.description = sanitizeDescription(skill.descriptionreplaced, true);
			skill.typetag = skillObj[propSkillType][0];
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

		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog, doEnemy);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name}`);

		return accum;
	}, {});

	return mydata;
}




module.exports = collate;