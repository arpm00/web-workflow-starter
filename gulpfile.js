const gulp = require('gulp');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssvars = require('postcss-simple-vars');
const nested = require('postcss-nested');
const cssimport = require('postcss-import');
const browserSync = require('browser-sync').create();
const mixins = require('postcss-mixins');
const hexrgba = require('postcss-hexrgba');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config');
const imagemin = require('gulp-imagemin');
const del = require('del');
const usemin = require('gulp-usemin');
const rev = require('gulp-rev');
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify-es').default;
const fileinclude = require('gulp-file-include');

function fileToInclude() {
  return gulp.src(['./app/template/*.html'])
  .pipe(fileinclude({
    prefix: '@@',
    basepath: '@file'
  }))
  .pipe(gulp.dest('./app'))
}

//compile scss to css
function style() {
  //1.where is my scss file
  return gulp.src('./app/assets/styles/styles.css')
  //2.pass the file through scss compiler
  .pipe(postcss([cssimport, mixins, cssvars, nested, hexrgba, autoprefixer]).on('error', function (errorInfo) {
    console.log(errorInfo.toString());
    this.emit('end');
  }))
  //3.where do i save the compiled css
  .pipe(gulp.dest('./app/temp/styles'))
  //4.stream changes to all browser
  .pipe(browserSync.stream());
}

function scripts() {
  return gulp.src('./app/assets/scripts/app.js')
    .pipe(webpackStream(webpackConfig), webpack).on('error', function(err, stats){
      if (err) {
        console.log(err.toString());
      }
      console.log(stats.toString());
    })
    .pipe(gulp.dest('./app/temp/scripts/'))
    .pipe(browserSync.stream());
}
//delete docs folder before compile
function deleteDistFolder() {
  return del("./docs");
}

function copyGeneralFiles() {
  const pathToCopy = [
    '.app/**/*',
    '!./app/*.html',
    '!./app/assets/images/**',
    '!./app/assets/styles/**',
    '!./app/assets/scripts/**',
    '!./app/temp',
    '!./app/temp/**'
  ]
  return gulp.src(pathToCopy)
  .pipe(gulp.dest("./docs"));
}
//image minify
function imgMin() {
  return gulp.src(['./app/assets/images/**/*', '!./app/assets/images/icon','!./app/assets/images/icon/**/*'])
  .pipe(imagemin({
    progressive: true,
    interlays: true,
    multipass: true
  }))
  .pipe(gulp.dest("./docs/assets/images"));
}
//css and scripts minify
function minified() {
  return gulp.src("./app/*.html")
  .pipe(usemin({
    css: [function(){return rev()}, function(){return cssnano()}],
    jsAttributes: {
      async: true
    },
    js: [function(){return rev()}, function(){return uglify()}]
  }))
  .pipe(gulp.dest("./docs"));
}
//watch task
function watch() {
  
  browserSync.init({
    notify: false,
    server: {
      baseDir: './app'
    }
  })
  gulp.watch('./app/template/**/*.html', fileToInclude)
  gulp.watch('./app/assets/styles/**/*.css', style);
  gulp.watch('./app/**/*.html').on('change', browserSync.reload);
  gulp.watch('./app/assets/scripts/**/*.js', scripts);
}
//preview docs after compile
function previewDist() {
  
  browserSync.init({
    notify: false,
    server: {
      baseDir: './docs'
    }
  })
  gulp.watch('./docs/assets/styles/**/*.css', style);
  gulp.watch('./docs/*.html').on('change', browserSync.reload);
  gulp.watch('./docs/assets/scripts/**/*.js', scripts);
}

exports.fileToInclude = fileToInclude;
exports.style = style;
exports.scripts = scripts;
exports.build = gulp.series(deleteDistFolder, imgMin, minified,copyGeneralFiles);
exports.watch = watch;
exports.dist = previewDist;