const { src, dest, watch, series, parallel } = require('gulp');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const del = require('del');
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
    dest: './src/assets/styles/',
    watch: './src/scss/**/*.scss',
    options: { 
      outputStyle: 'expanded' 
    }
  },
  sprite: {
    src: '**/*.svg',
    dest: './src/assets/sprite/',
    watch: './src/assets/icons/**/*.svg',
    options: { cwd: './src/assets/icons/' },
    svgo: {
      dest: './sprite',
      shape: {
        dimension: {
          maxWidth: 32,
          maxHeight: 32
        },
        spacing: {
					padding: 5
				}
      },
      mode: {
        css: {
          sprite : './svg/sprite.css.svg',
          prefix: '.svg-css-',
          layout: 'diagonal',
          bust: false,
          render: {
            css: {
              dest: '../../styles/sprite.css.css'
            }
          }
        },
        view: {
          sprite : './svg/sprite.view.svg',
          prefix: '.svg-view-',
          layout: 'diagonal',
          bust: false,
          render: {
            css: {
              dest: '../../styles/sprite.view.css'
            }
          }
        },
        defs: true, 
        symbol: true,
        stack: true
      }
    }
  },
  html: {
    src: './src/*.html',
    dest: './build',
    options: { base: 'src' },
    minifier: { collapseWhitespace: true }
  },
  css: {
    src: './src/assets/styles/*.css',
    dest: './build',
    options: { base: 'src' },
    autoprefixer: { cascade: false, grid: 'autoplace', flexbox: 'no-2009' }
  },
  assets: {
    src: ['src/assets/**', '!src/assets/styles/**', '!src/assets/icons/**'],
    dest: 'build/assets/',
    plugins: {
      gif: {interlaced: true},
      jpg: {quality: 75, progressive: true},
      png: {optimizationLevel: 5},
    }
  },
  clean: {
    dist: {
      src: './build'
    },
    dev: {
      src: './src/*.html'
    }
  },
  browserSync: {
    options: {
      server: { baseDir: './src' }, 
      notify: false,
      online: true 
    }
  }
};

function compileSprite() {
  return src(config.sprite.src, config.sprite.options)
  .pipe(plumber())
  .pipe(svgSprite(config.sprite.svgo))
  .on('error', console.log)
  .pipe(dest(config.sprite.dest))
  .pipe(browserSync.stream());
};

function compilePUG() {
  return src(config.pug.src)
    .pipe(plumber())
    .pipe(pug(config.pug.options))
    .on('error', console.log)
    .pipe(dest(config.pug.dest))
    .pipe(browserSync.stream());
};

function compileSCSS() {
  return src(config.scss.src)
    .pipe(plumber())
    .pipe(sass(config.scss.options))
    .on('error', console.log)
    .pipe(dest(config.scss.dest))
    .pipe(browserSync.stream());
};

function cleanDist() {
  return del(config.clean.dist.src);
};

function cleanDev() {
  return del(config.clean.dev.src);
};

function processHTML() {
  return src(config.html.src, config.html.options)
    .pipe(htmlmin(config.html.minifier))
    .pipe(dest(config.html.dest));
};

function processCSS() {
  return src(config.css.src, config.css.options)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer(config.css.autoprefixer))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(dest(config.css.dest));
};

function processAssets() {
  return src(config.assets.src, config.assets.options)
    .pipe(imagemin([
        imagemin.gifsicle(config.assets.plugins.gif),
        imagemin.mozjpeg(config.assets.plugins.jpg),
        imagemin.optipng(config.assets.plugins.png),
    ]))
    .pipe(dest(config.assets.dest))
};

function syncChanges(done) {
  browserSync.init(config.browserSync.options);
  
  watch(config.pug.watch, compilePUG);
  watch(config.scss.watch, compileSCSS);
  watch(config.sprite.watch, compileSprite);

  done();
};

const compile = parallel(compilePUG, compileSCSS, compileSprite);
const build = parallel(processHTML, processCSS, processAssets);

exports.dev = series(cleanDev, compile, syncChanges);
exports.default = series(cleanDist, compile, build);