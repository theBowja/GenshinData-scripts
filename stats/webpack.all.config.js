const path = require('path');

module.exports = env => ({
	entry: './stats/calcStatsAll.js',
	// target: 'web', // not needed
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'genshinStatsAll.js',

		library: 'GenshinStats',
		libraryTarget: 'umd',
		umdNamedDefine: true,
		globalObject: `(typeof self !== 'undefined' ? self : this)`
	},

	mode: 'production'
});