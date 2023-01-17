require('./globalTcg.js');

const xmat = getExcel('MaterialExcelConfigData');
const xcard = getExcel('GCGCardExcelConfigData');
const xdeckcard = getExcel('GCGDeckCardExcelConfigData');
const xtag = getExcel('GCGTagExcelConfigData');
const xcardview = getExcel('GCGCardViewExcelConfigData');

const propCollectible = getPropNameWithMatch(xcard, 'id', 211011, true);
const propPlayCost = Object.entries(xcard.find(e => e.id === 211011)).find(([k, v]) => Array.isArray(v) && v[0].count)[0];
const propPlayCostDice = Object.entries(xcard.find(e => e.id === 211011)[propPlayCost][0]).find(([k, v]) => v === 'GCG_COST_DICE_CRYO')[0];
const propTags = getPropNameWithMatch(xcard, 'id', 211011, 'GCG_TAG_TALENT');
const propInPlayDescription = getPropNameWithMatch(xcard, 'id', 213011, 3010026165);

const propStoryText = getPropNameWithMatch(xdeckcard, 'id', 1101, 753619631);
const propCharacterSource = getPropNameWithMatch(xdeckcard, 'id', 1101, 142707039);

const propCardFace = getPropNameWithMatch(xcardview, 'id', 1101, 'Gcg_CardFace_Char_Avatar_Ganyu');

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xcard.reduce((accum, obj) => {
		if (!obj[propCollectible]) return accum;
		let data = {};
		data.id = obj.id;

		data.name = sanitizeName(language[obj.nameTextMapHash]);

		data.cardtype = obj.cardType;
		let cardTypeSuffix = data.cardtype.substring(data.cardtype.lastIndexOf('_')+1);
		if (cardTypeSuffix === 'MODIFY') cardTypeSuffix = 'EQUIP';
		else if (cardTypeSuffix === 'ASSIST') cardTypeSuffix = 'SUPPORT';
		data.cardtypetext = language[xmanualtext.find(e => e.textMapId === `UI_GCG_CARD_TYPE_${cardTypeSuffix}`).textMapContentTextMapHash];
		if (data.cardtype && !data.cardtypetext) console.log(`ActionCard doesn't have translation for type ${data.cardtype}`);

		data.tags = obj[propTags].filter(e => e !== 'GCG_TAG_NONE');
		data.tagstext = data.tags.map(tag => language[xtag.find(e => e.type === tag).nameTextMapHash]);
		data.filename_tagsicon = data.tags.map(tag => getTcgTagImage(tag));

		data.descriptionraw = language[obj.descTextMapHash];
		data.descriptionreplaced = getDescriptionReplaced(data, data.descriptionraw, language);
		data.description = sanitizeDescription(data.descriptionreplaced, true);

		data.equippeddescriptionraw = language[obj[propInPlayDescription]];
		if (data.descriptionraw === data.inplaydescriptionraw) data.inplaydescriptionraw = undefined;
		else {
			// data.inplaydescriptionreplaced = getDescriptionReplaced(data, data.inplaydescriptionraw, language);
			// data.inplaydescription
		}

		const deckcardObj = xdeckcard.find(e => e.id === obj.id);
		if (deckcardObj) {
			// Keqing's Lightning Stiletto doesn't have a story because it is a created card.
			data.storytitle = language[deckcardObj.storyTitleTextMapHash];
			data.storytext = sanitizeDescription(language[deckcardObj[propStoryText]]);
			data.source = language[deckcardObj[propCharacterSource]];
		}

		data.playcost = obj[propPlayCost].filter(e => e.count).map(e => ({ costtype: e[propPlayCostDice], count: e.count }));

		// data.skillList = obj.skillList;

		// IMAGE
		const cardface = xcardview.find(e => e.id === obj.id)[propCardFace]; // example: Gcg_CardFace_Char_Avatar_Qin
		const imagebase = cardface.substring(cardface.lastIndexOf('_')+1); // example: Ganyu

		data.filename_cardface = `UI_${cardface}`;
		data.filename_cardface_golden = `UI_${cardface}_Golden`;
		data.filename_cardface_HD = `UI_${cardface}_HD`;

		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name}`);

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;