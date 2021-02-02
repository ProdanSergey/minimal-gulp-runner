const { src, dest, watch, parallel } = require('gulp');
const plumber = require('gulp-plumber');
const gulpPug = require('gulp-pug');
const gulpSass = require('gulp-sass');
const gulpSvgSprite = require('gulp-svg-sprite');
const gulpBabel = require('gulp-babel');

const { sprite, pug, sass, js, browserSync } = require('../config.json');

const onError = ({ plugin, message, msg, line, column }) => {
	let output;

	if (msg) {
		output = `
			line: ${line}, 
			column: ${column}, 
			message: ${msg}
		`;
	} else {
		output = message;
	}

	console.log(`ERROR AT ${plugin}`, output);
};

module.exports = function (bs) {
	function compileSprite() {
		return src(sprite.src, sprite.options)
			.pipe(plumber())
			.pipe(gulpSvgSprite(sprite.svgo))
			.on('error', onError)
			.pipe(dest(sprite.dest))
			.pipe(bs.stream());
	}

	function compilePUG() {
		return src(pug.src)
			.pipe(plumber())
			.pipe(gulpPug(pug.options))
			.on('error', onError)
			.pipe(dest(pug.dest))
			.pipe(bs.stream());
	}

	function compileSCSS() {
		return src(sass.src)
			.pipe(plumber())
			.pipe(gulpSass(sass.options))
			.on('error', onError)
			.pipe(dest(sass.dest))
			.pipe(bs.stream());
	}

	function compileJS() {
		return src(js.src.compile, js.options)
			.pipe(gulpBabel(js.babel))
			.pipe(dest(js.dest.compile))
			.pipe(bs.stream());
	}

	function syncChanges(done) {
		bs.init(browserSync.options);

		watch(pug.watch, compilePUG);
		watch(sass.watch, compileSCSS);
		watch(sprite.watch, compileSprite);
		watch(js.watch, compileJS);
		done();
	}

	return {
		compile: parallel(compilePUG, compileSCSS, compileSprite, compileJS),
		sync: syncChanges,
	};
};
