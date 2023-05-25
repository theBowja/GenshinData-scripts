require('./global.js');
const fs = require('fs');
const config = require('../config.json');

// Goes through binoutput to get data on tcg skill's damage and element
const tcgSkillKeyMap = {};
global.loadTcgSkillKeyMap = function() {
	if (tcgSkillKeyMap.loaded) return tcgSkillKeyMap;
	const filelist = fs.readdirSync(`${config.GenshinData_folder}/BinOutput/_unknown_dir`);
	for (const filename of filelist) {
		if (!filename.endsWith('.json')) continue;

		const fileObj = require(`${config.GenshinData_folder}/BinOutput/_unknown_dir/${filename}`);
		if (!fileObj.name) continue;

		try {
			tcgSkillKeyMap[fileObj.name] = Object.values(Object.values(fileObj)[1]);
			if (fileObj.name === 'Effect_Damage_Physic_4') {
				tcgSkillKeyMap.DAMAGE = tcgSkillKeyMap[fileObj.name].find(e => e.value === 4).$type;
				tcgSkillKeyMap.ELEMENT = tcgSkillKeyMap[fileObj.name].find(e => e.type === 'Element').$type;
			}
		} catch(e) {
			continue;
		}
	}
	tcgSkillKeyMap.loaded = true;
	return tcgSkillKeyMap;
}


global.getDescriptionReplaced = function(data, description, translation) {
	const xcard = getExcel('GCGCardExcelConfigData');
	const xchar = getExcel('GCGCharExcelConfigData');
	const xskill = getExcel('GCGSkillExcelConfigData');
	const xelement = getExcel('GCGElementExcelConfigData');
	const xkeyword = getExcel('GCGKeywordExcelConfigData');
	const propKeywordId = getPropNameWithMatch(xelement, 'type', 'GCG_ELEMENT_CRYO', 101);

	let ind = description.indexOf('$[');
	while (ind !== -1) {
		const strToReplace = description.substring(ind, description.indexOf(']', ind)+1);
		let replacementText = strToReplace;

		let selector = strToReplace.substring(2, strToReplace.length-1).split('|');
		if (selector.length > 2) console.log(`Tcg description ${strToReplace} has extra pipes for ${data.name}`);
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
						console.log(`Tcg description has unhandled replacement letter ${description[ind+2]} for ${data.name}`);
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

			case 'A': // GCGChar
				const charId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
				const charObj = xchar.find(e => e.id === charId);
				const charName = translation[charObj.nameTextMapHash];

				replacementText = charName;
				break;

			case 'S': // GCGSkill
				const skillId = parseInt(description.substring(ind+3, description.indexOf(']', ind)), 10);
				const skillObj = xskill.find(e => e.Id === skillId);
				const skillName = translation[skillObj.nameTextMapHash];

				replacementText = skillName;
				break;

			// case 'S':
			// 	break;

			default:
				console.log(`Tcg description has unhandled replacement letter ${description[ind+2]} for ${data.name}`);
				break;
		}

		// console.log('===========');
		// console.log(description);
		// console.log(selector);
		// console.log(replacementText);

		const splitText = replacementText.split('|');
		if (selector && splitText.find(s => s.startsWith(selector))) {
			replacementText = splitText.find(s => s.startsWith(selector)).split(':')[1];
		} else {
			replacementText = splitText[0];
		}

		description = description.replaceAll(strToReplace, replacementText);

		ind = description.indexOf('$[', ind+1);
	}

	if (description.indexOf('$') !== -1) console.log(`Tcg description has unreplaced text for:\n  ${description} `);
	// Replace {PLURAL#1|pt.|pts.}
	ind = description.indexOf('{PLURAL');
	while (ind !== -1) {
		const strToReplace = description.substring(ind, description.indexOf('}', ind)+1);
		let replacementText = strToReplace;

		const values = strToReplace.substring(1, strToReplace.length-1).split('|');
		const number = parseInt(values[0].split('#')[1], 10);
		if (number === 1) replacementText = values[1];
		else if (number > 1) replacementText = values[2];
		else console.log(`Tcg plural has unhandled value ${number} for ${strToReplace} for ${data.name}`);

		description = description.replaceAll(strToReplace, replacementText);

		ind = description.indexOf('{PLURAL', ind+1);
	}

	return description;
}

