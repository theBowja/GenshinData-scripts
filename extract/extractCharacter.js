require('./global.js');

// avatar extra info
const xextrainfo = getExcel('FetterInfoExcelConfigData');

// object map that converts player's avatar id to TextMapHash
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };
const moraNameTextMapHash = getExcel('MaterialExcelConfigData').find(ele => ele.id === 202).nameTextMapHash;
const xmat = getExcel('MaterialExcelConfigData');
const xcity = getExcel('CityConfigData');

const associationToCityId = {
	'LIYUE': 2,
	'MONDSTADT': 1,
	'FATUI': 8758412,
	'INAZUMA': 3,
	'MAINACTOR': '',
	'RANGER': '',
	'SUMERU': 4,
}

function collateCharacter(lang) {
	const language = getLanguage(lang);
	const xsubstat = getExcel('AvatarPromoteExcelConfigData');
	// console.log(xplayableAvatar.map(ele => ele.imageName));
	// console.log(avatarIdToFileName)
	let myavatar = xplayableAvatar.reduce((accum, obj) => {
		let data = {};
		let extra = xextrainfo.find(ele => ele.avatarId === obj.id);

		data.name = language[obj.nameTextMapHash];
		if(isPlayer(obj)) data.name = language[playerIdToTextMapHash[obj.id]];

		data.fullname = data.name;
		if(!isPlayer(obj)) {
			let cardimgname = obj.iconName.slice(obj.iconName.lastIndexOf('_')+1);
			cardimgname = `UI_AvatarIcon_${cardimgname}_Card`;
			let charmat = xmat.find(ele => ele.icon === cardimgname);
			data.fullname = language[charmat.nameTextMapHash];
		}

		if(data.name !== data.fullname) console.log(`fullname diff ${lang}: ${data.name} | ${data.fullname}`);


		//if(data.name === 'Traveler') data.name = capitalizeFirst(avatarIdToFileName[obj.id]);
		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.weapontype = language[weaponTextMapHash[obj.weaponType]];
		data.body = obj.bodyType.slice(obj.bodyType.indexOf('BODY_')+5);
		data.rarity = obj.qualityType === 'QUALITY_PURPLE' ? '4' : '5';
		if(!isPlayer(obj)) {
			data.birthmonth = extra.infoBirthMonth;
			data.birthday = extra.infoBirthDay;
		}	
		if(isPlayer(obj) && (data.birthmonth || data.birthday)) console.log('warning player has birthday');
		data.affiliation = isPlayer(obj) ? '' : language[extra.avatarNativeTextMapHash];
		data.element = language[extra.avatarVisionBeforTextMapHash];
		data.constellation = language[extra.avatarConstellationBeforTextMapHash];
		if(obj.id === 10000030) data.constellation = language[extra.avatarConstellationAfterTextMapHash]; // Zhongli exception
		data.title = language[extra.avatarTitleTextMapHash] || "";
		data.association = extra.avatarAssocType.slice(extra.avatarAssocType.indexOf('TYPE_')+5);
		if(associationToCityId[data.association] === undefined)
			console.log(`character missing cityId for association ${data.association}`);
		else if(associationToCityId[data.association] === '')
			data.region = '';
		else {
			data.region = language[xcity.find(ele => ele.cityId === associationToCityId[data.association]).cityNameTextMapHash];
		}
		data.cv = {
			english: language[extra.cvEnglishTextMapHash],
			chinese: language[extra.cvChineseTextMapHash],
			japanese: language[extra.cvJapaneseTextMapHash],
			korean: language[extra.cvKoreanTextMapHash]
		};

		const xsubstat = getExcel('AvatarPromoteExcelConfigData');
		const xmanualtext = getExcel('ManualTextMapConfigData');

		let substat = xsubstat.find(ele => ele.avatarPromoteId === obj.avatarPromoteId).addProps[3].propType;
		data.substat = language[xmanualtext.find(ele => ele.textMapId === substat).textMapContentTextMapHash];

		data.icon = obj.iconName;
		data.sideicon = obj.sideIconName;

		// get the promotion costs
		let costs = {};
		for(let i = 1; i <= 6; i++) {
			let apromo = xsubstat.find(ele => ele.avatarPromoteId === obj.avatarPromoteId && ele.promoteLevel === i);
			costs['ascend'+i] = [{
				name: language[moraNameTextMapHash],
				count: apromo.scoinCost
			}];
			for(let items of apromo.costItems) {
				if(items.id === undefined) continue;
				costs['ascend'+i].push({
					name: language[xmat.find(ele => ele.id === items.id).nameTextMapHash],
					count: items.count
				})
			}
		}
		data.costs = costs;

		// INFORMATION TO CALCULATE STATS AT EACH LEVEL
		let stats = { base: {}, curve: {} };
		stats.base.hp = obj.hpBase;
		stats.base.attack = obj.attackBase;
		stats.base.defense = obj.defenseBase;
		stats.base.critrate = obj.critical;
		stats.base.critdmg = obj.criticalHurt;

		stats.curve.hp = obj.propGrowCurves.find(ele => ele.type === 'FIGHT_PROP_BASE_HP').growCurve;
		stats.curve.attack = obj.propGrowCurves.find(ele => ele.type === 'FIGHT_PROP_BASE_ATTACK').growCurve;
		stats.curve.defense = obj.propGrowCurves.find(ele => ele.type === 'FIGHT_PROP_BASE_DEFENSE').growCurve;
		stats.specialized = substat;
		stats.promotion = xsubstat.reduce((accum, ele) => {
			if(ele.avatarPromoteId !== obj.avatarPromoteId) return accum;
			let promotelevel = ele.promoteLevel || 0;
			accum[promotelevel] = {
				maxlevel: ele.unlockMaxLevel,
				hp: ele.addProps.find(ele => ele.propType === 'FIGHT_PROP_BASE_HP').value || 0,
				attack: ele.addProps.find(ele => ele.propType === 'FIGHT_PROP_BASE_ATTACK').value || 0,
				defense: ele.addProps.find(ele => ele.propType === 'FIGHT_PROP_BASE_DEFENSE').value || 0,
				specialized: ele.addProps.find(ele => ele.propType === substat).value || 0,
			};
			return accum;
		}, []);
		data.stats = stats;

		accum[avatarIdToFileName[obj.id]] = data;
		return accum;
	}, {})
	return myavatar;
}

module.exports = collateCharacter;