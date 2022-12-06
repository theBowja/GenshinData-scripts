require('./global.js');

const xtalent = getExcel('AvatarSkillExcelConfigData'); // combat talents
const xpassive = getExcel('ProudSkillExcelConfigData'); // passive talents. also talent upgrade costs

// object map that converts index to the talent type
const talentCombatTypeMap = { '0': 'combat1', '1': 'combat2', '2': 'combatsp', '4': 'combat3' };

const moraNameTextMapHash = getExcel('MaterialExcelConfigData').find(ele => ele.id === 202).nameTextMapHash;

function collateTalent(lang) {
	const language = getLanguage(lang);
	const xmat = getExcel('MaterialExcelConfigData');
	let mytalent = xplayableAvatar.reduce((accum, obj) => {
		// bad practice to declare functions inside loop but i need to be able to call it multiple times for players
		function dowork() {
			let data = {};
			let depot = xskilldepot.find(ele => ele.id === obj.skillDepotId);
			if(depot === undefined || depot.energySkill === undefined) return; // not a finished (traveler) character
			if(depot.talentStarName === '') return; // unfinished

			let filename = avatarIdToFileName[isPlayer(obj) ? obj.skillDepotId : obj.id];

			data.name = language[obj.nameTextMapHash]; // client-facing name
			if(isPlayer(obj)) data.name += ` (${language[elementTextMapHash[getPlayerElement(obj.skillDepotId)]]})`

			let combat = depot.skills.concat([depot.energySkill]) // get array of combat skills IDs
			// console.log(depot.inherentProudSkillOpens)
			let passive = depot.inherentProudSkillOpens.reduce((accum2, proud, index) => { // get array of passive skill IDs
				if(filename === 'raidenshogun' && index === 2) return accum2; // skip hidden cannot cook passive
				if(proud.proudSkillGroupId) accum2.push(proud.proudSkillGroupId);
				return accum2;
			}, []);
			let parameters = {};
			let costs = {};
			combat.forEach((skId, index) => {
				if(skId === 0) return;
				let talent = xtalent.find(tal => tal.id === skId);
				let combatTypeProp = talentCombatTypeMap[index];
				let ref = data[combatTypeProp] = {};
				ref.id = talent.id;
				ref.name = language[talent.nameTextMapHash];
				let desc = language[talent.descTextMapHash].split('\\n\\n<i>'); // extract out the italicized part
				ref.info = sanitizeDescription(desc[0]);
				if(desc[1]) ref.description = sanitizeDescription(desc[1]);
				ref.icon = talent.skillIcon;
				if(combatTypeProp === 'combat3')
					ref.icon = ref.icon + '_HD';

				ref.labels = [];
				// build the labels
				let attTalent = xpassive.find(tal => (tal.proudSkillGroupId === talent.proudSkillGroupId && tal.level === 1));
				for(let labelTextMap of attTalent.paramDescList) {
					if(language[labelTextMap] === "" || language[labelTextMap] === undefined) continue;
					ref.labels.push(replaceLayout(language[labelTextMap]));
				}

				parameters[combatTypeProp] = {};
				for(let lvl = 1; lvl <= 15; lvl++) {
					if(lvl !== 1 && index === 2) continue; // sprint skills don't have level-up
					let attTalent = xpassive.find(tal => (tal.proudSkillGroupId === talent.proudSkillGroupId && tal.level === lvl));
					attTalent.paramList.forEach((value, paramIndex) => {
						const name = `param${paramIndex+1}`;
						if(value === 0) { // exclude those with values of 0
							if(lvl !== 1 && parameters[combatTypeProp][name] !== undefined) console.log(`talent ${ref.name} value 0`);
							return;
						}
						if(parameters[combatTypeProp][name] === undefined) parameters[combatTypeProp][name] = [];
						parameters[combatTypeProp][name].push(value);
					});
					if(lvl >= 2 && lvl <= 10) { // get upgrade costs
						costs['lvl'+lvl] = [{
							name: language[moraNameTextMapHash],
							count: attTalent.coinCost
						}];
						for(let items of attTalent.costItems) {
							if(items.id === undefined) continue;
							costs['lvl'+lvl].push({
								name: language[xmat.find(ele => ele.id === items.id).nameTextMapHash],
								count: items.count
							})
						}
					}
				}
			});

			passive.forEach((skId, index) => {
				let talent = xpassive.find(pas => pas.proudSkillGroupId === skId);
				let ref = data['passive'+(index+1)] = {}; // store reference in variable to make it easier to access
				ref.id = skId;
				ref.name = language[talent.nameTextMapHash];
				ref.info = sanitizeDescription(language[talent.descTextMapHash]);
				ref.icon = talent.icon;
			});
			data.costs = costs;
			data.parameters = parameters;

			accum[filename] = data;
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
	return mytalent;
}

module.exports = collateTalent;