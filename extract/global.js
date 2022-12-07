const fs = require('fs');

const config = require('../config.json');

global.getExcel = function(file) { return require(`${config.GenshinData_folder}/ExcelBinOutput/${file}.json`); }
global.getTextMap = function(langcode) { return require(`${config.GenshinData_folder}/TextMap/TextMap${langcode}.json`); }

global.getReadable = function(name, langcode) { 
	let path = `${config.GenshinData_folder}/Readable/${langcode}/${name}.txt`;

	if (fs.existsSync(path)) {
		return fs.readFileSync(path, 'utf8').replaceAll('\r\n', '\n').trim();
	} else {
		return '';
	}
}

const xavatar = getExcel('AvatarExcelConfigData');    // array

global.xskilldepot = getExcel('AvatarSkillDepotExcelConfigData');

global.xmanualtext = getExcel('ManualTextMapConfigData');

// if you're adding a new language code, remember to add a translation for Snezhnaya below
const langcodes = ['CHS', 'CHT', 'DE', 'EN', 'ES', 'FR', 'ID', 'IT', 'JP', 'KR', 'PT', 'RU', 'TH', 'TR', 'VI'];

/* ========================================================================================== */


// const weaponIdToFileName = xweapon.reduce((accum, obj) => {
// 	accum[obj.id] = 

// }, {})


// UNUSED object map that converts AvatarAssocType into a TextMapHash
const assocTextMapHash = ['ASSOC_TYPE_MONDSTADT', 'ASSOC_TYPE_LIYUE', 'ASSOC_TYPE_FATUI'];

