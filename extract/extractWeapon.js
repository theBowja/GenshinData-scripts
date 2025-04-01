require('./global.js');

const xweapon = getExcel('WeaponExcelConfigData');
const xrefine = getExcel('EquipAffixExcelConfigData');

const moraNameTextMapHash = getExcel('MaterialExcelConfigData').find(ele => ele.id === 202).nameTextMapHash;
const xmat = getExcel('MaterialExcelConfigData');
const xsubstat = getExcel('WeaponPromoteExcelConfigData');

const xplayableWeapon = xweapon.filter(obj => {
	if(obj.rankLevel >= 3 && obj.skillAffix[0] === 0) return false;
	if(obj.skillAffix[1] !== 0) { console.log('danger'); return false };
	if(obj.id === 11429) return false; // story weapon
	const name = getLanguage('EN')[obj.nameTextMapHash];
	if(name === '') return false;
	else if(name === 'The Flagstaff' || name === 'Quartz' || name === 'Ebony Bow' || name === 'Amber Bead') return false;
	return true;
});

function collateWeapon(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let myweapon = xplayableWeapon.reduce((accum, obj) => {

		let data = {};
		data.id = obj.id;
		let filename = makeUniqueFileName(obj.nameTextMapHash, accum, data);
		if(filename === "") return accum;
		if(accum[filename] !== undefined) console.log(filename+' IS NOT UNIQUE');

		data.name = language[obj.nameTextMapHash];
		checkDupeName(data, dupeCheck);

		data.descriptionRaw = sanitizer(language[obj.descTextMapHash], replaceNewline);
		data.description = sanitizer(data.descriptionRaw, removeHashtag, replaceGenderM, replaceNonBreakSpace);
		validateString(data.description, 'weapons.description', lang);

		data.weaponType = obj.weaponType;
		data.weaponText = language[weaponTextMapHash[obj.weaponType]];
		data.rarity = obj.rankLevel;

		data.story = getReadable(`Weapon${obj.id}${(lang != 'CHS') ? ('_' + lang) : ''}`, lang);

		if(obj.weaponProp[0].propType !== 'FIGHT_PROP_BASE_ATTACK') console.log(obj,'weapon did not find base atk');
		data.baseAtkValue = obj.weaponProp.find(obj => obj.propType === 'FIGHT_PROP_BASE_ATTACK').initValue;

		let substat = obj.weaponProp[1].propType;
		if(substat !== undefined && substat !== 'FIGHT_PROP_NONE') {
			data.mainStatType = substat;
			data.mainStatText = language[xmanualtext.find(ele => ele.textMapId === substat).textMapContentTextMapHash];
			let subvalue = obj.weaponProp[1].initValue;
			if(subvalue <= 2) subvalue = (Math.round(subvalue*1000)/10).toLocaleString(global.localeMap[lang])+'%';
			else subvalue = (Math.round(subvalue)).toLocaleString(global.localeMap[lang]);
			data.baseStatText = subvalue;
		}

		if(obj.skillAffix[0] !== 0) {
			let affixId = obj.skillAffix[0] * 10;
			for(let offset = 0; offset < 5; offset++) {
				let ref = xrefine.find(ele => ele.affixId === affixId+offset);
				if(ref === undefined) break;
				if(offset === 0) {
					data.effectName = language[ref.nameTextMapHash]; // 1* weapons dont have effects
					validateString(data.effectName, 'weapon.effectName', lang);
				}

				const effect = sanitizer(language[ref.descTextMapHash], replaceNewline);

				data['r'+(offset+1)] = {
					//descriptionRaw: sanitizer(language[ref.descTextMapHash], replaceNewline),
					description: sanitizer(effect, removeColorHTML, replaceNonBreakSpace, removeHashtag, replaceGenderM),
					values: []
				};

				let effectTemplateRaw = effect;

				const effectMatches = effect.match(/<color=#.*?>(.*?)<\/color>/gis);
				if (effectMatches !== null) {
					for (const match of effectMatches) {
						const value = /<color=#.*?>(.*?)<\/color>/gis.exec(match)[1];
						if (/\d/.test(value)) { // refine value is valid if it contains a number
							data['r'+(offset+1)].values.push(value);

							const replacement = match.replace(`>${value}<`, `>{${data['r'+(offset+1)].values.length - 1}}<`);
							effectTemplateRaw = effectTemplateRaw.replace(match, replacement);
						}
					}
				}
				// else if (!filename.includes('isshin')) {
				// 	 console.log(`error: weapon has no replaceable value for refinement: ${effect}`);
				// }

				data.effectTemplateRaw = effectTemplateRaw;
				// data.effectTemplate = sanitizer(effectTemplateRaw, removeColorHTML, replaceNonBreakSpace, removeHashtag, replaceGenderM);
				// validateString(data.effectTemplate, 'weapon.effectTemplate', lang); // can't validate because i replaced values with {0} etc.
			}
		}

		// get the promotion costs
		let costs = {};
		for(let i = 1; i <= (obj.rankLevel <= 2 ? 4 : 6); i++) {
			// 1 and 2 star weapons only have 4 ascensions instead of 6
			let apromo = xsubstat.find(ele => ele.weaponPromoteId === obj.weaponPromoteId && ele[getPromoteLevel()] === i);
			costs['ascend'+i] = [{
				id: 202,
				name: language[moraNameTextMapHash],
				count: apromo.coinCost || 0
			}];

			for(let items of apromo.costItems) {
				if(items.id === 0) continue;
				if(items.id === undefined) continue;
				costs['ascend'+i].push({
					id: items.id,
					name: language[xmat.find(ele => ele.id === items.id).nameTextMapHash],
					count: items.count
				})
			}
		}
		data.costs = costs;

		// INFORMATION TO CALCULATE STATS AT EACH LEVEL
		let stats = { base: {}, curve: {} };
		stats.base.attack = obj.weaponProp[0].initValue;
		stats.base.specialized = obj.weaponProp[1].initValue || 0;

		stats.curve.attack = obj.weaponProp[0].type;
		stats.curve.specialized = obj.weaponProp[1].type;
		stats.specialized = substat;
		stats.promotion = xsubstat.reduce((accum, ele) => {
			if(ele.weaponPromoteId !== obj.weaponPromoteId) return accum;
			let promotelevel = ele[getPromoteLevel()] || 0;
			accum[promotelevel] = {
				maxlevel: ele.unlockMaxLevel,
				attack: ele.addProps.find(ele => ele.propType === 'FIGHT_PROP_BASE_ATTACK').value || 0
			};
			let special = ele.addProps.find(ele => ele.propType === substat);//.value;
			if(special) special = special.value;
			if(special !== undefined && special !== 0) {
				console.log(`WEAPON SPECIAL SUBSTAT FOUND: ${obj.id} ${substat} ${special}`)
				accum[promotelevel].specialized = special;
			}
			return accum;
		}, [])
		data.stats = stats;

		// IMAGES
		data.filename_icon = obj.icon;
		data.filename_awakenIcon = obj.awakenIcon;
		data.filename_gacha = `UI_Gacha_EquipIcon_${obj.icon.slice(obj.icon.indexOf("UI_EquipIcon")+13)}`;

		data.mihoyo_icon = `https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/${obj.icon}.png`;
		data.mihoyo_awakenIcon = `https://upload-os-bbs.mihoyo.com/game_record/genshin/equip/${obj.awakenIcon}.png`;

		accum[filename] = data;
		return accum;
	}, {});
	
	return myweapon;
}

let promoteLevel = undefined;
function getPromoteLevel() {
	if(promoteLevel !== undefined) return promoteLevel;
	for (let [key, value] of Object.entries(xsubstat[1])) {
		if (typeof value === 'number' && value === 1) {
			promoteLevel = key;
			return promoteLevel;
		}
	}
}

module.exports = collateWeapon;