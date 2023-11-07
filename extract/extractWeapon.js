require('./global.js');

const xweapon = getExcel('WeaponExcelConfigData');
const xrefine = getExcel('EquipAffixExcelConfigData');

const moraNameTextMapHash = getExcel('MaterialExcelConfigData').find(ele => ele.id === 202).nameTextMapHash;
const xmat = getExcel('MaterialExcelConfigData');

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
	const xsubstat = getExcel('WeaponPromoteExcelConfigData');
	let myweapon = xplayableWeapon.reduce((accum, obj) => {

		let data = {};
		data.id = obj.id;
		let filename = makeUniqueFileName(obj.nameTextMapHash, accum, data);
		if(filename === "") return accum;
		if(accum[filename] !== undefined) console.log(filename+' IS NOT UNIQUE');

		data.name = language[obj.nameTextMapHash];
		checkDupeName(data, dupeCheck);
		data.description = sanitizeDescription(language[obj.descTextMapHash]);
		data.weapontype = language[weaponTextMapHash[obj.weaponType]];
		data.rarity = ''+obj.rankLevel;

		data.story = getReadable(`Weapon${obj.id}${(lang != 'CHS') ? ('_' + lang) : ''}`, lang);

		if(obj.weaponProp[0].propType !== 'FIGHT_PROP_BASE_ATTACK') console.log(obj,'weapon did not find base atk');
		data.baseatk = obj.weaponProp.find(obj => obj.propType === 'FIGHT_PROP_BASE_ATTACK').initValue;

		let substat = obj.weaponProp[1].propType;
		if(substat !== undefined) {
			data.substat = language[xmanualtext.find(ele => ele.textMapId === substat).textMapContentTextMapHash];
			let subvalue = obj.weaponProp[1].initValue;
			data.subvalue = subvalue;
		}

		if(obj.skillAffix[0] !== 0) {
			let affixId = obj.skillAffix[0] * 10;
			for(let offset = 0; offset < 5; offset++) {
				let ref = xrefine.find(ele => ele.affixId === affixId+offset);
				if(ref === undefined) break;
				if(offset === 0) data.effectname = language[ref.nameTextMapHash];
				let effect = language[ref.descTextMapHash];
				effect = effect.replaceAll('{NON_BREAK_SPACE}', ' ');
				effect = effect.replace(/<\/color>s/g, 's<\/color>');
				if(filename === 'swordofdescension' || filename === 'predator') { // has extra color
					effect = effect.replace(/<color=#.*?>/i, '').replace(/<\/color>/i, '');
					effect = effect.replace(/<color=#.*?>/i, '').replace(/<\/color>/i, '');
				}

				effect = effect.replace(/<color=#.*?>/gi, '{').replace(/<\/color>/gi, '}');
				effect = effect.split(/{|}/);
				data['r'+(offset+1)] = [];
				data['effect'] = sanitizeDescription(effect.reduce((accum, ele, i) => {
					if(i % 2 === 0) {
						return accum + ele;
					} else if(ele.includes('#')) {
						return accum + `{${ele}}`;
					} else {
						data['r'+(offset+1)].push(ele);
						return accum + `{${(i-1)/2}}`;
					}
				}, ''));
			}
		}

		// get the promotion costs
		let costs = {};
		for(let i = 1; i <= (obj.rankLevel <= 2 ? 4 : 6); i++) {
			// 1 and 2 star weapons only have 4 ascensions instead of 6
			let apromo = xsubstat.find(ele => ele.weaponPromoteId === obj.weaponPromoteId && ele.promoteLevel === i);
			costs['ascend'+i] = [{
				name: language[moraNameTextMapHash],
				count: apromo.coinCost
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
		stats.base.attack = obj.weaponProp[0].initValue;
		stats.base.specialized = obj.weaponProp[1].initValue || 0;

		stats.curve.attack = obj.weaponProp[0].type;
		stats.curve.specialized = obj.weaponProp[1].type;
		stats.specialized = substat;
		stats.promotion = xsubstat.reduce((accum, ele) => {
			if(ele.weaponPromoteId !== obj.weaponPromoteId) return accum;
			let promotelevel = ele.promoteLevel || 0;
			accum[promotelevel] = {
				maxlevel: ele.unlockMaxLevel,
				attack: ele.addProps.find(ele => ele.propType === 'FIGHT_PROP_BASE_ATTACK').value || 0
			};
			let special = ele.addProps.find(ele => ele.propType === substat);//.value;
			if(special) special = special.value;
			if(special !== undefined) {
				console.log('WEAPON SPECIAL SUBSTAT FOUND: ' + obj.id)
				accum[promotelevel].specialized = special;
			}
			return accum;
		}, [])
		data.stats = stats;

		data.icon = obj.icon;
		data.awakenicon = obj.awakenIcon;

		accum[filename] = data;
		return accum;
	}, {});
	
	return myweapon;
}

module.exports = collateWeapon;