
exportGenshinData();

function exportGenshinData() {
	const { exportCurve, exportData, exportDataByLang, langcodes } = require('./extract/global.js');

	const tasks = [
		// { folder: 'characters', collate: require('./extract/extractCharacter.js') },
		// { folder: 'constellations', collate: require('./extract/extractConstellation') },
		// { folder: 'talents', collate: require('./extract/extractTalent.js') },
		// { folder: 'weapons', collate: require('./extract/extractWeapon.js') },
		// { folder: 'artifacts', collate: require('./extract/extractArtifact.js') },
		// { folder: 'foods', collate: require('./extract/extractFood') },
		// { folder: 'materials', collate: require('./extract/extractMaterial') },
		// { folder: 'domains', collate: require('./extract/extractDomain') },
		// { folder: 'enemies', collate: require('./extract/extractEnemy') },

		// { folder: 'outfits', collate: require('./extract/extractOutfit') },
		// { folder: 'windgliders', collate: require('./extract/extractWindGlider') },
		// { folder: 'animals', collate: require('./extract/extractAnimal') },
		// { folder: 'namecards', collate: require('./extract/extractNamecard') },
		// { folder: 'geographies', collate: require('./extract/extractGeography') },
		// { folder: 'achievements', collate: require('./extract/extractAchievement') },
		// { folder: 'achievementgroups', collate: require('./extract/extractAchievementGroup') },
		// { folder: 'adventureranks', collate: require('./extract/extractAdventureRank') },
		// { folder: 'crafts', collate: require('./extract/extractCraft') },
		// { folder: 'emojis', collate: require('./extract/extractEmoji') },

		// { folder: 'voiceovers', collate: require('./extract/extractVoiceover') },

		// { folder: 'tcgcharactercards', collate: require('./extract/extractTcgCharacterCard') },
		// { folder: 'tcgenemycards', collate: require('./extract/extractTcgEnemyCard') },
		// { folder: 'tcgactioncards', collate: require('./extract/extractTcgActionCard') },
		// { folder: 'tcgstatuseffects', collate: require('./extract/extractTcgStatusEffect') },
		// { folder: 'tcgsummons', collate: require('./extract/extractTcgSummon') },
		// { folder: 'tcgkeywords', collate: require('./extract/extractTcgKeyword') },
		// { folder: 'tcgdetailedrules', collate: require('./extract/extractTcgDetailedRule') },
		// { folder: 'tcglevelrewards', collate: require('./extract/extractTcgLevelReward') },
		// { folder: 'tcgcardboxes', collate: require('./extract/extractTcgCardBox') },
		// { folder: 'tcgcardbacks', collate: require('./extract/extractTcgCardBack') },
	];

	const curveTasks = [
		{ folder: 'characters', file: 'AvatarCurveExcelConfigData' },
		{ folder: 'weapons', file: 'WeaponCurveExcelConfigData' },
		{ folder: 'enemies', file: 'MonsterCurveExcelConfigData' },
	];

	// Export curves (not language dependent, run once)
	curveTasks.forEach(task => exportCurve(task.folder, task.file));

	// Export data by language (optimized orchestration)
	langcodes.forEach(lang => {
		const starttime = Date.now();
		console.log(`Processing language: ${lang}`);
		tasks.forEach(task => {
			exportDataByLang(task.folder, task.collate, lang, false);
		});
		if (tasks.length > 0) console.log(`done ${lang} in ${(Date.now() - starttime) / 1000} seconds`);
	});

	// Special cross-data tasks if needed
	// exportDataByLang('domains', require('./extract/extractDomainMonsterList'), 'EN'); // example of sync/special run

	// writeVOFile();
}


function writeVOFile() {
	const fs = require('fs');
	const config = require('./config.json');
	const voiceovers = require(`${config.genshin_export_folder}/EN/voiceovers.json`);

	let vofiles = Object.values(voiceovers).flatMap(voiceover => {
		const friendFiles = voiceover.friendLines.flatMap(line => {
			if (line.hasGenderedVoicefile) return [line.voicefile, line.voicefile_male];
			else return line.voicefile;
		});
		const actionFiles = voiceover.actionLines.flatMap(line => {
			if (line.hasGenderedVoicefile) return [line.voicefile, line.voicefile_male];
			else return line.voicefile;
		});

		return friendFiles.concat(actionFiles);
	});

	vofiles = vofiles.map(file => file.replaceAll('/', '\\') + '.wem');

	fs.writeFileSync('./voice/db-vo.txt', vofiles.join('\n'));
}