require('./globalTcg.js');

const xcard = getExcel('GCGCardExcelConfigData');
const xcardview = getExcel('GCGCardViewExcelConfigData');

const propToken = getPropNameWithMatch(xcard, 'id', 114011, "GCG_TOKEN_ICON_HOURGLASS");
const propCounter = getPropNameWithMatch(xcard, 'id', 114011, "GCG_TOKEN_LIFE");
const propHint = getPropNameWithMatch(xcard, 'id', 114011, "GCG_HINT_ELECTRO");
// const propImage = getPropNameWithMatch(xcard, 'id', 114011, "UI_Gcg_InSide_01");

const propCardFace = getPropNameWithMatch(xcardview, 'id', 1101, 'Gcg_CardFace_Char_Avatar_Ganyu');

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xcard.reduce((accum, obj) => {
		if (!['GCG_CARD_SUMMON'].includes(obj.cardType)) return accum;
		if (obj.isHidden) return accum;
		if (!obj[propCounter]) return accum;
		if (!obj[propHint]) return accum;

		let data = {};
		data.id = obj.id;

		data.name = sanitizeName(language[obj.nameTextMapHash]);

		data.descriptionraw = language[obj.descTextMapHash];
		data.descriptionreplaced = getDescriptionReplaced(obj, data.descriptionraw, language);
		data.description = sanitizeDescription(data.descriptionreplaced, true);

		data.countingtype = obj[propCounter];
		data.tokentype = obj[propToken];
		data.hinttype = obj[propHint];
		if (!data.countingtype || !data.tokentype || !data.hinttype) console.log(`TcgSummon ${obj.id} is missing one of countingtype, tokentype, or hinttype`);

		// data.filename_tokenicon = ???
		data.filename_hinticon = getTcgHintIcon(data.hinttype);

		const cardface = xcardview.find(e => e.id === obj.id)[propCardFace]; // example: Gcg_CardFace_Char_Avatar_Qin
		const imagebase = cardface.substring(cardface.lastIndexOf('_')+1); // example: Ganyu

		data.filename_cardface = `UI_${cardface}`;
		data.filename_cardface_golden = `UI_${cardface}_Golden`;
		data.filename_cardface_HD = `UI_${cardface}_HD`;

		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog, true);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name}`);

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;