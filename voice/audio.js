const fs = require('fs');
const path = require('path');
const fnv = require('fnv-plus');
const config = require('../config');
let offset;

const voMap = {};
loadVO(config.vo_file);

readAudioAssets(config.AudioAssets_folder);



function loadVO(path) {
	console.log('loading vo file...');
	const t0 = performance.now();
	const vofiles = fs.readFileSync(path).toString().split('\n');
	fnv.version('1');
	fnv.useUTF8(true);
	for (let vofile of vofiles) {
		for (let lang of config.read_audio_languages) {
			const file = includesLanguage(vofile) ? vofile : `${lang}\\${vofile}`;
			const hashValue = fnv.hash(file.toLowerCase(), 64).dec();
			voMap[hashValue] = file;
		}
	}
	const t1 = performance.now();
	console.log(`loaded in ${(t1-t0)/1000} seconds`);
}

function includesLanguage(vofile) {
	for (const lang of config.list_audio_languages) {
		if (vofile.startsWith(lang)) return true;
	}
	return false;
}

function readAudioAssets(directory) {
	for (const language of config.read_audio_languages) {
		var filenames = fs.readdirSync(`${directory}/${language}`);
		for (const filename of filenames) {
			const audiofile = fs.readFileSync(`${directory}/${language}/${filename}`);
			readChunk(audiofile);
			console.log(`done ${filename}`);
		}
	}
	console.log(`done all`);
}

function readChunk(buffer) {
	offset = 0;
	const signature = readStringAscii(buffer, 4);
	const length = readUInt32(buffer);

	// console.log(`${signature} ${length}`);

	let data;
	switch (signature) {
		case 'AKPK':
			data = readPackage(buffer);
			break;

		case 'BKHD':
			break;

		case 'STID':
			break;

		case 'DIDX':
			break;

		case 'DATA':
			break;
		
		default:
			console.log(`unknown signature ${signature}`);
			offset+=length;
			return;
	}

	// write all the audio files that are in vo.txt
	for (const external of data.externals) {
		const id = external.id.toString();
		if (voMap[id]) {
			const file = buffer.subarray(external.offset, external.offset+external.size);
			let tmp = path.dirname(`../voice/${voMap[id]}`);
			fs.mkdirSync(tmp, { recursive: true });
			fs.writeFileSync(`../voice/${voMap[id]}`, file);
		}
	}
	// console.log('done writing');
}

function readPackage(buffer) {
	const isLittleEndian = readInt32(buffer);

	const folderListSize = readInt32(buffer);
	const bankTableSize = readInt32(buffer);
	const soundTableSize = readInt32(buffer);
	const externalTableSize = readInt32(buffer);

	// console.log(`${folderListSize} ${bankTableSize} ${soundTableSize} ${externalTableSize}`);

	const folders = readFolders(buffer, folderListSize);
	const banks = readBanks(buffer, bankTableSize);
	const sounds = readSounds(buffer, soundTableSize);
	const externals = readExternals(buffer, externalTableSize);

	return {
		folders,
		banks,
		sounds,
		externals
	}
}

function readFolders(buffer, folderSize) {
	const startingOffset = offset; // 28

	const count = readInt32(buffer);
	const folders = [];
	for (let i = 0; i < count; i++) {

		const folder = {};
		folder.offset = readUInt32(buffer);
		folder.id = readUInt32(buffer);

		// read utf-16le string for name
		// utf-16 always has 2 or 4 bytes
		// we dont know the exact length but we know it's null terminated with \0 so we can look for a sequence of 4 \0's to mark the end
		const nameStart = startingOffset+folder.offset;
		let nameEnd = buffer.indexOf('\0\0\0\0', nameStart);
		if ((nameEnd - nameStart) % 2 === 1) nameEnd += 1;
		const textDecode = new TextDecoder('utf-16le');
		folder.name = textDecode.decode(buffer.subarray(nameStart, nameEnd));
		
		folders.push(folder);
	}

	offset = startingOffset+folderSize;
	return folders;
}

function readBanks(buffer, bankTableSize) {
	const count = readInt32(buffer);
	const banks = [];
	for (let i = 0; i < count; i++) {
		const bank = {};
		bank.id = readUInt32(buffer);
		const multiplier = readUInt32(buffer);
		bank.size = readUInt32(buffer);
		bank.offset = readUInt32(buffer) * multiplier;
		bank.name = `Bank_${bank.id}`;
		bank.folder = readUInt32(buffer);

		banks.push(bank);
	}
	return banks;
}

function readSounds(buffer, soundTableSize) {
	const count = readInt32(buffer);
	const sounds = [];
	for (let i = 0; i < count; i++) {
		const sound = {};
		sound.id = readUInt32(buffer);
		const multiplier = readUInt32(buffer);
		sound.size = readUInt32(buffer);
		sound.offset = readUInt32(buffer) * multiplier;
		sound.name = `Sound_${sound.id}`;
		sound.folder = readUInt32(buffer);

		sounds.push(sound);
	}
	return sounds;
}

function readExternals(buffer, externalTableSize) {
	const count = readInt32(buffer);
	const externals = [];
	for (let i = 0; i < count; i++) {
		const ext = {};
		ext.id = readUInt64(buffer);
		const multiplier = readUInt32(buffer);
		ext.size = readUInt32(buffer);
		ext.offset = readUInt32(buffer) * multiplier;
		ext.name = `External_${ext.id}`;
		ext.folder = readUInt32(buffer);

		externals.push(ext);
	}
	return externals;
}

/**
 * 
 * @param {Buffer} buffer 
 * @returns 
 */
function readStringAscii(buffer, length=4) {
	offset+=length
	return buffer.subarray(offset-length, offset).toString('utf8');
}

/**
 * 
 * @param {Buffer} buffer 
 * @returns 
 */
function readUInt32(buffer) {
	offset+=4;
	return buffer.readUint32LE(offset-4);
}

/**
 * 
 * @param {Buffer} buffer 
 * @returns 
 */
function readInt32(buffer) {
	offset+=4;
	return buffer.readInt32LE(offset-4);
}

/**
 * 
 * @param {Buffer} buffer 
 */
function readUInt64(buffer) {
	offset+=8;
	return buffer.readBigUInt64LE(offset-8);
}