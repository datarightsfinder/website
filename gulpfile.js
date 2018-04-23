var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var gutil = require('gulp-util');
var nodemon = require('gulp-nodemon');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var pump = require('pump');
var sassPaths = [
  'bower_components/normalize.scss/sass',
  'bower_components/foundation-sites/scss'
];

gulp.task('default', ['sass', 'js', 'nodemon', 'watch']);
gulp.task('deploy', ['sass', 'js']);

gulp.task('watch', function() {
  gulp.watch('assets/sass/**/*.scss', ['sass']);
  gulp.watch('assets/js/*.js', ['js']);
});

gulp.task('nodemon', function() {
  nodemon({
    script: 'index.js',
    ext: 'html yaml js'
  });
});

gulp.task('sass', function() {
  return gulp.src('assets/sass/app.scss')
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: 'compressed' // if css compressed **file size**
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('public/css'));
});

gulp.task('js', function (cb) {
  pump([
    gulp.src('assets/js/*.js'),
    uglify(),
    gulp.dest('public/js')
  ], cb);
});
