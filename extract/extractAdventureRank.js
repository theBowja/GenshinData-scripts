require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xplevel = getExcel('PlayerLevelExcelConfigData');
const xreward = getExcel('RewardExcelConfigData');
const xartifact = getExcel('ReliquaryExcelConfigData');
const xweapon = getExcel('WeaponExcelConfigData');

function collateAdventureRank(lang) {
	const language = getLanguage(lang);
	let myadventurerank = xplevel.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;
		// data.rankLevel = obj.rankLevel; // all rarity 4

		data.id = obj.level;
		data.name = obj.level+"";
		data.exp = obj.exp;
		data.unlockDescription = sanitizeDescription(language[obj.unlockDescTextMapHash]);

		if(obj.rewardId) {
			const rewards = xreward.find(e => e.rewardId === obj.rewardId).rewardItemList.filter(f => f.itemId);
			data.reward = rewards.map(ele => {
				let item;
				let type;
				if(item = xmat.find(mat => mat.id === ele.itemId))
					type = "MATERIAL";
				else if(item = xartifact.find(d => d.id === ele.itemId))
					type = "ARTIFACT";
				else if(item = xweapon.find(w => w.id === ele.itemId))
					type = "WEAPON";
			    return {
			    	id: ele.itemId,
					name: language[item.nameTextMapHash], 
					count: ele.itemCount,
					type: type
				}; 
			});
		} else {
			data.reward = [];
		}

		let filename = obj.level+"";
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return myadventurerank;
}

module.exports = collateAdventureRank;