require('./global.js');

const fuzzysort = require('fuzzysort');

const xdungeon = getExcel('DungeonExcelConfigData');


const monsterMap = {
	"bless autumn hunt i": ['hili berserk', 'el hili grenad', 'ele hili shoot', 'el slime', 'crack axe mita'],
	"bless autumn hunt ii": ['el hili grenad', 'la el slime', 'mu el slime', 'crack axe mita'],
	"bless autumn hunt iii": ['la el slime', 'mu el slime', 'el ab mage'],
	"bless autumn hunt iv": ['la el slime', 'el ab mage', 'thunder lawa'],

	"bless dance steel i": ['treasure ho cr po', 'treasure handy', 'treasure grave', 'treasure sea', 'treasure pug'],
	"bless dance steel ii": ['fa py agent', 'treasure scout', 'pyro potioneer', 'hydro potioneer', 'handyman', 'pugilist', 'crusher'],
	"bless dance steel iii": ['pyro agent', 'fa el ci mage', 'th scout', 'th py potion', 'th el potion', 'th handyman', 'th grave', 'th pugilist', 'th crusher'],
	"bless dance steel iv": ['pyro agent', 'fa el ci mage', 'th pyro pot', 'th hy pot', 'th el pot', 'th cry pot', 'th seaman'],
	"bless dance steel v": ['pyro agent', 'fa el ci mage', 'th cry pot'],

	"bless eleg r i": ['cr slime', 'la cry slime', 'ice shield mita'],
	"bless eleg r ii": ['cr slime', 'la cr slime', 'cr hili grenad', 'ice shield mita'],
	"bless eleg r iii": ['la cr slime', 'cr hili grenad', 'ice shield mita', 'cr ab mage'],
	"bless eleg r iv": ['frostarm lawa', 'cr ab mage'],

	"bless fire puri i": ['cryo slime', 'large cryo slime', 'large hydro slime', 'wood shield hili guard', 'cryo mage'],
	"bless fire puri ii": ['elec slime', 'lar elec slime', 'muta ele slime', 'fat ele cic mage'],
	"bless fire puri iii": ['cry slime', 'lar cry slime', 'cr ab mage'],
	"bless fire puri iv": ['hy slime', 'la hy sl', 'hy sama', 'hy ab mage'],
	"bless fire puri v": ['la cr slime', 'cr ab mage'],
	"bless fire puri vi": ['la el slime', 'mu el slime', 'fa el ci mage'],

	"bless frost i": ['la el slime', 'mu el slime', 'hy slime', 'la hy slime'],
	"bless frost ii": ['la py slime', 'bla ax mitachurl', 'py ab mage'],
	"bless frost iii": ['la el slime', 'mu ele slime', 'hili fighter', 'fa el ci mage'],
	"bless frost iv": ['la py slime', 'bla axe mitachurl', 'py ab mage'],

	"bless spring i": ['hy slime', 'la hy slime', 'hy ab mage'],
	"bless spring ii": ['py slime', 'la py slime', 'py ab mage'],
	"bless spring iii": ['cr slime', 'la cr slime', 'cr ab mage'],
	"bless spring iv": ['hy slime', 'la hy slime', 'hili fighter', 'hy samachurl', 'hy aby mage'],
	"bless spring v": ['py ab mage', 'ruin guard'],
	"bless spring vi": ['hili fighter', 'cr ab mage', 'ruin hunter'],

	"bless stone chamber i": ['py ab mage', 'cr abyss mage'],
	"bless stone chamber ii": ['py ab mage', 'cr aby mage'],
	"bless stone chamber iii": ['py ab mage', 'cr ab mage', 'hy ab mage'],

	"bless unyield i": ['py slime', 'la py slime', 'hili berserk'],
	"bless unyield ii": ['la py slime', 'hili berserk', 'blaz axe mita'],
	"bless unyield iii": ['la py slime', 'blaz axe mita', 'rock shield mita'],
	"bless unyield iv": ['geovish'],

	"bless necropolis i": ['crack axe mita', 'la hy slime', 'hy slime'],
	"bless necropolis ii": ['crack axe mita', 'la hy slime', 'hy slime', 'el hili shoot', 'hili berserk'],
	"bless necropolis iii": ['thunder hound', 'thunder hound whelp', 'el hili shooter'],
	"bless necropolis iv": ['thunder hound', 'thunder hound whelp', 'crack axe mita'],

	"bless machine nest i": ['ru guard', 'ru destroy'],
	"bless machine nest ii": ['ru guard', 'ru scout', 'ru cruiser', 'ru destroy'],
	"bless machine nest iii": ['ru scout', 'ru cruiser', 'ru destroy'],
	"bless machine nest iv": ['ru grader', 'ru cruiser', 'ru destroy'],

	"bless seven sense i": ['ere sunfrost', 'ere cross', 'ere sword', 'ere halberd'],
	"bless seven sense ii": ['ere daythun', 'ere clear', 'ere cross', 'ere sword', 'ere vanguard'],
	"bless seven sense iii": ['ere daythun', 'ere clear', 'ere sunfrost', 'ere cross', 'ere lineb', 'ere halberd'],
	"bless seven sense iv": ['ere daythun', 'ere clear', 'ere sunfrost'],

	"bless desert citadel i": ['hy slime', 'py slime', 'st py fung', 'cry slime', 'l el slime'],
	"bless desert citadel ii": ['l pyr slim', 'cry slime', 'pyro slime', 'wh el fungus', 'wing cryoshroo'],
	"bless desert citadel iii": ['grou geoshro', 'l pyro slim', 'l hy slim', 'grou hydroshr'],
	"bless desert citadel iv": ['l py slim', 'gro hydrosh', 'la hy sl', 'grou geoshr', 'wing cryosh'],

	"forge alt sand i": ['hy slime', 'la hy slime', 'py slime', 'la py slime'],
	"forge alt sand ii": ['la hy slime', 'la py slime'],
	"forge alt sand iii": ['la hy slime', 'la py slime', 'hy ab mage', 'py ab mage'],
	"forge alt sand iv": ['el hili grenad', 'la el slime', 'mu el slime', 'crack axe mita'],

	"forge city reflect i": ['hy slime', 'la hy slime'],
	"forge city reflect ii": ['hy slime', 'la hy slime', 'wood shield hili guard'],
	"forge city reflect iii": ['hy slime', 'la hy slime', 'hy samachurl', 'hy ab mage'],
	"forge city reflect iv": ['la hy slime', 'hy ab mage'],

	"forge ruin capital i": ['hy slime', 'la hy slime'],
	"forge ruin capital ii": ['hy slime', 'la hy slime', 'wood shield hili guard'],
	"forge ruin capital iii": ['hy slime', 'la hy slime', 'hy samachurl', 'hy ab mage'],
	"forge ruin capital iv": ['la hy slime', 'hy ab mage'],

	"forge sand burial i": ['hy slime', 'la hy slime', 'py slime', 'la py slime'],
	"forge sand burial ii": ['la hy slime', 'la py slime'],
	"forge sand burial iii": ['la hy slime', 'la py slime', 'hy ab mage', 'py ab mage'],
	"forge sand burial iv": ['el hili grenad', 'la el slime', 'mu el slime', 'crack axe mita'],

	"forge sub valley i": ['hy slime', 'la hy slime'],
	"forge sub valley ii": ['hy slime', 'la hy slime', 'wood shield hili guard'],
	"forge sub valley iii": ['hy slime', 'la hy slime', 'hy samachurl', 'hy ab mage'],
	"forge sub valley iv": ['la hy slime', 'hy ab mage'],

	"forge sunke sand i": ['hy slime', 'la hy slime', 'py slime', 'la py slime'],
	"forge sunke sand ii": ['la hy slime', 'la py slime'],
	"forge sunke sand iii": ['la hy slime', 'la py slime', 'hy ab mage', 'py ab mage'],
	"forge sunke sand iv": ['el hili grenad', 'la el slime', 'mu el slime', 'crack axe mita'],

	"forge thunder alt i": ['el slime', 'la el slime', 'mu el slime'],
	"forge thunder alt ii": ['el slime', 'la el slime', 'mu el slime'],
	"forge thunder alt iii": ['la el slime', 'mu el slime', 'fa el ci mage'],
	"forge thunder alt iv": ['la el slime', 'mu el slime', 'fa el ci mage'],

	"forge thunder ruin i": ['el slime', 'la el slime', 'mu el slime'],
	"forge thunder ruin ii": ['el slime', 'la el slime', 'mu el slime'],
	"forge thunder ruin iii": ['la el slime', 'mu el slime', 'fa el ci mage'],
	"forge thunder ruin iv": ['la el slime', 'mu el slime', 'fa el ci mage'],

	"forge trial thunder i": ['el slime', 'la el slime', 'mu el slime'],
	"forge trial thunder ii": ['el slime', 'la el slime', 'mu el slime'],
	"forge trial thunder iii": ['la el slime', 'mu el slime', 'fa el ci mage'],
	"forge trial thunder iv": ['la el slime', 'mu el slime', 'fa el ci mage'],

	"forge tainted clouds i": ['str pyro fungus', 'fl dendro fungus', 'fl hydro fungus', 'wh electro fungus'],
	"forge tainted clouds ii": ['wh cryo fungus', 'str pyro fungus', 'str geo fungus', 'fl dendro fungus', 'wh electro fungus'],
	"forge tainted clouds iii": ['str pyro fungus', 'wh cryo fungus', 'str geo fungus', 'wh electro fungus', 'fl dendro fungus', 'g hydroshroom', 'w dendroshroom'],
	"forge tainted clouds iv": ['f hydro fungus', 'f dendro fungus', 'g hydroshroom', 'w dendroshroom'],

	"forge obsession i": ['str pyro fungus', 'f dendro fungus', 'f hydro fungus', 'wh electro fungus'],
	"forge obsession ii": ['wh cryo fungus', 'str pyro fungus', 'str geo fungus', 'f dendro fungus', 'wh electro fungus'],
	"forge obsession iii": ['str pyro fungus', 'wh cryo fungus', 'str geo fungus', 'electro fungus', 'f dendro fungus', 'g hydroshroom', 'w dendroshroom'],
	"forge obsession iv": ['f hydro fungus', 'f dendro fungus', 'g hydroshroom', 'w dendroshroom'],

	"forge lead karma i": ['str pyro fungus', 'f dendro fungus', 'f hydro fungus', 'wh electro fungus'],
	"forge lead karma ii": ['wh cryo fungus', 'str pyro fungus', 'str geo fungus', 'f dendro fungus', 'wh electro fungus'],
	"forge lead karma iii": ['str pyro fungus', 'wh cryo fungus', 'str geo fungus', 'wh electro fungus', 'f dendro fungus', 'g hydroshroom', 'w dendroshroom'],
	"forge lead karma iv": ['f hydro fungus', 'f dendro fungus', 'g hydroshroom', 'w dendroshroom'],

	"maste alt flame i": ['py slime', 'la py slime', 'py ab mage'],
	"maste alt flame ii": ['py slime', 'la py slime', 'py ab mage'],
	"maste alt flame iii": ['la py slime', 'py ab mage'],
	"maste alt flame iv": ['blaz axe mita', 'pyro agent'],

	"maste cir ember i": ['py slime', 'la py slime', 'py ab mage'],
	"maste cir ember ii": ['py slime', 'la py slime', 'py ab mage'],
	"maste cir ember iii": ['la py slime', 'py ab mage'],
	"maste cir ember iv": ['blaz axe mita', 'pyro agent'],

	"maste frost alt i": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste frost alt ii": ['cr slime', 'la cr slime', 'hili fight', 'cr ab mage'],
	"maste frost alt iii": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste frost alt iv": ['la cr slime', 'cr ab mage'],

	"maste froz abyss i": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste froz abyss ii": ['cr slime', 'la cr slime', 'hili fight', 'cr ab mage'],
	"maste froz abyss iii": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste froz abyss iv": ['la cr slime', 'cr ab mage'],

	"maste heart flame i": ['py slime', 'la py slime', 'py ab mage'],
	"maste heart flame ii": ['py slime', 'la py slime', 'py ab mage'],
	"maste heart flame iii": ['la py slime', 'py ab mage'],
	"maste heart flame iv": ['blaz axe mita', 'pyro agent'],

	"maste realm slumb i": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste realm slumb ii": ['cr slime', 'la cr slime', 'hili fight', 'cr ab mage'],
	"maste realm slumb iii": ['cr slime', 'la cr slime', 'cr ab mage'],
	"maste realm slumb iv": ['la cr slime', 'cr ab mage'],

	"maste reign violet i": ['hili', 'el hili grenad', 'el hili shoot', 'crack axe mita'],
	"maste reign violet ii": ['nobu jintou', 'nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th elec pot'],
	"maste reign violet iii": ['nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th el pot', 'kairagi fiery'],
	"maste reign violet iv": ['th cryo pot', 'kairagi thunder', 'kairagi fiery'],

	"maste thund valley i": ['hili', 'el hili grenad', 'el hili shoot', 'crack axe mita'],
	"maste thund valley ii": ['nobu jintou', 'nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th elec pot'],
	"maste thund valley iii": ['nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th el pot', 'kairagi fiery'],
	"maste thund valley iv": ['th cryo pot', 'kairagi thunder', 'kairagi fiery'],

	"maste vine ruin i": ['hili', 'el hili grenad', 'el hili shoot', 'crack axe mita'],
	"maste vine ruin ii": ['nobu jintou', 'nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th elec pot'],
	"maste vine ruin iii": ['nobu hitsuke', 'nobu kikou', 'th pyro pot', 'th el pot', 'kairagi fiery'],
	"maste vine ruin iv": ['th cryo pot', 'kairagi thunder', 'kairagi fiery'],

	"maste full moon i": ['ruin guard', 'ruin earthguard'],
	"maste full moon ii": ['ruin earthguard', 'ruin destroy', 'ruin scout'],
	"maste full moon iii": ['ruin earthguard', 'ruin skywatch'],
	"maste full moon iv": ['ruin earthguard', 'ruin skywatch'],

	"maste witticism i": ['ruin guard', 'ruin earthguard'],
	"maste witticism ii": ['ruin earthguard', 'ruin destroy', 'ruin scout'],
	"maste witticism iii": ['ruin earthguard', 'ruin skywatch'],
	"maste witticism iv": ['ruin earthguard', 'ruin skywatch'],

	"maste basket of i": ['ruin guard', 'ruin earthguard'],
	"maste basket of ii": ['ruin earthguard', 'ruin destroy', 'ruin scout'],
	"maste basket of iii": ['ruin earthguard', 'ruin skywatch'],
	"maste basket of iv": ['ruin earthguard', 'ruin skywatch'],

	"forsaken rampart i": ['hilichu', 'hili fight', 'hydr sama', 'blaz ax mita'],
	"forsaken rampart ii": ['hili', 'hili fig', 'hili gren', 'hyd sama', 'anem hili rog'],
	"forsaken rampart iii": ['hili figh', 'blaz ax mita', 'hyd hili rog'],
	"forsaken rampart iv": ['blaz ax mita', 'anemo hili rog', 'hydr hili rogu'],
}

