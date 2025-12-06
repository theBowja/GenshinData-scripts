const fs = require('fs');

global.config = require('../config.json');

global.getExcel = function(file) { return require(`${config.GenshinData_folder}/ExcelBinOutput/${file}.json`); }
global.getTextMap = function(langcode) {
	if (langcode === 'TH') {
		return Object.assign(require(`${config.GenshinData_folder}/TextMap/TextMap${langcode}_0.json`),
			require(`${config.GenshinData_folder}/TextMap/TextMap${langcode}_1.json`))
	} else {
		return require(`${config.GenshinData_folder}/TextMap/TextMap${langcode}.json`);
	}
}

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
// const langcodes = ['EN'];

/* ========================================================================================== */


// const weaponIdToFileName = xweapon.reduce((accum, obj) => {
// 	accum[obj.id] = 

// }, {})


// UNUSED object map that converts AvatarAssocType into a TextMapHash
const assocTextMapHash = ['ASSOC_TYPE_MONDSTADT', 'ASSOC_TYPE_LIYUE', 'ASSOC_TYPE_FATUI'];

global.isPlayer = function(data) { return data.candSkillDepotIds && data.candSkillDepotIds.length !== 0; }
global.isTraveler = function(data) { return isPlayer(data) && !isRealManekin(data) && !isFakeManekin(data); }
global.isFakeManekin = function(data) { return data.id === 10000998 || data.id === 10000999 || data.id === 11000998 || data.id === 11000999; } // UCG test character prototype
global.isRealManekin = function(data) { return data.id === 10000117 || data.id === 10000118;}
global.getPlayerElement = function(SkillDepotId) { let tmp = xskilldepot.find(ele => ele.id === SkillDepotId); return tmp === undefined ? tmp : tmp.talentStarName.split('_').pop(); }
global.getLanguage = function(abbriev) { return getTextMap(abbriev.toUpperCase()); }
global.normalizeStr = function(str) { return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
global.makeFileName = function(str, lang) { return normalizeStr(str).toLowerCase().replace(/[^a-z0-9]/g,''); }
global.convertBold = function(str, removeBold) { return str.replace(/<color=#FFD780FF>(.*?)<\/color>/gi, removeBold ? '$1' : '**$1**'); }
global.convertLinkToBold = function(str, removeBold) {
	str = str.replace(/{LINK#.*?}(.*?){\/LINK.*?}/gi, removeBold ? '$1' : '**$1**');
	return str.replace(/{LINK#.*?}/gi, '');
}
global.stripHTML = function(str) { return (str || '').replace(/(<([^>]+)>)/gi, ''); }
global.capitalizeFirst = function(str) { return str[0].toUpperCase() + str.toLowerCase().slice(1); }
global.replaceLayout = function(str) { return str.replace(/{LAYOUT_MOBILE#.*?}{LAYOUT_PC#(.*?)}{LAYOUT_PS#.*?}/gi,'$1').replace('#','').replaceAll('{NON_BREAK_SPACE}', ' '); }
global.removeSprite = function(str) { return str.replace(/{SPRITE_PRESET.*?}/gi, ''); }
global.removeTimezone = function(str) { return str.replace("{TIMEZONE}", ""); }
global.sanitizeDescription = function(str, removeBold) { return removeTimezone(removeSprite(replaceNewline(replaceLayout(stripHTML(convertLinkToBold(convertBold(str || '', removeBold), removeBold)))))); }
global.getPropNameWithMatch = function(excel, idkey, idval, propval) {
	const tmp = excel.find(e => e[idkey] === idval);
	if (!tmp) throw new Error(`getPropNameWithMatch: Did not find value for key`);
	return Object.entries(tmp).find(e => e[1] === propval || e[1][0] === propval)[0];
};
global.validName = function(name) { return name !== '' && !name.includes('</') && !/[|{}#]/.test(name)}
global.sanitizeName = function(str, id) { 
	if (str === undefined) {
		console.log(`Error: ${id} does not have a mapped name`);
		return `!!!errorerror${id}`;
	}

	str = str.split('|s')[0];
	if (str.includes('{NON_BREAK_SPACE}')) {
		if (str[0] !== '#') console.log(`${str} REMOVING NON_BREAK_SPACE BUT IT DOESNT START WITH #`);
		str = str.replaceAll('{NON_BREAK_SPACE}', '').substring(1);
	}
	return str;
}

global.replaceNewline = function(str) { return str.replace(/\\n/gi, '\n'); }
global.replaceNonBreakSpace = function(str) { return str.replaceAll('{NON_BREAK_SPACE}', ' '); };
global.removeColorHTML = function(str) { return str.replace(/<color=#.*?>(.*?)<\/color>/gis, '$1'); };
global.replaceLayoutPC = function(str) { return str.replace(/{LAYOUT_MOBILE#.*?}{LAYOUT_PC#(.*?)}{LAYOUT_PS#.*?}/gi,'$1'); };
global.replaceGenderM = function(str) { return str.replace(/{F#.*?}/gi, '').replace(/{M#(.*?)}/gi, '$1'); }
global.replaceGenderF = function(str) { return str.replace(/{M#.*?}/gi, '').replace(/{F#(.*?)}/gi, '$1'); }
global.removeHashtag = function(str) { return str.substring(str[0] === '#' ? 1 : 0); }
global.sanitizer = function(str, ...sanfunctions) {
	for (const sanfunc of sanfunctions) { str = sanfunc(str); }
	return str;
}
global.validateString = function(str, folder, lang, throwerror = true) {
    // thoma's talent string has an empty color tag for some reason
    str = str.replace('<color=#FF9999FF></color>', '');

    if (str === undefined) {
        if (throwerror) throw `${folder} ${lang} invalid string: String is **undefined**`;
        return false;
    }
    if (str === '') {
        if (throwerror) throw `${folder} ${lang} invalid string: String is **empty**`;
        return false;
    }
    const failedCharMatch = /\||{|}|#|<\/|\\n/.exec(str);
    if (failedCharMatch) {
        const failedChar = failedCharMatch[0];
        if (throwerror) throw `${folder} ${lang} invalid string: Contains **invalid character** "${failedChar}"\n ${str}`;
        return false;
    }
    
    return true;
}

global.getMatSourceText = function(id, textmap) {
	let tmp = getExcel('MaterialSourceDataExcelConfigData').find(e => e.id === id);
	tmp = tmp.textList.concat(tmp.jumpDescs);
	return tmp.map(e => textmap[e]).filter(e => e !== '' && e !== undefined);
}

global.localeMap = {
	'CHS': 'zh-cn',
	'CHT': 'zh-tw',
	'DE':  'de',
	'EN':  'en',
	'ES':  'es',
	'FR':  'fr',
	'ID':  'id',
	'IT':  'it',
	'JP':  'ja',
	'KR':  'ko',
	'PT':  'pt',
	'RU':  'ru',
	'TH':  'th',
	'TR':  'tr',
	'VI':  'vi'
};
global.bodyToGender = {
	'BODY_BOY': 'MALE',
	'BODY_LOLI': 'FEMALE',
	'BODY_GIRL': 'FEMALE',
	'BODY_MALE': 'MALE',
	'BODY_LADY': 'FEMALE'
}
global.genderTranslations = {
	'MALE': {
		CHS: '男', CHT: '男', DE: 'Männlich', EN: 'Male', ES: 'Masculino',
		FR: 'Homme', ID: 'Pria', IT: 'maschio', JP: '男', KR: '남성', PT: 'Masculino',
		RU: 'Мужской', TH: 'ชาย', TR: 'erkek', VI: 'nam'
	},
	'FEMALE': {
		CHS: '女', CHT: '女', DE: 'Weiblich', EN: 'Female', ES: 'Femenino',
		FR: 'Femme', ID: 'Perempuan', IT: 'femmina', JP: '女', KR: '여성', PT: 'Feminino',
		RU: 'Женский', TH: 'ผู้หญิง', TR: 'kadın', VI: 'nữ'
	}
}
global.mapElementToType = { // for characters
	anemo: 'ELEMENT_ANEMO', geo: 'ELEMENT_GEO', cryo: 'ELEMENT_CRYO', hydro: 'ELEMENT_HYDRO',
	pyro: 'ELEMENT_PYRO', dendro: 'ELEMENT_DENDRO', electro: 'ELEMENT_ELECTRO', none: 'ELEMENT_NONE'
}

/* ======================================================================================= */

// object map that converts the genshin coded element into a TextMapHash
global.elementTextMapHash = ['Fire', 'Water', 'Grass', 'Electric', 'Wind', 'Ice', 'Rock'].reduce((accum, element) => {
	accum[element] = xmanualtext.find(ele => ele.textMapId === element).textMapContentTextMapHash;
	return accum;
}, {});

global.xplayableAvatar = xavatar.filter(obj => (obj.avatarPromoteId !== 2 || obj.id === 10000002) && obj.id !== 10000903 && !isFakeManekin(obj)); // array
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
let mapENtoNum = undefined;
// mapENtoNum = { 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7 };
global.mapENtoNum = function() {
	if (mapENtoNum !== undefined) return mapENtoNum;

	const sampleDungeon = getExcel('DailyDungeonConfigData')[0];
	mapENtoNum = {};
	let added = {};
	for (let [key, value] of Object.entries(sampleDungeon)) {
		if (!Array.isArray(value)) continue;

		if (value.length === 4 && added[7] === undefined) {
			mapENtoNum[key] = 7;
			added[7] = true;
		}
		
		if (value.length !== 1) continue;
		if (value[0] === 5254 && added[1] === undefined) { mapENtoNum[key] = 1; added[1] = true; }
		else if (value[0] === 5258 && added[2] === undefined) { mapENtoNum[key] = 2; added[2] = true; }
		else if (value[0] === 5262 && added[3] === undefined) { mapENtoNum[key] = 3; added[3] = true; }
		else if (value[0] === 5254 && added[4] === undefined) { mapENtoNum[key] = 4; added[4] = true; }
		else if (value[0] === 5258 && added[5] === undefined) { mapENtoNum[key] = 5; added[5] = true; }
		else if (value[0] === 5262 && added[6] === undefined) { mapENtoNum[key] = 6; added[6] = true; }
	}

	// sort by value
	mapENtoNum = Object.fromEntries(
		Object.entries(mapENtoNum).sort(([,a],[,b]) => a-b)
	);
	return mapENtoNum;
}

const uniqueLog = {};
// if it isn't unique, then appends "a" to end. or "b". all the way to "z".
global.makeUniqueFileName = function(textmaphash, map, sanitize) {
	let name = getLanguage('EN')[textmaphash];
	if (sanitize) name = sanitizeDescription(name);
	if (name === "" || name === undefined) return "";
	let filename = makeFileName(name);
	if (map[filename] === undefined) return filename;

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
global.checkDupeName = function(data, namemap, skipdupelog=[], donotconsolelog = false) {
	let name = data.name;
	let key = name.toLowerCase().replace(/[ ["'·\.「」…！\!？\?(\)。，,《》—『』«»<>\]#{\}]/g, '');
	let id;
	if (namemap[key]) { // if already exists, then give it dupealias property and change 
		namemap[key].dupealias = namemap[key].name + ' 0';
		id = namemap[key].id || namemap[key].id[0] || -1;
	} else {
		if (data.id === undefined) console.log(`Error: data has no id. Name: ${data.name}`);
		namemap[key] = data;
		return false;
	}
	let i = 1;
	while (namemap[key+i]) { i++; }
	data.dupealias = name+' '+i;
	if(!donotconsolelog && !dupelogskip.includes(id) && !skipdupelog.includes(id)) console.log(" dupealias added " + id + ": "+data.dupealias);
	namemap[key+i] = data;
	return true;
}

const xcity = getExcel('CityConfigData');
let cityNameTextMapHash = undefined;
function getCityNameTextMapHash() {
	if(cityNameTextMapHash !== undefined) return cityNameTextMapHash;
	for (let [key, value] of Object.entries(xcity[0])) {
		if (typeof value === 'number' && getLanguage('EN')[value] === 'Mondstadt') {
			cityNameTextMapHash = key;
			return cityNameTextMapHash;
		}
	}
}

// adds Snezhnaya manually
if(!xcity.find(ele => getLanguage('EN')[ele[getCityNameTextMapHash()]] === 'Snezhnaya')) {
	if (getLanguage('EN')[536575635]) {
		const citydata = { cityId: 8758412 };
		citydata[getCityNameTextMapHash()] = 536575635;
		xcity.push(citydata);
	} else {
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
	fs.mkdirSync(`${config.genshin_export_folder}/curve`, { recursive: true });
	fs.writeFileSync(`${config.genshin_export_folder}/curve/${folder}.json`, JSON.stringify(output, null, '\t'));
}

function exportData(folder, collateFunc, englishonly, skipwrite) {
	const starttime = Date.now();
	langcodes.forEach(lang => {
		if(englishonly && lang !== 'EN') return;
		let data = collateFunc(lang);
		fs.mkdirSync(`${config.genshin_export_folder}/${lang}`, { recursive: true });
		if(!skipwrite) {
			fs.writeFileSync(`${config.genshin_export_folder}/${lang}/${folder}.json`, JSON.stringify(data, null, '\t'));
			if(JSON.stringify(data).search('undefined') !== -1) console.log('undefined found in '+folder);
			if(data[""]) console.log('empty key found in '+folder);
		}
	});
	
	console.log(`done ${folder} in ${(Date.now()-starttime) / 1000} seconds`);
}

module.exports = {
	exportCurve: exportCurve,
	exportData: exportData
}