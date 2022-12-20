require('./globalTcg.js');

const xmat = getExcel('MaterialExcelConfigData');
const xrule = getExcel('GCGRuleTextExcelConfigData');
const xdetail = getExcel('GCGRuleTextDetailExcelConfigData');
const xreaction = getExcel('GCGElementReactionExcelConfigData');

const propImage = getPropNameWithMatch(xdetail, 'id', 1001, "UI_Gcg_InSide_01");
const propReaction = getPropNameWithMatch(xdetail, 'id', 5001, 101);
const propElementOne = getPropNameWithMatch(xreaction, 'id', 101, 'GCG_ELEMENT_CRYO');
const propElementTwo = getPropNameWithMatch(xreaction, 'id', 101, 'GCG_ELEMENT_PYRO');

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xrule.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = language[obj.titleTextMapHash];
		data.rules = [];

		for (const ruleId of obj.detailIdList) {
			const ruleObj = xdetail.find(e => ruleId === e.id);
			const rule = {};
			if (ruleObj[propReaction]) {
				const react = xreaction.find(e => e.id === ruleObj[propReaction]);
				rule.reaction = {
					elementone: react[propElementOne],
					elementtwo: react[propElementTwo]
				};
			}
			rule.title = sanitizeDescription(language[ruleObj.titleTextMapHash]);
			rule.titleraw = language[ruleObj.titleTextMapHash] || "";
			rule.content = sanitizeDescription(language[ruleObj.contentTextMapHash]);
			rule.contentraw = language[ruleObj.contentTextMapHash];
			if (ruleObj[propImage] && ruleObj[propImage] !== "")
				rule.filename_image = ruleObj[propImage];
			data.rules.push(rule);
		}

		let filename = makeUniqueFileName(obj.titleTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;

		return accum;
	}, {});

	return mydata;
}

module.exports = collate;