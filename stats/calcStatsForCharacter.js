const charactersStats = require(`./data/charactersStats.json`);
const charactersCurve = require(`./data/charactersCurve.json`);

/**
 * Example: Pass in '40+' to get out ['40', '+']. Or '40' to get out ['40', ''].
 */
function parseLevel(levelstr) {
	let match = /([0-9]+)(\+?)/.exec(levelstr);
	if (match !== null) {
		return [match[1], match[2]];
	}
	return [undefined, undefined];
}

/**
 * @param {integer} level
 * @param ascension: undefined | number | string - the ascension number, or '-'/'+'. defaults to '-'.
 *                   only decides which stats to return at level boundaries.
 */
function getPromotionBonus(promotions, level, ascension) {
    for(let index = promotions.length - 2; index >= 0; index--) {
        if(level > promotions[index].maxlevel) {
            return [index+1, promotions[index+1]];
        } else if(level === promotions[index].maxlevel) {
            if(Number.isFinite(ascension) && ascension > index || ascension === '+')
                return [index+1, promotions[index+1]];
            else
                return [index, promotions[index]];
        }
    }
    return [0, promotions[0]];
}

/** 
 * Calculates the stats of a character at a specific level and ascension phase.
 * 
 * @param {string} filename - The exact filename of the character you want to get the stats of.
 * @param {string} levelstr - The level you want to get the stats of. Append '+' to differentiate between levels at promotion boundaries.
 * @returns {(object|undefined)} The level data.
 */
function calcStatsForCharacter(filename, levelstr) {
    const mystats = charactersStats[filename];
    if (mystats === undefined) return undefined;

    const maxlevel = mystats.promotion[mystats.promotion.length-1].maxlevel;
    let [level, ascension] = parseLevel(levelstr);
    if (level === undefined) return undefined;
    level = parseInt(level, 10);
    if (isNaN(level)) return undefined;
    if (level > maxlevel || level < 1) return undefined;

    const [phase, promotion] = getPromotionBonus(mystats.promotion, level, ascension);
    let output = {
        level: level,
        ascension: phase,
        hp: mystats.base.hp * charactersCurve[level][mystats.curve.hp] + promotion.hp,
        attack: mystats.base.attack * charactersCurve[level][mystats.curve.attack] + promotion.attack,
        defense: mystats.base.defense * charactersCurve[level][mystats.curve.defense] + promotion.defense,
        specialized: promotion.specialized,
        substat: mystats.specialized
    };
    if (mystats.specialized === 'FIGHT_PROP_CRITICAL')
        output.specialized += mystats.base.critrate;
    else if (mystats.specialized === 'FIGHT_PROP_CRITICAL_HURT')
        output.specialized += mystats.base.critdmg;

    return output;
}

module.exports = {
    calcStatsForCharacter: calcStatsForCharacter
}