const fs = require('fs');
const path = require('path');
const stringify = require('json-stringify-pretty-compact');

/**
 * Get every file name that has a '#' in it.
 */
global.getDuplicatedFilenames = global.filterDuplicatedFilenames = function(filelist) {
	return filelist.filter(f => f.includes('#'));
}

global.extractBaseFilename = function(filename) {
	const match = filename.match(/(.*)#.*(\..*)/);
	return match[1]+match[2];
}

global.extractFileName = function(filename) {
	const match = filename.match(/([^#]*)\s?#?.*\..*/);
	return match[1];
}

global.addStrToFilename = function(filename, x) {
	const match = filename.match(/(.*)(\..*)/);
	return `${match[1]}${x}${match[2]}`;
}

// Sort function to sort "Eff_UI_Talent_Zhongli.png" before "Eff_UI_Talent_Zhongli#3156087.png"
global.filenameSort = function(x, y) {
	const xd = x.substring(0, x.lastIndexOf('.'));
	const yd = y.substring(0, y.lastIndexOf('.'));
	return xd == yd ? 0 : xd < yd ? -1 : 1;
}

global.enableWrite = false;
global.moveFile = function(frompath, topath, allowoverwrite=false, log=false) {
	if (!allowoverwrite && fs.existsSync(topath)) {
		// console.log(`Cannot move ${path.basename(frompath)} to ${path.basename(topath)} because ${path.basename(topath)} already exists.`);
	} else if (enableWrite) {
		fs.renameSync(frompath, topath);
	}
	if (log) console.log(`"from": "${path.basename(frompath)}", "to": "${path.basename(topath)}"`);
}
global.removeFile = function(filepath, log=false) {
	if (enableWrite) {
		fs.unlinkSync(filepath);
	}
	if (log) console.log(`"removed": "${path.basename(filepath)}"`);
}

global.initSanitizeLog = function(logpath) {
	try {
		global.sanlog = require(logpath);
	} catch(e) {
		global.sanlog = {};
	}
}
global.saveLog = function(logpath) {
	if (sanlog) {
		fs.writeFileSync(logpath, stringify(sanlog, null, '\t'));
	} else {
		console.log(`Error in saveLog: No sanlog data to save.`);
	}
}