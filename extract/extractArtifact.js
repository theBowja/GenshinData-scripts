require('./global.js');

// object map that converts relic EquipType to a property name
const relicTypeToPropertyName = { 'EQUIP_BRACER': 'flower', 'EQUIP_NECKLACE': 'plume', 'EQUIP_SHOES': 'sands', 'EQUIP_RING': 'goblet', 'EQUIP_DRESS': 'circlet'};

// convert artifact type to index in readables
const relicTypeToIndex = {'EQUIP_BRACER': '4', 'EQUIP_NECKLACE': '2', 'EQUIP_SHOES': '5', 'EQUIP_RING': '1', 'EQUIP_DRESS': '3'}

function collateArtifact(lang) {
	const language = getLanguage(lang);
	const xsets = getExcel('ReliquarySetExcelConfigData');
	const xrelics = getExcel('ReliquaryExcelConfigData');
	const xreliccodex = getExcel('ReliquaryCodexExcelConfigData');
	const xrefine = getExcel('EquipAffixExcelConfigData');

	let myartifact = xsets.reduce((accum, obj) => {
		if(obj.setIcon === '') return accum;
		let setname;
		let filename;
		let data = {};
		data.id = obj.setId;

		// get available rarities
		data.rarityList = xreliccodex.reduce((accum, relic) => {
			if(obj.setId !== relic.suitId) return accum;
			relic.level = relic.level;
			if(accum.indexOf(relic.level) === -1) accum.push(relic.level);
			return accum;
		}, []);

		// set bonus effects
		obj.setNeedNum.forEach((ele, ind) => {
			let effect = xrefine.find(e => e.affixId === obj.EquipAffixId*10 + ind);
			data['effect'+ele+'Pc'] = sanitizer(language[effect.descTextMapHash], removeHashtag, replaceNonBreakSpace);
			validateString(data['effect'+ele+'Pc'], 'artifacts.seteffect', lang);
			if(setname === undefined) {
				setname = language[effect.nameTextMapHash];
				filename = makeFileName(getLanguage('EN')[effect.nameTextMapHash]);
			}
		});

		data.name = setname;

		if(data.rarityList.length === 0) {
			if(lang === 'EN') console.log(`Artifact set: ${setname} not available yet`);
			return accum;
		}

		// relic pieces
		obj.containsList.forEach(ele => {
			let relic = xrelics.find(e => e.id === ele);
			let relicdata = {};
			relicdata.name = language[relic.nameTextMapHash];
			relicdata.relicType = relic.equipType;
			const relicTypeTextMapHash = xmanualtext.find(ele => ele.textMapId === relic.equipType).textMapContentTextMapHash;
			relicdata.relicText = language[relicTypeTextMapHash];
			// validateString(relicdata.relicText, 'artifacts.relicText', lang);
			relicdata.description = language[relic.descTextMapHash];
			validateString(relicdata.description, 'artifacts.description', lang);
			relicdata.story = getReadable(`Relic${obj.setId}_${relicTypeToIndex[relic.equipType]}${(lang != 'CHS') ? ('_' + lang) : ''}`, lang);
			data[relicTypeToPropertyName[relic.equipType]] = relicdata;
			data['filename_'+relicTypeToPropertyName[relic.equipType]] = relic.icon;
			data['mihoyo_'+relicTypeToPropertyName[relic.equipType]] = `https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/${relic.icon}.png`;
		});

		accum[filename] = data;
		return accum;
	}, {});
	return myartifact;
}

module.exports = collateArtifact;