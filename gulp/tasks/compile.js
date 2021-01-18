const { src, dest, watch, parallel } = require('gulp');
const plumber = require('gulp-plumber');
const gulpPug = require('gulp-pug');
const gulpSass = require('gulp-sass');
const gulpSvgSprite = require('gulp-svg-sprite');

const { sprite, pug, sass, browserSync } = require('../config.json');

module.exports = function (bs) {
	function compileSprite() {
		return src(sprite.src, sprite.options)
			.pipe(plumber())
			.pipe(gulpSvgSprite(sprite.svgo))
			.on('error', console.log)
			.pipe(dest(sprite.dest))
			.pipe(bs.stream());
	}

	function compilePUG() {
		return src(pug.src)
			.pipe(plumber())
			.pipe(gulpPug(pug.options))
			.on('error', console.log)
			.pipe(dest(pug.dest))
			.pipe(bs.stream());
	}

	function compileSCSS() {
		return src(sass.src)
			.pipe(plumber())
			.pipe(gulpSass(sass.options))
			.on('error', console.log)
			.pipe(dest(sass.dest))
			.pipe(bs.stream());
	}

	function syncChanges(done) {
		bs.init(browserSync.options);

		watch(pug.watch, compilePUG);
		watch(sass.watch, compileSCSS);
		watch(sprite.watch, compileSprite);

		done();
	}

	return {
		compile: parallel(compilePUG, compileSCSS, compileSprite),
		sync: syncChanges,
	};
};
