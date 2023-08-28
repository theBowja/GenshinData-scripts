const charCollate = require('./extractTcgCharacterCard.js');

function collate(lang) {
	return charCollate(lang, true);
}


module.exports = collate;