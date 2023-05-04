const fs = require('fs');

const config = require('../../config.json');

global.getExcel = function(file) { return require(`${config.GenshinData_folder}/ExcelOutput/${file}.json`); }
global.getTextMap = function(langcode) { return require(`${config.GenshinData_folder}/TextMap/TextMap${langcode}.json`); }

const langcodes = ['CHT', 'CN', 'DE', 'EN', 'ES', 'FR', 'ID', 'JP', 'KR', 'PT', 'RU', 'TH', 'VI'];


/* =========================================================================================== */

// function exportCurve(folder, file) {
// 	const xcurve = getExcel(file);
// 	let output = {};
// 	xcurve.forEach(ele => {
// 		let curveinfo = {};
// 		ele.curveInfos.forEach(ele => {
// 			curveinfo[ele.type] = ele.value;
// 		});
// 		output[ele.level] = curveinfo;
// 	});
// 	fs.mkdirSync(`${config.genshin_export_folder}/curve`, { recursive: true });
// 	fs.writeFileSync(`${config.genshin_export_folder}/curve/${folder}.json`, JSON.stringify(output, null, '\t'));
// }

function exportData(folder, collateFunc, englishonly, skipwrite) {
	langcodes.forEach(lang => {
		if(englishonly && lang !== 'EN') return;
		let data = collateFunc(lang);
		fs.mkdirSync(`./export/${lang}`, { recursive: true });
		if(!skipwrite) {
			fs.writeFileSync(`${config.genshin_export_folder}/${lang}/${folder}.json`, JSON.stringify(data, null, '\t'));
			if(JSON.stringify(data).search('undefined') !== -1) console.log('undefined found in '+folder);
			if(data[""]) console.log('empty key found in '+folder);
		}
	});
	console.log("done "+folder);
}

module.exports = {
	exportCurve: exportCurve,
	exportData: exportData
}