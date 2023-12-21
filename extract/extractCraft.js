require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xcombine = getExcel('CombineExcelConfigData');

function collateCraft(lang) {
	const language = getLanguage(lang);

	const sortordermap = {};

	let mycraft = xcombine.reduce((accum, obj) => {
		if (obj.recipeType === "RECIPE_TYPE_CONVERT") return accum; // skip convert recipes

		let data = {};
		data.id = obj.combineId;

		const mat = xmat.find(ele => ele.id === obj.resultItemId);

		data.name = language[mat.nameTextMapHash];
		data.sortOrder = getUniqueSortOrder(obj.subCombineType, obj.resultItemId, sortordermap);
		data.filterText = language[obj.effectDescTextMapHash];

		data.unlockRank = obj.playerLevel;
		data.resultCount = obj.resultItemCount;

		data.moraCost = obj.scoinCost;
		data.recipe = [];
		for (let matitem of obj.materialItems) {
			if (!matitem.id) continue;
			const item = xmat.find(ele => ele.id === matitem.id);
			data.recipe.push({ id: matitem.id, name: language[item.nameTextMapHash], count: matitem.count })
		}

		let filename = makeFileName(getLanguage('EN')[mat.nameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) {
			if (accum[filename].altrecipes === undefined) accum[filename].altrecipes = [];
			accum[filename].altrecipes.push(data.recipe);
		} else {
			accum[filename] = data;
		}
		return accum;
	}, {});

	return mycraft;
}

function getUniqueSortOrder(subCombineType, resultItemId, sortordermap) {
	let sortorder = subCombineType;
	while (sortordermap[sortorder]) {
		if (sortordermap[sortorder] > resultItemId) sortorder++;
		else sortorder--;
	}
	sortordermap[sortorder] = resultItemId;
	return sortorder;
}

module.exports = collateCraft;