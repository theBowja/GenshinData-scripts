require('./global.js');
const config = require('../config.json');

const xmat = getExcel('MaterialExcelConfigData');
const xchar = getExcel('GCGCharExcelConfigData');
const xskill = getExcel('GCGSkillExcelConfigData');
const xskilltag = getExcel('GCGSkillTagExcelConfigData');
const xelement = getExcel('GCGElementExcelConfigData');
const xkeyword = getExcel('GCGKeywordExcelConfigData');
const xcard = getExcel('GCGCardExcelConfigData');
const xdeckcard = getExcel('GCGDeckCardExcelConfigData');
const xtag = getExcel('GCGTagExcelConfigData');
const xcardview = getExcel('GCGCardViewExcelConfigData');

const propMaxEnergy = getPropNameWithMatch(xchar, 'id', 1101, 2);
const propPlayable = getPropNameWithMatch(xchar, 'id', 1101, true);
const propTags = getPropNameWithMatch(xchar, 'id', 1101, 'GCG_TAG_ELEMENT_CRYO');
const propSwitch = getPropNameWithMatch(xchar, 'id', 1101, 'Switch_Ganyu');

const propSkillKey = getPropNameWithMatch(xskill, 'Id', 11011, 'Effect_Damage_Physic_2');
const propSkillType = getPropNameWithMatch(xskill, 'Id', 11011, 'GCG_SKILL_TAG_A');
const propSkillCost = Object.entries(xskill.find(e => e.Id === 11011)).find(([k, v]) => Array.isArray(v) && v[0].count)[0];
const propSkillCostDice = Object.entries(xskill.find(e => e.Id === 11011)[propSkillCost][0]).find(([k, v]) => v === 'GCG_COST_DICE_CRYO')[0];

const propKeywordId = getPropNameWithMatch(xelement, 'type', 'GCG_ELEMENT_CRYO', 101);

const propStoryText = getPropNameWithMatch(xdeckcard, 'id', 1101, 753619631);
const propCharacterSource = getPropNameWithMatch(xdeckcard, 'id', 1101, 142707039);

const propCardFace = getPropNameWithMatch(xcardview, 'id', 1101, 'Gcg_CardFace_Char_Avatar_Ganyu');

