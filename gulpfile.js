const { series } = require('gulp');
const browserSync = require('browser-sync').create();

const { cleanDev, cleanDist } = require('./gulp/tasks/clean');
const { compile, sync } = require('./gulp/tasks/compile')(browserSync);
const { build } = require('./gulp/tasks/build');

exports.dev = series(cleanDev, compile, sync);
exports.default = series(cleanDist, compile, build);
