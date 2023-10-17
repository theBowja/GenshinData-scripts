// copy character/weapon stats data into the stats folder
function copyStatsData() {
	const fs = require('fs');
	const path = require('path');
	const config = require(path.resolve(__dirname, '../config.json'));

	if (fs.existsSync(`${config.genshin_export_folder}/EN/characters.json`)) {
		const characterdata = require(`${config.genshin_export_folder}/EN/characters.json`);
		const statsdata = Object.fromEntries(Object.entries(characterdata).map(([k, v]) => [k, v.stats]));
		fs.mkdirSync(path.resolve(__dirname, `./data`), { recursive: true });
		fs.writeFileSync(path.resolve(__dirname, `./data/charactersStats.json`), JSON.stringify(statsdata, null, '\t'))
		if (fs.existsSync(`${config.genshin_export_folder}/curve/characters.json`)) {
			fs.copyFileSync(`${config.genshin_export_folder}/curve/characters.json`, path.resolve(__dirname, `./data/charactersCurve.json`));
		}
	} else {
		console.log('did not find ${exports}/EN/characters.json file');
	}

	if (fs.existsSync(`${config.genshin_export_folder}/EN/weapons.json`)) {
		const weapondata = require(`${config.genshin_export_folder}/EN/weapons.json`);
		const statsdata = Object.fromEntries(Object.entries(weapondata).map(([k, v]) => [k, v.stats]));
		fs.mkdirSync(path.resolve(__dirname, `./data`), { recursive: true });
		fs.writeFileSync(path.resolve(__dirname, `./data/weaponsStats.json`), JSON.stringify(statsdata, null, '\t'))
		if (fs.existsSync(`${config.genshin_export_folder}/curve/weapons.json`)) {
			fs.copyFileSync(`${config.genshin_export_folder}/curve/weapons.json`, path.resolve(__dirname, `./data/weaponsCurve.json`));
		}
	} else {
		console.log('did not find ${exports}/EN/weapons.json file');
	}
	console.log('done copyStatsData');
}

copyStatsData();