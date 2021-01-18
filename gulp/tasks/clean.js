const del = require('del');

const { clean } = require('../config.json');

function cleanDist() {
	return del(clean.dist.src);
}

function cleanDev() {
	return del(clean.dev.src);
}

module.exports = {
	cleanDist,
	cleanDev,
};
