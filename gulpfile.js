const { src, dest, watch, series, parallel } = require('gulp');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const rename = require('gulp-rename');
const browserSync = require('browser-sync').create();

const config = {
  pug: {
    src: './src/pages/*.pug',
    dest: './src/',
    watch: './src/pages/**/*.pug',
    options: {
      pretty: true
    }
  },
  scss: {
    src: './src/scss/index.scss',
    output: 'styles.css',
    dest: './src',
    watch: './src/scss/**/*.scss',
    options: { 
      outputStyle: 'expanded' 
    }
  },
  css: {
    src: './src/*.css',
    dest: './build',
    options: { base: 'src' }
  },
  html: {
    src: './src/*.html',
    dest: './build',
    watch: './src/*.html',
    options: { base: 'src' }
  },
  clean: {
    dist: {
      src: './build/*'
    },
    dev: {
      src: './src/*.{css,html}'
    }
  },
  browserSync: {
    watch: './src/*.{css,html}',
    options: {
      server: { baseDir: './src' }, 
      notify: false,
      online: true 
    }
  }
};

function compilePUG() {
  return src(config.pug.src)
    .pipe(plumber())
    .pipe(pug(config.pug.options))
    .on('error', console.log)
    .pipe(dest(config.pug.dest))
};

function compileSCSS() {
  return src(config.scss.src)
    .pipe(plumber())
    .pipe(sass(config.scss.options))
    .on('error', console.log)
    .pipe(rename(config.scss.output))
    .pipe(dest(config.scss.dest))
};

function cleanDist() {
  return del(config.clean.dist.src);
};

function cleanDev() {
  return del(config.clean.dev.src);
};

function processCSS() {
  return src(config.css.src, config.css.options)
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(dest(config.css.dest));
};

function processHTML() {
  return src(config.html.src, config.html.options)
    .pipe(dest(config.html.dest));
};

function reloadBrowser(done) {
  browserSync.reload();

  done();
};

function syncChanges(done) {
  browserSync.init(config.browserSync.options);
  
  watch(config.pug.watch, compilePUG);
  watch(config.scss.watch, compileSCSS);

  watch(config.browserSync.watch, reloadBrowser);

  done();
};

const compile = parallel(compilePUG, compileSCSS);
const build = parallel(processHTML, processCSS);

exports.dev = series(cleanDev, compile, syncChanges);
exports.default = series(cleanDist, compile, build);