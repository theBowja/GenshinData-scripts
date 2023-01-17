require('./globalTcg.js');

const xcard = getExcel('GCGCardExcelConfigData');
const xtag = getExcel('GCGTagExcelConfigData');

const propEquipDesc = getPropNameWithMatch(xcard, 'id', 100, 1935968141);
// const propIconType = getPropNameWithMatch(xcard, 'id', 100, 1935968141);
const propTagList = getPropNameWithMatch(xcard, 'id', 106, 'GCG_TAG_FORBIDDEN_ATTACK');
const propBuffType = getPropNameWithMatch(xcard, 'id', 113031, 'GCG_STATE_BUFF_PYRO');
const propMagic = getPropNameWithMatch(xcard, 'id', 135021, 'GCG_PERSIST_EFFECT_PROTEGO');
const propToken = getPropNameWithMatch(xcard, 'id', 135021, 'GCG_TOKEN_SHIELD');
const propCounter = getPropNameWithMatch(xcard, 'id', 113031, 'GCG_TOKEN_ROUND_COUNT');
const propHint = getPropNameWithMatch(xcard, 'id', 113052, 'GCG_HINT_PYRO');

const statustypemanualmap = {
	GCG_CARD_ONSTAGE: 'UI_GCG_CARD_TITLE_FACTION_STATUS',
	GCG_CARD_SUMMON: 'UI_GCG_CARD_TITLE_FACTION_STATUS',
	GCG_CARD_STATE: 'UI_GCG_CARD_TITLE_STATUS',
	GCG_CARD_MODIFY: 'UI_GCG_CARD_TITLE_EQUIP'
};

const cardtypemanualmap = {
	GCG_CARD_ONSTAGE: 'UI_GCG_CARD_TYPE_FACTION_STATUS',
	GCG_CARD_SUMMON: 'UI_GCG_CARD_TYPE_SUMMON',
	GCG_CARD_STATE: 'UI_GCG_CARD_TYPE_STATUS',
	GCG_CARD_MODIFY: 'UI_GCG_CARD_TYPE_EQUIP'
};

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xcard.reduce((accum, obj) => {
		if (!['GCG_CARD_ONSTAGE', 'GCG_CARD_STATE', 'GCG_CARD_MODIFY', 'GCG_CARD_SUMMON'].includes(obj.cardType)) return accum;
		if (obj.isHidden) return accum;
		if (obj.cardType === 'GCG_CARD_SUMMON' && !(obj[propMagic] && obj[propMagic].startsWith('GCG_PERSIST_'))) return accum;

		let data = {};
		data.id = obj.id;

		data.name = language[obj.nameTextMapHash];

		data.cardtype = obj.cardType;
		data.statustypetext = language[xmanualtext.find(e => e.textMapId === statustypemanualmap[obj.cardType]).textMapContentTextMapHash];
		if (!data.statustypetext) console.log(`TcgStatusEffect doesn't have status type ${data.statustype} mapped.`);
		data.cardtypetext = language[xmanualtext.find(e => e.textMapId === cardtypemanualmap[obj.cardType]).textMapContentTextMapHash];
		if (!data.cardtypetext) console.log(`TcgStatusEffect doesn't have card type ${data.statustype} mapped.`);

		data.tags = obj[propTagList].filter(e => e !== 'GCG_TAG_NONE');
		// data.tagstext = data.tags.map(tag => language[xtag.find(e => e.type === tag).nameTextMapHash]);

		if (obj.cardType === 'GCG_CARD_MODIFY')
			data.descriptionraw = language[obj[propEquipDesc]];
		else
			data.descriptionraw = language[obj.descTextMapHash];
		if (data.descriptionraw === undefined || data.descriptionraw === '') return accum;
		data.descriptionreplaced = getDescriptionReplaced(obj, data.descriptionraw, language);
		data.description = sanitizeDescription(data.descriptionreplaced, true);

		data.countingtype = obj[propCounter]; // not always have
		data.bufftype = obj[propBuffType]; // not always have

		// HAVENT FIGURED OUT WHAT THESE ARE FOR
		data.buff = obj[propBuffType];
		data.magic = obj[propMagic];
		data.token = obj[propToken];
		// data.misc = tags.concat(buff, magic, token);

		// data.icon = getTcgStatusIcon(); // Unfortunately there's not enough information to figure out the icon for this.

		// data.particlefx = obj[propBuffType]; // There will be particles if the statustype starts with 'GCG_STATE_BUFF_'
		// if (data.particlefx && !data.particlefx.startsWith('GCG_STATE_BUFF')) delete data.particlefx;

		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog, true);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;