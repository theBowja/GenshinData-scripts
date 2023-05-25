require('./global.js');

const xrecipe = getExcel('CookRecipeExcelConfigData');
const xmaterial = getExcel('MaterialExcelConfigData');
const xsource = getExcel('MaterialSourceDataExcelConfigData');
const xspecialty = getExcel('CookBonusExcelConfigData');
const xavatar = getExcel('AvatarExcelConfigData');

function getSpecialty(id) { return xspecialty.find(ele => ele.recipeId === id); }
function getMaterial(id) { return xmaterial.find(ele => ele.id === id); }
function getAvatar(id) { return xavatar.find(ele => ele.id === id); }
function getManualTextMapHash(id) { 
	if(id === 'COOK_FOOD_DEFENSE') id = 'COOK_FOOD_DEFENCE';
	return xmanualtext.find(ele => ele.textMapId === id).textMapContentTextMapHash;
}

const mapQualityToProp = {
	'FOOD_QUALITY_STRANGE': 'suspicious',
	'FOOD_QUALITY_ORDINARY': 'normal',
	'FOOD_QUALITY_DELICIOUS': 'delicious',
}

function collateFood(lang) {
	const language = getLanguage(lang);
	const dupeCheck = {};

	let myfood = xrecipe.reduce((accum, obj) => {
		//if(obj.id !== 1003) return accum;

		let data = {};
		data.id = obj.id;

		data.name = language[obj.nameTextMapHash];
		data.rarity = obj.rankLevel+'';
		data.foodtype = 'NORMAL';
		data.filterType = obj.foodType;
		data.filterText = language[getManualTextMapHash(obj.foodType)];
		data.foodcategory = undefined;
		data.effect = obj.effectDesc.reduce((accum, eff) => {
			const tmp = replaceLayout(stripHTML(language[eff]));
			if(tmp) accum.push(tmp);
			return accum;
		}, []).join('\n');
		data.description = sanitizer(language[obj.descTextMapHash], removeHashtag, replaceGenderM, replaceNonBreakSpace);
		validateString(data.description, 'foods.description', lang);

		// check error
		for(let i = 2; i <= 3; i++) { const tmp = language[obj.effectDesc[i]]; if(tmp) console.log(`${obj.id} ${data.name}: ${tmp}`); }

		// get suspicious, normal, delicious
		for(let xd of obj.qualityOutputVec) {
			xd = getMaterial(xd.id);
			let subdata = {};
			if(language[xd.interactionTitleTextMapHash]) console.log(`food ${obj.id} has interaction`);
			if(language[xd.specialDescTextMapHash]) console.log(`food ${obj.id} has special`);
			subdata.effect = language[xd.effectDescTextMapHash];
			subdata.description = sanitizer(language[xd.descTextMapHash], removeHashtag, replaceGenderM, replaceNonBreakSpace);
			validateString(subdata.description, 'foods.subdescription', lang);
			data[mapQualityToProp[xd.foodQuality]] = subdata;
			data.foodcategory = xd.effectIcon//.substring(13);
		}
		data.ingredients = obj.inputVec.reduce((accum, ing) => {
			if(ing.id === undefined) return accum;
			const mat = getMaterial(ing.id);
			accum.push({ id: ing.id, name: language[mat.nameTextMapHash], count: ing.count });
			return accum;
		}, []);
		// data.source = 
		data.filename_icon = obj.icon;


		let filename = makeFileName(getLanguage('EN')[obj.nameTextMapHash]);
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		checkDupeName(data, dupeCheck)
		accum[filename] = data;

		// check if there is a specialty
		let myspec = getSpecialty(obj.id);
		if(myspec === undefined) return accum;
		let xd = getMaterial(myspec.paramVec[0]);
		// if(xd === undefined) return accum;
		let foodfilter = data.foodfilter;
		let basedish = data.name;
		let ingredients = data.ingredients;

		let spdata = {};
		spdata.name = language[xd.nameTextMapHash];
		spdata.rarity = xd.rankLevel+'';
		spdata.foodtype = 'SPECIALTY';
		spdata.foodfilter = foodfilter;
		spdata.foodcategory = xd.effectIcon.substring(13);

		if(language[xd.interactionTitleTextMapHash]) console.log(`specialty ${obj.id} has interaction`);
		if(language[xd.specialDescTextMapHash]) console.log(`specialty ${obj.id} has special`);
		spdata.effect = replaceLayout(language[xd.effectDescTextMapHash]);
		spdata.description = sanitizer(language[xd.descTextMapHash], replaceNewline, removeHashtag, replaceGenderM, replaceNonBreakSpace);
		validateString(spdata.description, 'foods.spdatadescription', lang);

		spdata.basedish = basedish;
		spdata.character = language[getAvatar(myspec.avatarId).nameTextMapHash];
		
		spdata.ingredients = ingredients;
		spdata.filename_icon = xd.icon;

		filename = makeFileName(getLanguage('EN')[xd.nameTextMapHash]);
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		checkDupeName(spdata, dupeCheck);
		accum[filename] = spdata;

		return accum;
	}, {});
	// console.log(myfood);

	return myfood;
}

module.exports = collateFood;