function autocomplete(input, dict) {
    let result = fuzzysort.go(input, dict, { limit: 1 })[0];
    if(result === undefined) console.log('DomainMonsterList: no match found for '+input);
    return result === undefined ? undefined : result.target;
}

const ENmonster = require(`${config.genshin_export_folder}/EN/enemies.json`);
const ENmonsterNames = Object.values(ENmonster).map(ele => ele.name);

const ENdomain = require(`${config.genshin_export_folder}/EN/domains.json`);
const ENdomainNames = Object.values(ENdomain).map(ele => ele.name);

const autoMonsterMap = {};
for(let [dom, monList] of Object.entries(monsterMap)) {
	dom = autocomplete(dom, ENdomainNames);
	if(dom === undefined) continue;
	monList = monList.map(ele => autocomplete(ele, ENmonsterNames));
	autoMonsterMap[dom] = monList;
}

function collateDomainMonsterList(lang) {
	const language = getLanguage(lang);
	let mydomain = require(`${config.genshin_export_folder}/${lang}/domains.json`);

	for(let [dom, monList] of Object.entries(autoMonsterMap)) {
		const domId = Object.values(ENdomain).find(ele => ele.name === dom).id;
		const monNameHashList = monList.map(ele => Object.values(ENmonster).find(tmp => tmp.name === ele).nameTextMapHash);

		const monsterlist = monNameHashList.map(NameTextMapHash => language[NameTextMapHash]);

		Object.values(mydomain).find(ele => ele.id === domId).monsterlist = monsterlist;
	}

	for(let dom of Object.values(mydomain)) {
		if(!dom.monsterlist) {
			if (lang === 'EN') console.log(dom.name + ' has no monsterlist');
			dom.monsterlist = [];
		}

	}

	return mydomain;
}

module.exports = collateDomainMonsterList;
