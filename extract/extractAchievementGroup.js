require('./global.js');

const xgroup = getExcel('AchievementGoalExcelConfigData');
const xreward = getExcel('RewardExcelConfigData');
const xmat = getExcel('MaterialExcelConfigData');

function collateAchievementGroup(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let myachievementgroup = xgroup.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id || 0;

		data.name = language[obj.nameTextMapHash];
		data.sortOrder = obj.orderId;

		if(obj.finishRewardId) {
			const rewards = xreward.find(e => e.rewardId === obj.finishRewardId).rewardItemList.filter(f => f.itemId);
			if(rewards.length > 1) console.log(`achievementgroup ${obj.id} has multiple rewards`);
			data.reward = rewards.map(ele => {
				return {
					id: ele.itemId,
					name: language[xmat.find(mat => mat.id === ele.itemId).nameTextMapHash], 
					// count: ele.itemCount
				}; 
			})[0];
		}

		data.filename_icon = obj.iconPath;


		let filename = makeUniqueFileName(obj.nameTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck);
		accum[filename] = data;
		return accum;
	}, {});

	return myachievementgroup;
}

module.exports = collateAchievementGroup;