global.isPlayer = function(data) { return data.candSkillDepotIds && data.candSkillDepotIds.length !== 0; }
global.getPlayerElement = function(SkillDepotId) { let tmp = xskilldepot.find(ele => ele.id === SkillDepotId); return tmp === undefined ? tmp : tmp.talentStarName.split('_').pop(); }
global.getLanguage = function(abbriev) { return getTextMap(abbriev.toUpperCase()); }
global.normalizeStr = function(str) { return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
global.makeFileName = function(str, lang) { return normalizeStr(str).toLowerCase().replace(/[^a-z0-9]/g,''); }
global.convertBold = function(str) { return str.replace(/<color=#FFD780FF>(.*?)<\/color>/gi, '**$1**'); }
global.stripHTML = function(str) { return (str || '').replace(/(<([^>]+)>)/gi, ''); }
global.capitalizeFirst = function(str) { return str[0].toUpperCase() + str.toLowerCase().slice(1); }
global.replaceLayout = function(str) { return str.replace(/{LAYOUT_MOBILE#.*?}{LAYOUT_PC#(.*?)}{LAYOUT_PS#.*?}/gi,'$1').replace('#','').replaceAll('{NON_BREAK_SPACE}', ' '); }
global.replaceNewline = function(str) { return str.replace(/\\n/gi, '\n'); }
global.sanitizeDescription = function(str) { return replaceNewline(replaceLayout(stripHTML(convertBold(str || '')))); }
global.getMatSourceText = function(id, textmap) { return getExcel('MaterialSourceDataExcelConfigData').find(e => e.id === id).textList.map(e => textmap[e]).filter(e => e !== '' && e !== undefined); }
/* ======================================================================================= */

// object map that converts the genshin coded element into a TextMapHash
global.elementTextMapHash = ['Fire', 'Water', 'Grass', 'Electric', 'Wind', 'Ice', 'Rock'].reduce((accum, element) => {
	accum[element] = xmanualtext.find(ele => ele.textMapId === element).textMapContentTextMapHash;
	return accum;
}, {});

global.xplayableAvatar = xavatar.filter(obj => obj.avatarPromoteId !== 2 || obj.id === 10000002); // array
// object map that converts an avatar Id or traveler SkillDepotId to filename
global.avatarIdToFileName = xplayableAvatar.reduce((accum, obj) => {
	if(obj.id === 10000005) accum[obj.id] = 'aether';
	else if(obj.id === 10000007) accum[obj.id] = 'lumine';
	else accum[obj.id] = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
	if(isPlayer(obj)) { // 
		obj.candSkillDepotIds.forEach(skdeId => {
			let trelement = elementTextMapHash[getPlayerElement(skdeId)];
			if(trelement === undefined) return;
			accum[skdeId] = makeFileName(getLanguage('EN')[obj.nameTextMapHash] + getLanguage('EN')[trelement]); 
		})
	}
	return accum;
}, {});

// object map that converts a WeaponType into a TextMapHash
global.weaponTextMapHash = ['WEAPON_SWORD_ONE_HAND', 'WEAPON_CATALYST', 'WEAPON_CLAYMORE', 'WEAPON_BOW', 'WEAPON_POLE'].reduce((accum, str) => {
	accum[str] = xmanualtext.find(ele => ele.textMapId === str).textMapContentTextMapHash;
	return accum;
}, {});

// translates day of the week. 1 => Monday, etc. Returns textmaphash
global.dayOfWeek = function(num) {
	return xmanualtext.find(ele => ele.textMapId === 'UI_ABYSSUS_DATE'+num).textMapContentTextMapHash;
}

const uniqueLog = {};
// if it isn't unique, then appends "a" to end. or "b". all the way to "z".
global.makeUniqueFileName = function(textmaphash, map) {
	let name = getLanguage('EN')[textmaphash];
	if(name === "" || name === undefined) return "";
	let filename = makeFileName(name);
	if(map[filename] === undefined) return filename;

	let i = 1;
	while(map[filename+"-"+("0" + i).slice(-2)] !== undefined) { i++; }
	if(i > 99) console.log("cannot make unique filename for " + name);
	else {
		// if (!uniqueLog[name + ' ' + i])
		// 	console.log('  dupe made: '+name + ' ' + i)
		return filename+"-"+("0" + i).slice(-2);
	}
}

const dupelogskip = [118002, 11419, 100934, 28030501, 80032, 82010];
global.checkDupeName = function(data, namemap) {
	let name = data.name;
	let key = name.toLowerCase().replace(/[ ["'·\.「」…！\!？\?(\)。，,《》—『』«»<>\]#{\}]/g, '');
	let id;
	if (namemap[key]) {
		namemap[key].dupealias = namemap[key].name + ' 0';
		id = namemap[key].id || namemap[key].id[0] || -1;
	} else {
		namemap[key] = data;
		return false;
	}
	let i = 1;
	while (namemap[key+i]) { i++; }
	data.dupealias = name+' '+i;
	if(!dupelogskip.includes(id)) console.log(" dupealias added " + id + ": "+data.dupealias);
	namemap[key+i] = data;
	return true;
}

const xcity = getExcel('CityConfigData');
// adds Snezhnaya manually
if(!xcity.find(ele => getLanguage('EN')[ele.cityNameTextMapHash] === 'Snezhnaya')) {
	getLanguage('CHS')['Snezhnaya'] = '至冬国';
	getLanguage('CHT')['Snezhnaya'] = '至冬國';
	getLanguage('DE')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('EN')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('ES')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('FR')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('ID')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('IT')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('JP')['Snezhnaya'] = 'スネージナヤ';
	getLanguage('KR')['Snezhnaya'] = '스네즈나야';
	getLanguage('PT')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('RU')['Snezhnaya'] = 'Снежная';
	getLanguage('TH')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('TR')['Snezhnaya'] = 'Snezhnaya';
	getLanguage('VI')['Snezhnaya'] = 'Snezhnaya';

	xcity.push({ cityId: 8758412, cityNameTextMapHash: 'Snezhnaya'})
}

/* =========================================================================================== */

function exportCurve(folder, file) {
	const xcurve = getExcel(file);
	let output = {};
	xcurve.forEach(ele => {
		let curveinfo = {};
		ele.curveInfos.forEach(ele => {
			curveinfo[ele.type] = ele.value;
		});
		output[ele.level] = curveinfo;
	});
	fs.mkdirSync(`${config.export_folder}/curve`, { recursive: true });
	fs.writeFileSync(`${config.export_folder}/curve/${folder}.json`, JSON.stringify(output, null, '\t'));
}

function exportData(folder, collateFunc, englishonly, skipwrite) {
	langcodes.forEach(lang => {
		if(englishonly && lang !== 'EN') return;
		let data = collateFunc(lang);
		fs.mkdirSync(`./export/${lang}`, { recursive: true });
		if(!skipwrite) {
			fs.writeFileSync(`${config.export_folder}/${lang}/${folder}.json`, JSON.stringify(data, null, '\t'));
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