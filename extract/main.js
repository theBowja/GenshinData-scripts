exportStarRailData();

function exportStarRailData() {
	const { exportCurve, exportData } = require('./extract/global.js');
	exportData('foods', require('./extract/extractFood'));
}