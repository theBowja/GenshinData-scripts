require('./global.js');
const config = require('../config.json');

const xmat = getExcel('MaterialExcelConfigData');
const xchar = getExcel('GCGCharExcelConfigData');
const xskill = getExcel('GCGSkillExcelConfigData');
const xskilltag = getExcel('GCGSkillTagExcelConfigData');
const xelement = getExcel('GCGElementExcelConfigData');
const xkeyword = getExcel('GCGKeywordExcelConfigData');
const xcard = getExcel('GCGCardExcelConfigData');

const propMaxEnergy = getPropNameWithMatch(xchar, 'id', 1101, 2);
const propPlayable = getPropNameWithMatch(xchar, 'id', 1101, true);

const propSkillKey = getPropNameWithMatch(xskill, 'Id', 11011, 'Effect_Damage_Physic_2');
const propSkillType = getPropNameWithMatch(xskill, 'Id', 11011, 'GCG_SKILL_TAG_A');

const propKeywordId = getPropNameWithMatch(xelement, 'type', 'GCG_ELEMENT_CRYO', 101);

const tcgSkillKeyMap = loadTcgSkillKeyMap();

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
		// data.description = sanitizeDescription(language[obj.descTextMapHash]);

		data.skills = [];
		for (const skillId of obj.skillList) {
			const skillObj = xskill.find(e => e.Id === skillId);
			const skill = {};
			skill.id = skillId;
			skill.name = language[skillObj.nameTextMapHash];
			skill.descriptionraw = language[skillObj.descTextMapHash];
			if (tcgSkillKeyMap[skillObj[propSkillKey]]) {
				if (skill.descriptionraw.includes('D__KEY__DAMAGE'))
					skill.basedamage = Math.min(...tcgSkillKeyMap[skillObj[propSkillKey]].filter(e => e.$type === 'GCGDeclaredValueDamage').map(e => e.value));
				if (skill.descriptionraw.includes('D__KEY__ELEMENT'))
					skill.baseelement = tcgSkillKeyMap[skillObj[propSkillKey]].find(e => e.$type === 'GCGDeclaredValueElement').ratio || 'GCG_ELEMENT_NONE';
			}
			skill.descriptionrare = getDescriptionRare(skill, skill.descriptionraw, skillObj[propSkillKey], language);
			skill.type = skillObj[propSkillType][0];
			if (skillObj[propSkillType][1] !== "GCG_SKILL_TAG_NONE") console.log(`tcg character skill ${skillId} ${skill.name} does not have a second skill tag of NONE`);
			data.skills.push(skill);
		}



		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}


function getDescriptionRare(data, description, skillKey, translation) {
	if (description.includes('$[D__KEY')) {
		const element = data.baseelement === 'GCG_ELEMENT_NONE' ? undefined : data.baseelement;
		const keywordId = xelement.find(e => e.type === element)[propKeywordId];
		const elementTextMapHash = xkeyword.find(e => e.id === keywordId).titleTextMapHash;

		description = description.replaceAll('$[D__KEY__DAMAGE]', data.basedamage)
								 .replaceAll('$[D__KEY__ELEMENT]', translation[elementTextMapHash]);
	}

	let ind = description.indexOf('$[C');
	while (ind !== -1) {
		const cardId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
		const cardObj = xcard.find(e => e.id === cardId);
		const cardName = translation[cardObj.nameTextMapHash];
		
		const strToReplace = description.substring(ind, description.indexOf(']', ind)+1);
		// console.log(strToReplace);
		// console.log(cardName);		
		description = description.replaceAll(strToReplace, cardName);
		console.log(description);
		ind = description.indexOf('$[C');
		// console.log(cardId);
		// description.
	}

	return description;
}

module.exports = collate;