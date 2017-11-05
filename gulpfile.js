var gulp = require("gulp"); 
var runSequence = require('run-sequence');
var browserSync = require("browser-sync").create();

// Styles
var less = require('gulp-less');
var autoprefixer = require("gulp-autoprefixer");
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');

// Pug
var pug = require('gulp-pug');

// Optimize, minify, compress
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var rev = require('gulp-rev');
var usemin = require('gulp-usemin');
var htmlclean = require('gulp-htmlclean');
var size = require('gulp-size');

/* ------------------------------------
  SERVER
------------------------------------ */
gulp.task("server", function () {
	browserSync.init({
		server: { baseDir: './app/' }
	});
});

/* ------------------------------------
  LESS
------------------------------------ */
gulp.task('less', function() {
    return gulp.src('./app/less/main.less')
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(autoprefixer({ browsers: ['last 4 versions'] }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./app/css/'))
      .pipe(browserSync.stream());
});

/* ------------------------------------
  SASS
------------------------------------ */
gulp.task('scss', function () {
  return gulp.src('./app/scss/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 4 versions'] }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/css/'))
    .pipe(browserSync.stream());
});

/* ------------------------------------
  PUG
------------------------------------ */
gulp.task('pug', function() {
    return gulp.src('./app/pug/*.pug')
      .pipe(pug({
        pretty: true
      }))
      .pipe(gulp.dest('./app/'))
      .pipe(browserSync.stream());
});

/* ------------------------------------
  WATCH
------------------------------------ */
gulp.task('watch', function() {
    gulp.watch('app/less/**/*.less', ['less']);
    gulp.watch('app/pug/**/*.pug', ['pug']);
});	

/* ------------------------------------
  GULP - DEFAULT TASK 
------------------------------------ */
gulp.task('default', function() {
    runSequence(
		['less', 'pug'],
		['server', 'watch']
    )
});

/* ------------------------------------
  DIST TASKS
------------------------------------ */

gulp.task('clean-dist', function() {
    return gulp.src('./dist/')
    .pipe(clean({force: true}));
});

gulp.task('html-dist', function() {
    return gulp.src('./app/*.html')
      .pipe(usemin({
        vendorCss: [function() { return rev() }, function() { return minifyCss() } ],
        userCss: [function() { return rev() }, function() { return minifyCss() } ],
        vendorJs: [function() { return rev() }, function() { return uglify() } ],
        userJs: [function() { return rev() }, function() { return uglify() } ]
      }))
    .pipe(htmlclean())
  .pipe(gulp.dest('./dist/'));
});

gulp.task('img-dist', function() {
    return gulp.src('./app/img/**/*.*')
    .pipe(imagemin({
        progressive: true,
        interlaced: true
    }))
    .pipe(size())
    .pipe(gulp.dest('./dist/img/'));
});

gulp.task('copy', function() {

    gulp.src('./app/php/**/*.*')
        .pipe(gulp.dest('./dist/php/'))

    gulp.src('./app/files/**/*.*')
        .pipe(gulp.dest('./dist/files/'))

});

/* ------------------------------------
  SERVER DIST
------------------------------------ */
gulp.task("server-dist", function () {
  browserSync.init({
    server: { baseDir: './dist/' }
  });
});

gulp.task('dist',['less', 'pug'], function() {
    runSequence(
      'clean-dist',
      ['html-dist', 'img-dist', 'copy'],
      ['server-dist']
    )
});

gulp.task('dist-fast',['less', 'pug'], function() {
  runSequence(
    'clean-dist',
    ['html-dist', 'copy'],
    ['server-dist']
  )
});

/* ------------------------------------
  DOCS TASKS
------------------------------------ */
gulp.task('clean-docs', function() {
    return gulp.src('./docs/')
    .pipe(clean({force: true}));
});

gulp.task('copy-docs', function() {
    gulp.src('./dist/**/*.*').pipe(gulp.dest('./docs/'));
});

gulp.task('docs', function() {
    runSequence(
      'clean-docs',
      'copy-docs'
    )
});