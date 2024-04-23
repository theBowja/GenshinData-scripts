require('./global.js');

// const xmat = getExcel('MaterialExcelConfigData');
const xdaily = getExcel('DailyTaskExcelConfigData');
const xcity = getExcel('CityConfigData');
const xarea = getExcel('WorldAreaConfigData');
// const xtaskreward = getExcel('DailyTaskRewardExcelConfigData');
// const xpreview = getExcel('RewardPreviewExcelConfigData');

const mapRewardToAR = [
	'AR1to5',
	'AR6to10',
	'AR11to15',
	'AR16to20',
	'AR21to25',
	'AR26to30',
	'AR31to35',
	'AR36to40',
	'AR41to45',
	'AR46to50',
	'AR51to55',
	'AR56to60'
]


const skipdupelog = [];
function collateCommission(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};
	let mydata = xdaily.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = language[obj.titleTextMapHash];
		data.description = sanitizeDescription(language[obj.descriptionTextMapHash]);
		data.target = sanitizeDescription(language[obj.targetTextMapHash]);

		data.city = language[xcity.find(e => e.cityId === obj.cityId).cityNameTextMapHash];

		// const taskreward = xtaskreward.find(e => e.iD === obj.taskRewardId);
		// data.rewardpreviews = {};
		// for(let i = 0; i < 12; i++) {
		// 	let rewardpreview = xpreview.find(pre => pre.id === taskreward.dropVec[i].previewRewardId).previewItems.filter(pre => pre.id);
		// 	data.rewardpreviews[mapRewardToAR[i]] = rewardpreview.map(repre => {
		// 		let mat = xmat.find(m => m.id === repre.id);
		// 		let reward = { name: language[mat.nameTextMapHash] };
		// 		reward.count = parseInt(repre.count);
		// 		if(repre.count.includes(';')) reward.countmax = parseInt(repre.count.substring(repre.count.indexOf(';')+1));
		// 		return reward;
		// 	});
		// }


		// data.taskRewardId = obj.taskRewardId



		let filename = makeUniqueFileName(obj.titleTextMapHash, accum);
		if(filename === '') return accum;
		checkDupeName(data, dupeCheck, skipdupelog);
		accum[filename] = data;
		if (!validName(data.name)) console.log(`${__filename.split(/[\\/]/).pop()} invalid data name: ${data.name}`);

		return accum;
	}, {});

	return mydata;
}

module.exports = collateCommission;