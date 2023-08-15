
exportGenshinData();
// copyStatsData();

function exportGenshinData() {
	const { exportCurve, exportData } = require('./extract/Genshin/global.js');

	// exportData('characters', require('./extract/Genshin/extractCharacter.js'));
	// exportCurve('characters', 'AvatarCurveExcelConfigData');
	// exportData('constellations', require('./extract/Genshin/extractConstellation'));
	// exportData('talents', require('./extract/Genshin/extractTalent.js'));
	// exportData('weapons', require('./extract/Genshin/extractWeapon.js'));
	// exportCurve('weapons', 'WeaponCurveExcelConfigData')
	// exportData('artifacts', require('./extract/Genshin/extractArtifact.js'));
	// exportData('foods', require('./extract/Genshin/extractFood'));
	// exportData('materials', require('./extract/Genshin/extractMaterial')); // change: used both TextList/JumpList.
	// exportData('domains', require('./extract/Genshin/extractDomain')); // in the future use levelConfigMap to manually map to domain entrance name
	// exportData('enemies', require('./extract/Genshin/extractEnemy'));
	// exportCurve('enemies', 'MonsterCurveExcelConfigData');

	// //exportData('domains', require('./extract/Genshin/extractDomainMonsterList')); // run only after both domains and enemies have run. sync.

	// exportData('outfits', require('./extract/Genshin/extractOutfit'));
	// exportData('windgliders', require('./extract/Genshin/extractWindGlider'));
	// exportData('animals', require('./extract/Genshin/extractAnimal'));
	// exportData('namecards', require('./extract/Genshin/extractNamecard'));
	// exportData('geographies', require('./extract/Genshin/extractGeography'));
	// exportData('achievements', require('./extract/Genshin/extractAchievement'));
	// exportData('achievementgroups', require('./extract/Genshin/extractAchievementGroup'));
	// exportData('adventureranks', require('./extract/Genshin/extractAdventureRank'));
	// exportData('crafts', require('./extract/Genshin/extractCraft'));

	// exportData('tcgcharactercards', require('./extract/Genshin/extractTcgCharacterCard'));
	// exportData('tcgenemycards', require('./extract/Genshin/extractTcgEnemyCard'));
	// exportData('tcgactioncards', require('./extract/Genshin/extractTcgActionCard'));
	// exportData('tcgstatuseffects', require('./extract/Genshin/extractTcgStatusEffect'));
	// exportData('tcgsummons', require('./extract/Genshin/extractTcgSummon'));
	// exportData('tcgkeywords', require('./extract/Genshin/extractTcgKeyword'));
	// exportData('tcgdetailedrules', require('./extract/Genshin/extractTcgDetailedRule'));
	// // exportData('tcgsprites', require('./extract/Genshin/extractTcgSprite'));
	// // exportData('tcgshopitems', require('./extract/Genshin/extractTcgShopItem'));

	// exportData('tcglevelrewards', require('./extract/Genshin/extractTcgLevelReward'));
	// exportData('tcgcardboxes', require('./extract/Genshin/extractTcgCardBox'));
	// exportData('tcgcardbacks', require('./extract/Genshin/extractTcgCardBack'));


	// exportData('commissions', require('./extract/Genshin/extractCommission'), true); // unfinished
	// exportData('voiceovers', require('./extract/Genshin/extractVoiceover'), true); // unfinished

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