require('./global.js');

const xconstellation = getExcel('AvatarTalentExcelConfigData');

function collateConstellation(lang) {
	const language = getLanguage(lang);
	let myconstellation = xplayableAvatar.reduce((accum, obj) => {
		// bad practice to declare functions inside loop but i need to be able to call it multiple times for players
		function dowork() {
			let data = {};
			let depot = xskilldepot.find(ele => ele.id === obj.skillDepotId);
			if(depot === undefined || depot.energySkill === undefined) return; // not a finished (traveler) character
			if(depot.talentStarName === '') return; // unfinished

			data.name = language[obj.nameTextMapHash];
			if(isPlayer(obj)) data.name += ` (${language[elementTextMapHash[getPlayerElement(obj.skillDepotId)]]})`
			//console.log(depot)
			data.images = {};
			let stars = depot.talents.map(talentId => xconstellation.find(ele => ele.talentId === talentId));
			for(let i = 1; i <= 6; i++) {
				data['c'+i] = {
					name: sanitizeDescription(language[stars[i-1].nameTextMapHash]),
					effect: sanitizeDescription(language[stars[i-1].descTextMapHash])
				};
				data.images['c'+i] = `https://upload-os-bbs.mihoyo.com/game_record/genshin/constellation_icon/${stars[i-1].icon}.png`;
			}

			accum[avatarIdToFileName[isPlayer(obj) ? obj.skillDepotId : obj.id]] = data;
		}

		if(isPlayer(obj)) {
			obj.candSkillDepotIds.forEach(ele => {
				obj.skillDepotId = ele;
				dowork();
			});
		} else {
			dowork();
		}
		return accum;
	}, {});
	return myconstellation;
}

module.exports = collateConstellation;