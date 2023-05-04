require('./globalTcg.js');

const xmat = getExcel('MaterialExcelConfigData');
const xlevel = getExcel('GCGLevelExcelConfigData');
const xllock = getExcel('GCGLevelLockExcelConfigData');
const xreward = getExcel('RewardExcelConfigData');



const propIconType = Object.entries(xlevel[2]).find(e => e[1] === "GCG_LEVEL_ICON_TYPE_COPPER")[0];

const skipdupelog = [];
function collate(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xlevel.reduce((accum, obj) => {
		let data = {};
		data.id = obj.level;

		data.name = obj.level+'';
		data.exp = obj.exp;
		data.unlockdescription = sanitizeDescription(language[obj.unlockDescTextMapHash]);
		data.unlockdescriptionraw = language[obj.unlockDescTextMapHash];

		let rewards = xreward.find(pre => pre.rewardId === obj.rewardId).rewardItemList.filter(pre => pre.itemId);
		data.rewards = rewards.map(repre => {
			let mat = xmat.find(m => m.id === repre.itemId);
			if (mat) {
				let reward = { id: mat.id, name: sanitizeName(language[mat.nameTextMapHash]) };
				reward.count = parseInt(repre.itemCount);
				return reward;
			} else {
				console.log('TcgLevelReward: Unsupported reward mapping');
			}
		});
		data.icontype = obj[propIconType] || 'GCG_LEVEL_ICON_TYPE_NONE';

		let filename = makeFileName(obj.level+'', accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name}`);

		return accum;
	}, {});

	return mydata;
}



module.exports = collate;