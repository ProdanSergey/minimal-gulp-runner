const { src, dest, parallel } = require('gulp');
const htmlmin = require('gulp-htmlmin');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');

const { html, css, assets } = require('../config.json');

function processHTML() {
	return src(html.src, html.options)
		.pipe(htmlmin(html.minifier))
		.pipe(dest(html.dest));
}

function processCSS() {
	return src(css.src, css.options)
		.pipe(sourcemaps.init())
		.pipe(autoprefixer(css.autoprefixer))
		.pipe(cleanCSS())
		.pipe(sourcemaps.write())
		.pipe(dest(css.dest));
}

function processAssets() {
	return src(assets.src, assets.options)
		.pipe(
			imagemin([
				imagemin.gifsicle(assets.plugins.gif),
				imagemin.mozjpeg(assets.plugins.jpg),
				imagemin.optipng(assets.plugins.png),
			])
		)
		.pipe(dest(assets.dest));
}

module.exports = {
	build: parallel(processHTML, processCSS, processAssets),
};
