
// exportData();
copyStatsData();

function exportData() {
	const { exportCurve, exportData } = require('./extract/global.js');

	exportData('characters', require('./extract/extractCharacter.js'));
	// exportCurve('characters', 'AvatarCurveExcelConfigData');
	// exportData('constellations', require('./extract/extractConstellation'));
	// exportData('talents', require('./extract/extractTalent.js'));
	exportData('weapons', require('./extract/extractWeapon.js'));
	// exportCurve('weapons', 'WeaponCurveExcelConfigData')
	// exportData('artifacts', require('./extract/extractArtifact.js'));
	// exportData('foods', require('./extract/extractFood'));
	// exportData('materials', require('./extract/extractMaterial')); // change: used both TextList/JumpList.
	// exportData('domains', require('./extract/extractDomain'));
	// exportData('enemies', require('./extract/extractEnemy'));
	// exportCurve('enemies', 'MonsterCurveExcelConfigData');

	// exportData('domains', require('./extract/extractDomainMonsterList')); // run only after both domains and enemies have run. sync.

	// exportData('outfits', require('./extract/extractOutfit'));
	// exportData('windgliders', require('./extract/extractWindGlider'));
	// exportData('animals', require('./extract/extractAnimal'));
	// exportData('namecards', require('./extract/extractNamecard'));
	// exportData('geographies', require('./extract/extractGeography'));
	// exportData('achievements', require('./extract/extractAchievement'));
	// exportData('achievementgroups', require('./extract/extractAchievementGroup'));
	// exportData('adventureranks', require('./extract/extractAdventureRank'));
	// exportData('crafts', require('./extract/extractCraft'));

	exportData('tcgcards', require('./extract/extractTcgCard'));
	exportData('tcgkeywords', require('./extract/extractTcgKeyword'));
	exportData('tcgsprites', require('./extract/extractTcgSprite'));
	exportData('tcgshopitems', require('./extract/extractTcgShopItem'));

	exportData('tcglevelrewards', require('./extract/extractTcgLevelReward'));
	exportData('tcgcardboxes', require('./extract/extractTcgCardBox'));
	exportData('tcgcardbacks', require('./extract/extractTcgCardBack'));


	// exportData('commissions', require('./extract/extractCommission'), true); // unfinished
	// exportData('voiceovers', require('./extract/extractVoiceover'), true); // unfinished

	// // exportData('fishingpoints', require('./extractFishingPoint'));  // unfinished
}


// copy character/weapon stats data into the stats folder
function copyStatsData() {
	const fs = require('fs');
	const config = require('./config.json');

	if (fs.existsSync(`${config.export_folder}/EN/characters.json`)) {
		const characterdata = require(`${config.export_folder}/EN/characters.json`);
		const statsdata = Object.fromEntries(Object.entries(characterdata).map(([k, v]) => [k, v.stats]));
		fs.mkdirSync(`./stats/data`, { recursive: true });
		fs.writeFileSync(`./stats/data/charactersStats.json`, JSON.stringify(statsdata, null, '\t'))
		if (fs.existsSync(`${config.export_folder}/curve/characters.json`)) {
			fs.copyFileSync(`${config.export_folder}/curve/characters.json`, `./stats/data/charactersCurve.json`);
		}
	}

	if (fs.existsSync(`${config.export_folder}/EN/weapons.json`)) {
		const weapondata = require(`${config.export_folder}/EN/weapons.json`);
		const statsdata = Object.fromEntries(Object.entries(weapondata).map(([k, v]) => [k, v.stats]));
		fs.mkdirSync(`./stats/data`, { recursive: true });
		fs.writeFileSync(`./stats/data/weaponsStats.json`, JSON.stringify(statsdata, null, '\t'))
		if (fs.existsSync(`${config.export_folder}/curve/weapons.json`)) {
			fs.copyFileSync(`${config.export_folder}/curve/weapons.json`, `./stats/data/weaponsCurve.json`);
		}
	}
}