'use strict'

/* ==========================================================================
 Gulpfile
 ========================================================================== */

/* Setup Gulp
 ========================================================================== */
// Require
var gulp = require('gulp')
var del = require('del')
var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var notifier = require('node-notifier')
var postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var flexbugs = require('postcss-flexbugs-fixes')
var cssvariables = require('postcss-css-variables')
var sass = require('gulp-sass')
var sassLint = require('gulp-sass-lint')
var util = require('gulp-util')
var minifyCss = require('gulp-clean-css')
var rename = require('gulp-rename')
var size = require('gulp-size')

// Gulp Config
var showErrorNotifications = true
var allowChmod = true

// Project Config
var config = fs.readFileSync(path.resolve(__dirname, '.groundcontrolrc'), 'UTF-8')
var vars = JSON.parse(config).vars

var resourcesPath = vars.resourcesPath
var distPath = vars.distPath

_.forEach(vars, function (value, key) { // eslint-disable-line unicorn/no-fn-reference-in-iterator
  config = config.replace(new RegExp('\<\=\s*' + key + '\s*\>', 'ig'), value)
})

config = JSON.parse(config)

/* Errorhandling
 ========================================================================== */
var errorLogger, headerLines

errorLogger = function (err) {
  var title = 'Compile Error'
  var header = headerLines(title)
  header += '\n             ' + title + '\n           '
  header += headerLines(title)
  header += '\n           ' + err.message + '\n         '
  header += '\r\n \r\n'
  util.log(util.colors.red(header) + '             ' + err.stack + '\r\n')

  if (showErrorNotifications) {
    notifier.notify({
      'title': 'Compile Error',
      'message': err.message,
      'contentImage': __dirname + '/gulp_error.png'
    })
  }
}

headerLines = function (message) {
  var lines = ''
  for (var i = 0; i < (message.length + 4); i++) {
    lines += '-'
  }
  return lines
}

/* Linting
 ========================================================================== */
// SASS Lint
gulp.task('lint-sass', function () {
  return gulp.src(config.scss)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
})

gulp.task('lint', gulp.series('lint-sass'));

/* Stylesheets
 ========================================================================== */
gulp.task('styles', function () {
  return gulp.src(config.scss)
    // Sass
    .pipe(sass()
      .on('error', sass.logError))

    // Prefix where needed
    .pipe(postcss([flexbugs, cssvariables, autoprefixer(config.autoprefixer)]))

    // Minify output
    .pipe(minifyCss())

    // Rename the file to respect naming covention.
    .pipe(rename(function (path) {
      path.basename += '.min'
    }))

    // Write to output
    .pipe(gulp.dest(config.dist.css))

    // Show total size of css
    .pipe(size({
      title: 'css'
    }))
})

/* Clean/clear
 ========================================================================== */
gulp.task('clean', function (done) {
  return del([
    distPath + '[!.gitkeep]**'
  ], done)
})

/* Default tasks
 ========================================================================== */
// Watch
gulp.task('watch', function () {
  // Styles
  gulp.watch(config.scss, gulp.series('styles'))
})

// Default
gulp.task('default',
  gulp.series(
    'clean',
    gulp.parallel(
      'styles'
    ),
    'watch'
  )
)