const tcgSkillKeyMap = loadTcgSkillKeyMap();
const checkBaseDamageIgnoreLog = ['Char_Skill_11013', 'Char_Skill_13012', 'Char_Skill_16013', 'Char_Skill_22014'];

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xchar.reduce((accum, obj) => {
		if (!obj[propPlayable]) return accum;
		let data = {};
		data.id = obj.id;

		data.name = language[obj.nameTextMapHash];
		data.hp = obj.hp;
		data.maxenergy = obj[propMaxEnergy];

		data.tags = obj[propTags].filter(e => e !== 'GCG_TAG_NONE');
		data.element = language[xtag.find(e => e.type === data.tags[0]).nameTextMapHash];
		data.weapon = language[xtag.find(e => e.type === data.tags[1]).nameTextMapHash];
		data.nation = language[xtag.find(e => e.type === data.tags[2]).nameTextMapHash];

		const deckcardObj = xdeckcard.find(e => e.id === obj.id);
		data.storytitle = language[deckcardObj.storyTitleTextMapHash];
		data.storytext = sanitizeDescription(language[deckcardObj[propStoryText]]);
		data.source = language[deckcardObj[propCharacterSource]];

		data.skills = [];
		for (const skillId of obj.skillList) {
			const skillObj = xskill.find(e => e.Id === skillId);
			const skill = {};
			skill.id = skillId;
			skill.name = language[skillObj.nameTextMapHash];
			skill.descriptionraw = language[skillObj.descTextMapHash];
			if (tcgSkillKeyMap[skillObj[propSkillKey]]) {
				if (skill.descriptionraw.includes('D__KEY__DAMAGE')) {
					const dmglistnums = tcgSkillKeyMap[skillObj[propSkillKey]].filter(e => e.$type === 'GCGDeclaredValueDamage').map(e => e.value);
					if (dmglistnums.length > 1 && !checkBaseDamageIgnoreLog.includes(skillObj[propSkillKey])) console.log('Tcg character skill: Check base damage for ' + skillObj[propSkillKey])
					skill.basedamage = Math.min(...dmglistnums);
				}
				if (skill.descriptionraw.includes('D__KEY__ELEMENT'))
					skill.baseelement = tcgSkillKeyMap[skillObj[propSkillKey]].find(e => e.$type === 'GCGDeclaredValueElement').ratio || 'GCG_ELEMENT_NONE';
			}
			skill.descriptionreplaced = getDescriptionRare(skill, skill.descriptionraw, skillObj[propSkillKey], language);
			skill.description = sanitizeDescription(skill.descriptionreplaced);
			skill.typetag = skillObj[propSkillType][0];
			skill.type = language[xskilltag.find(e => e.type === skill.typetag).nameTextMapHash];
			if (skillObj[propSkillType][1] !== "GCG_SKILL_TAG_NONE") console.log(`tcg character skill ${skillId} ${skill.name} does not have a second skill tag of NONE`);

			skill.cost = skillObj[propSkillCost].filter(e => e.count).map(e => ({ costtype: e[propSkillCostDice], count: e.count }));

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
		parts[3] = parts[3]+'Icon';
		data.filename_icon = `UI_${parts.join('_')}`;

		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}


function getDescriptionRare(data, description, skillKey, translation) {
	let ind = description.indexOf('$[');
	while (ind !== -1) {
		const strToReplace = description.substring(ind, description.indexOf(']', ind)+1);
		let replacementText = strToReplace;

		let selector = strToReplace.substring(2, strToReplace.length-1).split('|');
		if (selector.length > 2) console.log(`Tcg Character Skill Description ${strToReplace} has extra pipes`);
		selector = selector[1];
		if (selector === 'nc') selector = undefined;

		switch (description[ind+2]) {
			case 'D': // D__KEY__DAMAGE or D__KEY__ELEMENT
				switch (description[ind+10]) {
					case 'D': // DAMAGE
						replacementText = data.basedamage+'';
						break;

					case 'E': // ELEMENT
						const element = data.baseelement === 'GCG_ELEMENT_NONE' ? undefined : data.baseelement;
						const keywordId = xelement.find(e => e.type === element)[propKeywordId];
						const elementTextMapHash = xkeyword.find(e => e.id === keywordId).titleTextMapHash;
						replacementText = translation[elementTextMapHash];
						break;

					default:
						console.log(`Tcg Character.Skill unhandled description replacement letter ${description[ind+2]} for ${skillKey}`);
						break;
				}
				break;

			// case 'I':
			// 	 break;

			case 'C': // GCGCard
				const cardId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
				const cardObj = xcard.find(e => e.id === cardId);
				const cardName = translation[cardObj.nameTextMapHash];

				replacementText = cardName;
				break;

			case 'K': // GCGKeyword
				const keywordId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
				const keywordObj = xkeyword.find(e => e.id === keywordId);
				const keywordName = translation[keywordObj.titleTextMapHash];

				replacementText = keywordName;
				break;

			default:
				console.log(`Tcg Character.Skill unhandled description replacement letter ${description[ind+2]} for ${skillKey}`);
				break;
		}

		if (selector) replacementText = replacementText.split('|').find(s => s.startsWith(selector)).split(':')[1];
		else replacementText = replacementText.split('|')[0];

		description = description.replaceAll(strToReplace, replacementText);

		ind = description.indexOf('$[', ind+1);
	}

	if (description.indexOf('$') !== -1) console.log(`tcg character skill has unreplaced text for:\n  ${description} `);

	// Replace {PLURAL#1|pt.|pts.}
	ind = description.indexOf('{PLURAL');
	while (ind !== -1) {
		const strToReplace = description.substring(ind, description.indexOf('}', ind)+1);
		let replacementText = strToReplace;

		const values = strToReplace.substring(1, strToReplace.length-1).split('|');
		const number = parseInt(values[0].split('#')[1], 10);
		if (number === 1) replacementText = values[1];
		else if (number > 1) replacementText = values[2];
		else console.log(`Tcg Character Skill Plural unhandled value ${number} for ${strToReplace}`);

		description = description.replaceAll(strToReplace, replacementText);

		ind = description.indexOf('{PLURAL', ind+1);
	}

	return description;
}

module.exports = collate;