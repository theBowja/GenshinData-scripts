const weaponsStats = require(`./data/weaponsStats.json`);
const weaponsCurve = require(`./data/weaponsCurve.json`);

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
 * Calculates the stats of a weapon at a specific level and ascension phase.
 * 
 * @param {string} filename - The exact filename of the weapon you want to get the stats of.
 * @param {string} levelstr - The level you want to get the stats of. Append '+' to differentiate between levels at promotion boundaries.
 * @returns {(object|undefined)} The level data.
 */
function calcStatsForWeapon(filename, levelstr) {
	const mystats = weaponsStats[filename];
	if (mystats === undefined) return undefined;

    const maxlevel = mystats.promotion[mystats.promotion.length-1].maxlevel;
    let [level, ascension] = parseLevel(levelstr);
    if (level === undefined) return undefined;
    level = parseInt(level, 10);
    if(isNaN(level)) return undefined;
    if(level > maxlevel || level < 1) return undefined;

    const [phase, promotion] = getPromotionBonus(mystats.promotion, level, ascension);
    let output = {
        level: level,
        ascension: phase,
        attack: mystats.base.attack * weaponsCurve[level][mystats.curve.attack] + promotion.attack,
        specialized: mystats.base.specialized * weaponsCurve[level][mystats.curve.specialized],
        substat: mystats.specialized
    };

    return output; 
}

module.exports = {
    calcStatsForWeapon: calcStatsForWeapon
}