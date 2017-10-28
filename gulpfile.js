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
var minifyCss = require('gulp-minify-css'); // Сжатие CSS
var imagemin = require('gulp-imagemin'); // Сжатие изображений
var uglify = require('gulp-uglify'); // Сжатие JS
var clean = require('gulp-clean'); // Удаление файлов
var rev = require('gulp-rev'); // Ревизии для css и js  unicorn.css → unicorn-d41d8cd98f.css
var usemin = require('gulp-usemin'); // Объединяет блоки файлов css и js
var htmlclean = require('gulp-htmlclean'); // Сжатие HTML
var size = require('gulp-size'); // Показывает размер готовых файлов



/* ------------------------------------
  SERVER
------------------------------------ */
gulp.task("server", function () {
	browserSync.init({
		// notify: false,
		// port: 1000,
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
        // Your options in here. 
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
    // gulp.watch('app/scss/**/*.scss', ['scss']);
});	



/* ------------------------------------
  GULP - DEFAULT TASK 
------------------------------------ */
gulp.task('default', function() {
    runSequence(
      ['less', 'pug'],
    	// ['scss', 'pug'],
    	['server', 'watch']
    )
});






/* ------------------------------------
  DIST TASKS
------------------------------------ */

// Очищаем папку dist
gulp.task('clean-dist', function() {
    return gulp.src('./dist/')
    .pipe(clean({force: true}));
});

// Таск по обработке HTML? объединяем блоки CSS и JS, минификация HTML
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

// Сжатие изображений
gulp.task('img-dist', function() {
    return gulp.src('./app/img/**/*.*')
    .pipe(imagemin({
        progressive: true,
        interlaced: true
    }))
    .pipe(size())
    .pipe(gulp.dest('./dist/img/'));
});

// Копирование остальных ресурсов из папки app в папку dist
gulp.task('copy', function() {
    
  /* Пример */
  /*    
    gulp.src(['underscore/underscore.js', 'jquery/jquery.js', 'angular/angular.js', 'angular-route/angular-route.js', 'ng-grid/ng-grid-2.0.8.debug.js'])
        .pipe(gulp.dest('build/libs/'))
    gulp.src(['ng-grid/ng-grid.css', 'jquery.ui/themes/base/jquery.ui.theme.css'])
        .pipe(gulp.dest('build/css/'))
  */
    
    // Копируем PHP folder
    gulp.src('./app/php/**/*.*')
        .pipe(gulp.dest('./dist/php/'))

    // Копируем User Files
    gulp.src('./app/files/**/*.*')
        .pipe(gulp.dest('./dist/files/'))

});


/* ------------------------------------
  SERVER DIST
------------------------------------ */
gulp.task("server-dist", function () {
  browserSync.init({
    // notify: false,
    // port: 1000,
    server: { baseDir: './dist/' }
  });
});


// Задач gulp dist - создает папку для загрузки на сервер
// Сжатые html css js
// Оптимизированные сжатые изображения
gulp.task('dist',['less', 'pug'], function() {
    runSequence(
      'clean-dist',
      ['html-dist', 'img-dist', 'copy'],
      ['server-dist']
    )
});



// Задача dist-fast 
// Бывает так что в процессе отладки сборки
// часто приходится делать сборку HTML CSS JS.
// Самая долгая операция в сборке - это оптимизация изображений, особенно если их много.
// Чтобы оптимизация изображений не занимала много времени
// они убраны из этого таска
gulp.task('dist-fast',['less', 'pug'], function() {
  runSequence(
    'clean-dist',
    ['html-dist', 'copy'],
    ['server-dist']
  )
});
