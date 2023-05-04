require('./global.js');

// avatar extra info
const xextrainfo = getExcel('FetterInfoExcelConfigData');

// object map that converts player's avatar id to TextMapHash
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };
const moraNameTextMapHash = getExcel('MaterialExcelConfigData').find(ele => ele.id === 202).nameTextMapHash;
const xmat = getExcel('MaterialExcelConfigData');
const xcity = getExcel('CityConfigData');

const associationToCityId = {
	'ASSOC_LIYUE': 2,
	'ASSOC_MONDSTADT': 1,
	'ASSOC_FATUI': 8758412,
	'ASSOC_INAZUMA': 3,
	'ASSOC_MAINACTOR': '',
	'ASSOC_RANGER': '',
	'ASSOC_SUMERU': 4,
}

function collateCharacter(lang) {
	const language = getLanguage(lang);
	const xsubstat = getExcel('AvatarPromoteExcelConfigData');
	// console.log(xplayableAvatar.map(ele => ele.imageName));
	// console.log(avatarIdToFileName)
	let myavatar = xplayableAvatar.reduce((accum, obj) => {
		let data = {};
		let extra = xextrainfo.find(ele => ele.avatarId === obj.id);

		data.id = obj.id;
		data.name = language[obj.nameTextMapHash];
		if(isPlayer(obj)) data.name = language[playerIdToTextMapHash[obj.id]];

		if(!isPlayer(obj)) {
			// get fullname
			let cardimgname = obj.iconName.slice(obj.iconName.lastIndexOf('_')+1);
			cardimgname = `UI_AvatarIcon_${cardimgname}_Card`;
			let charmat = xmat.find(ele => ele.icon === cardimgname);
			data.fullname = language[charmat.nameTextMapHash];
			if (data.fullname === data.name) delete data.fullname;
		}
		if(data.fullname && data.name !== data.fullname) console.log(`characters with fullname ${lang}: ${data.name} | ${data.fullname}`);

		// description
		data.description = global.sanitizer(language[obj.descTextMapHash], replaceNonBreakSpace, replaceNewline, removeHashtag);
		if (data.id === 10000005) data.description = sanitizer(data.description, replaceGenderM); // Aether
		else if (data.id === 10000007) data.description = sanitizer(data.description, replaceGenderF); // Lumine
		validateString(data.description, 'characters.description', lang);

		data.weaponType = obj.weaponType;
		data.weaponText = language[weaponTextMapHash[obj.weaponType]];
		data.bodyType = obj.bodyType;
		data.gender = global.genderTranslations[global.bodyToGender[data.bodyType]][lang];
		if (!data.gender) console.log(`character missing mapping bodytype ${data.bodytype} to gender`);

		data.qualityType = obj.qualityType;
		data.rarity = obj.qualityType === 'QUALITY_PURPLE' ? 4 : 5;

		if(!isPlayer(obj)) {
			data.birthdaymmdd = extra.infoBirthMonth + '/' + extra.infoBirthDay;
			let birthday = new Date(Date.UTC(2000, extra.infoBirthMonth-1, extra.infoBirthDay));
			data.birthday = birthday.toLocaleString(global.localeMap[lang], { timeZone: 'UTC', month: 'long', day: 'numeric' });
		} else {
			data.birthdaymmdd = '';
			data.birthday = '';
		}
		if(isPlayer(obj) && (data.birthmonth || data.birthday)) console.log('warning player has birthday');

		data.affiliation = isPlayer(obj) ? '' : language[extra.avatarNativeTextMapHash];
		data.elementType = global.mapElementToType[getLanguage('EN')[extra.avatarVisionBeforTextMapHash].toLowerCase()];
		if (!data.elementType) console.log(`${data.name} is missing an elementType`);
		data.elementText = language[extra.avatarVisionBeforTextMapHash];
		// data.elementafter = language[extra.avatarVisionAfterTextMapHash];
		data.constellation = language[extra.avatarConstellationBeforTextMapHash];
		// data.constellationafter = language[extra.avatarConstellationAfterTextMapHash];
		if(obj.id === 10000030) data.constellation = language[extra.avatarConstellationAfterTextMapHash]; // Zhongli exception
		data.title = language[extra.avatarTitleTextMapHash] || "";
		data.associationType = extra.avatarAssocType.replace('_TYPE', '');
		if(associationToCityId[data.associationType] === undefined)
			console.log(`character missing cityId for association ${data.associationType}`);
		else if(associationToCityId[data.associationType] === '')
			data.region = '';
		else {
			data.region = language[xcity.find(ele => ele.cityId === associationToCityId[data.associationType]).cityNameTextMapHash];
		}
		if (data.region === undefined) console.log(`character missing region ${data.name}`);
		data.cv = {
			english: language[extra.cvEnglishTextMapHash],
			chinese: language[extra.cvChineseTextMapHash],
			japanese: language[extra.cvJapaneseTextMapHash],
			korean: language[extra.cvKoreanTextMapHash]
		};

		const xsubstat = getExcel('AvatarPromoteExcelConfigData');
		const xmanualtext = getExcel('ManualTextMapConfigData');

		let substat = xsubstat.find(ele => ele.avatarPromoteId === obj.avatarPromoteId).addProps[3].propType;
		data.substatType = substat;
		data.substatText = language[xmanualtext.find(ele => ele.textMapId === substat).textMapContentTextMapHash];

		// IMAGES
		const name = obj.iconName.slice(obj.iconName.lastIndexOf('_')+1);
		data.filename_icon = obj.iconName;
		data.filename_iconCard = `UI_AvatarIcon_${name}_Card`;
		if (!isPlayer(obj)) {
			data.filename_gachaSplash = `UI_Gacha_AvatarImg_${name}`;
			data.filename_gachaSlice = `UI_Gacha_AvatarIcon_${name}`;
		}
		data.filename_sideIcon = obj.sideIconName;
		data.mihoyo_icon = `https://upload-os-bbs.mihoyo.com/game_record/genshin/character_icon/${data.filename_icon}.png`;
		data.mihoyo_sideIcon = `https://upload-os-bbs.mihoyo.com/game_record/genshin/character_side_icon/${data.filename_sideIcon}.png`;

		// get the promotion costs
		let costs = {};
		for(let i = 1; i <= 6; i++) {
			let apromo = xsubstat.find(ele => ele.avatarPromoteId === obj.avatarPromoteId && ele.promoteLevel === i);
			costs['ascend'+i] = [{
				id: 202,
				name: language[moraNameTextMapHash],
				// materialtype: "MATERIAL_ADSORBATE",
				count: apromo.scoinCost
			}];
			for(let items of apromo.costItems) {
				if(items.id === undefined) continue;
				costs['ascend'+i].push({
					id: items.id,
					name: language[xmat.find(ele => ele.id === items.id).nameTextMapHash],
					// materialtype: xmat.find(ele => ele.id === items.id).materialType,
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