global.getTcgTagImage = function(tag) {
	switch (tag) {
	case 'GCG_TAG_SLOWLY':
		return 'UI_Gcg_Tag_Card_CombatAction';

	case 'GCG_TAG_TALENT':
		return 'UI_Gcg_Tag_Card_Talent';
	case 'GCG_TAG_WEAPON':
		return 'UI_Gcg_Tag_Card_Weapon';
	case 'GCG_TAG_ARTIFACT':
		return 'UI_Gcg_Tag_Card_Relic';
	case 'GCG_TAG_PLACE':
		return 'UI_Gcg_Tag_Card_Location';
	case 'GCG_TAG_ALLY':
		return 'UI_Gcg_Tag_Card_Ally';
	case 'GCG_TAG_ITEM':
		return 'UI_Gcg_Tag_Card_Item';
	case 'GCG_TAG_RESONANCE':
		return 'UI_Gcg_Tag_Card_Sync';
	case 'GCG_TAG_FOOD':
		return 'UI_Gcg_Tag_Card_Food';
	case 'GCG_TAG_SHEILD':
		return 'UI_Gcg_Tag_Card_Shield';

	case 'GCG_TAG_WEAPON_NONE':
		return 'UI_Gcg_Tag_Weapon_None';
	case 'GCG_TAG_WEAPON_CATALYST':
		return 'UI_Gcg_Tag_Weapon_Catalyst';
	case 'GCG_TAG_WEAPON_BOW':
		return 'UI_Gcg_Tag_Weapon_Bow';
	case 'GCG_TAG_WEAPON_CLAYMORE':
		return 'UI_Gcg_Tag_Weapon_Claymore';
	case 'GCG_TAG_WEAPON_POLE':
		return 'UI_Gcg_Tag_Weapon_Polearm';
	case 'GCG_TAG_WEAPON_SWORD':
		return 'UI_Gcg_Tag_Weapon_Sword';

	case 'GCG_TAG_ELEMENT_NONE':
		return 'UI_Gcg_Tag_Element_None';
	case 'GCG_TAG_ELEMENT_CRYO':
		return 'UI_Gcg_Tag_Element_Ice';
	case 'GCG_TAG_ELEMENT_HYDRO':
		return 'UI_Gcg_Tag_Element_Water';
	case 'GCG_TAG_ELEMENT_PYRO':
		return 'UI_Gcg_Tag_Element_Fire';
	case 'GCG_TAG_ELEMENT_ELECTRO':
		return 'UI_Gcg_Tag_Element_Electric';
	case 'GCG_TAG_ELEMENT_ANEMO':
		return 'UI_Gcg_Tag_Element_Wind';
	case 'GCG_TAG_ELEMENT_GEO':
		return 'UI_Gcg_Tag_Element_Rock';
	case 'GCG_TAG_ELEMENT_DENDRO':
	case 'GCG_TAG_DENDRO_PRODUCE':
		return 'UI_Gcg_Tag_Element_Grass';

	case 'GCG_TAG_NATION_LIYUE':
		return 'UI_Gcg_Tag_Faction_Liyue';
	case 'GCG_TAG_NATION_MONDSTADT':
		return 'UI_Gcg_Tag_Faction_Mondstadt';
	case 'GCG_TAG_NATION_INAZUMA':
		return 'UI_Gcg_Tag_Faction_Inazuma';
	case 'GCG_TAG_NATION_SUMERU':
		return 'UI_Gcg_Tag_Faction_Sumeru';

	case 'GCG_TAG_CAMP_MONSTER':
		return 'UI_Gcg_Tag_Faction_Monster';
	case 'GCG_TAG_CAMP_HILICHURL':
		return 'UI_Gcg_Tag_Faction_Hili';
	case 'GCG_TAG_CAMP_FATUI':
		return 'UI_Gcg_Tag_Faction_Fatui';
	case 'GCG_TAG_CAMP_KAIRAGI':
		return 'UI_Gcg_Tag_Faction_Kairagi';
	default:
		console.log(`Tag ${tag} does not have an image mapped in global.getTcgTagImage(tag)`);
	}
}

global.getTcgHintIcon = function(type) {
	switch (type) {
	case 'GCG_HINT_HEAL':
		return 'UI_Gcg_Buff_Common_Element_Heal';
	case 'GCG_HINT_CRYO':
		return 'UI_Gcg_Buff_Common_Element_Ice';
	case 'GCG_HINT_HYDRO':
		return 'UI_Gcg_Buff_Common_Element_Water';
	case 'GCG_HINT_PYRO':
		return 'UI_Gcg_Buff_Common_Element_Fire';
	case 'GCG_HINT_ELECTRO':
		return 'UI_Gcg_Buff_Common_Element_Electric';
	case 'GCG_HINT_ANEMO':
		return 'UI_Gcg_Buff_Common_Element_Wind';
	case 'GCG_HINT_DENDRO':
		return 'UI_Gcg_Buff_Common_Element_Grass';
	case 'GCG_HINT_GEO':
		return 'UI_Gcg_Buff_Common_Element_Rock';
	// case 'GCG_HINT_PHYSICAL':
		//return 'UI_Gcg_Buff_Common_Element_Physics';
	}
	console.log(`Hint type ${type} does not have an image mapped in global.getTcgHintIcon`);
}

// UI_Gcg_Buff_
global.getTcgStatusIcon = function(cardid, type) {
	switch (cardid) {

	}

	switch (type) {
	case 'GCG_':
		return ''


	}
	console.log(`Status type ${type} does not have an image mapped in global.getTcgStatusIcon`);
}