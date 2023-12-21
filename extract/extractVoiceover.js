require('./global.js');

const xmat = getExcel('MaterialExcelConfigData');
const xfetter = getExcel('FettersExcelConfigData');

// copied from collateCharacter
const playerIdToTextMapHash = { 10000005: 2329553598, 10000007: 3241049361 };

function collateVoiceover(lang) {
	const language = getLanguage(lang);

	let mynamecard = xplayableAvatar.reduce((accum, obj) => {
		let data = {};
		data.id = obj.id;

		data.name = language[obj.nameTextMapHash];
		if(isPlayer(obj)) data.name = language[playerIdToTextMapHash[obj.id]];

		data.story = [];
		data.combat = [];
		let xvoices = xfetter.filter(ele => ele.avatarId === obj.id);
		xvoices.forEach(ele => {
			let tmp = { 
				Id: ele.fetterId, // DEBUG
				title: language[ele.voiceTitleTextMapHash],
				text: sanitizeDescription(language[ele.voiceFileTextTextMapHash]),
				unlock: ele.tips.map(e => language[e]).filter(e => e !== '') // TextList/JumpList
			}
			if(tmp.unlock.length === 0) delete tmp.unlock;
			
			if(ele.isHiden === 1) data.story.push(tmp);
			else if(ele.isHiden === 2) data.combat.push(tmp);
			else console.log('unknown voiceover tab: ' + ele.fetterId);
		});


		// data.description = sanitizeDescription(language[obj.descTextMapHash]);
		// data.sortorder = obj.id;



		let filename = makeFileName(getLanguage('EN')[isPlayer(obj) ? playerIdToTextMapHash[obj.id] : obj.nameTextMapHash]);
		if(filename === '') return accum;
		if(accum[filename] !== undefined) console.log('filename collision: ' + filename);
		accum[filename] = data;
		return accum;
	}, {});

	return mynamecard;
}

module.exports = collateVoiceover;