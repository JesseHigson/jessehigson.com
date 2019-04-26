'use strict'

/* ==========================================================================
 Gulpfile

 Tasks:
 - gulp (builds for dev + watch)
 - gulp build (builds for prod)
 - gulp watch

 ========================================================================== */

/* Setup Gulp
 ========================================================================== */
// Require
var gulp = require('gulp')
var del = require('del')
var fs = require('fs')
var path = require('path')
var _ = require('lodash')
var rebase = require('rebase/tasks/gulp-rebase')
var notifier = require('node-notifier')
var runSequence = require('run-sequence')
var rev = require('gulp-rev')
var postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var objectFitImages = require('postcss-object-fit-images')
var flexbugs = require('postcss-flexbugs-fixes')
var cssvariables = require('postcss-css-variables')
var sass = require('gulp-sass')
var webp = require('gulp-webp')
var clone = require('gulp-clone')
var browserify = require('browserify')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var sassLint = require('gulp-sass-lint')
var esLint = require('gulp-eslint')
var util = require('gulp-util')
var minifyCss = require('gulp-clean-css')
var rename = require('gulp-rename')
var inject = require('gulp-inject')
var size = require('gulp-size')
var livereload = require('gulp-livereload')
var changed = require('gulp-changed')
var imagemin = require('gulp-imagemin')
var buffer = require('gulp-buffer')
var plugins = require('gulp-load-plugins')()
var yaml = require('yaml').parse

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

/* Add Async tag to script
 ========================================================================== */
var addAsyncTag = function (filepath, file, i, length) {
  if (config.js.addAsync === 'true') {
    return '<script src="' + filepath + '" async data-turbolinks-eval="false" crossorigin="anonymous"></script>'
  } else {
    return '<script src="' + filepath + '" data-turbolinks-eval="false" crossorigin="anonymous"></script>'
  }
}

gulp.task('inject-cdn-url', function () {
  if (!fs.existsSync(config.cdn)) {
    fs.writeFileSync(config.cdn, `
/* inject:cdn */
/* endinject */
    `)
  }

  return gulp.src(config.cdn)
    .pipe(plugins.inject(gulp.src(config.parameters), {
      transform: function (filepath, file, i, length) {
        const fileContent = yaml(fs.readFileSync('.' + filepath, 'utf8'))

        if (('parameters' in fileContent) && ('keycdn.base_url' in fileContent.parameters)) {
          return '$assetBaseUrl: "' + fileContent.parameters['keycdn.base_url'] + '";'
        }
      },
      starttag: '/* inject:cdn */',
      endtag: '/* endinject */'
    }))
    .pipe(gulp.dest(config.scssFolder))
})

/* Linting
 ========================================================================== */
gulp.task('lint', ['lint-js', 'lint-sass'])

// ESLint
gulp.task('lint-js', function () {
  return gulp.src([config.js.app, '!' + resourcesPath + '/ui/js/vendors/**/*.js'])
    .pipe(esLint())
    .pipe(esLint.format())
    .pipe(esLint.failOnError())
})

// SASS Lint
gulp.task('lint-sass', function () {
  return gulp.src(config.scss)
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError())
})

/* Stylesheets
 ========================================================================== */

gulp.task('inject-critical-css', ['styles'], function () {
  return gulp.src(config.html)
    .pipe(plugins.inject(gulp.src(config.dist.criticalCSS), {
      transform: function (filepath, file, i, length) {
        return '<style>' + fs.readFileSync('.' + filepath, 'utf8') + '</style>'
      },
      starttag: '<!-- inject:css -->',
      endtag: '<!-- endinject -->'
    }))
    .pipe(gulp.dest('.'))
})

gulp.task('styles', ['inject-cdn-url'], function () {
  return gulp.src(config.scss)
    // Sass
    .pipe(sass()
      .on('error', sass.logError))

    // Prefix where needed
    .pipe(postcss([objectFitImages, flexbugs, cssvariables, autoprefixer(config.autoprefixer)]))

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

    // Reload browser window
    .pipe(livereload())
})

/* Javascript
 ========================================================================== */
// Production
gulp.task('scripts-prod', function () {
  return browserify(config.js.app)
    // Minify modules
    .transform('uglifyify', { global: true })
    // Transpile ES6+ syntax
    .transform('babelify')
    .bundle()
    .on('error', errorLogger)
    .pipe(source('app.js'))

    // Set destination
    .pipe(buffer())

    // Revision
    .pipe(rev())

    // Write again
    .pipe(gulp.dest(config.dist.js))

    // Show total size of js
    .pipe(size({
      title: 'js'
    }))
})

gulp.task('inject-prod-scripts', ['scripts-prod'], function () {
  return gulp.src(config.html)
    // Inject
    .pipe(inject(gulp.src(config.dist.js + '/**/*.js'), {
      transform: addAsyncTag,
      ignorePath: '/web'
    }))

    // Write
    .pipe(gulp.dest('.'))
})

// Development
gulp.task('scripts-dev', function () {
  return browserify(config.js.app)
    // Handle errors gracefully
    .plugin('errorify')

  // Minify modules
  // .transform('uglifyify', { global: true })

    // Transpile ES6+ syntax
    .transform('babelify')

    .bundle()
    .on('error', errorLogger)

    .pipe(source('app.js'))
    .pipe(buffer())

    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))

    // Write
    .pipe(gulp.dest(config.dist.js))
})

gulp.task('inject-dev-scripts', ['scripts-dev'], function () {
  var files = gulp.src(config.dist.js + '/**/*.js', { read: false })

  return gulp.src(config.html)

    // Inject
    .pipe(inject(files, {
      transform: function (filepath) {
        const lr = '<script src="http://localhost:35729/livereload.js" async data-turbolinks-eval="false"></script>\n'
        // Concatenate the livereload snippet and JS files
        return lr + addAsyncTag.apply(inject.transform, arguments)
      }
    }))

    // Write
    .pipe(gulp.dest('.'))

    // Reload browser window
    .pipe(livereload())
})

/* Images
 ========================================================================== */
gulp.task('images', function () {
  var sink = clone.sink()

  return gulp.src(config.img)
    // Only optimize changed images
    .pipe(changed(config.dist.img))

    // Imagemin
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))

    .pipe(sink) // clone image
    .pipe(webp()) // convert cloned image to WebP
    .pipe(sink.tap()) // restore original image

    // Set destination
    .pipe(gulp.dest(config.dist.img))

    // Reload browser window
    .pipe(livereload())

    // Show total size of images
    .pipe(size({
      title: 'images'
    }))
})

/* Fonts
 ========================================================================== */
gulp.task('fonts', function () {
  return gulp.src(config.fonts)
    // Set destination
    .pipe(gulp.dest(config.dist.fonts))

    // Show total size of fonts
    .pipe(size({
      title: 'fonts'
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
  // Livereload
  livereload.listen()
  gulp.watch(config.liveReloadFiles).on('change', function (file) {
    livereload.changed(file.path)
  })

  // Styles
  gulp.watch(config.scss, ['inject-critical-css'])

  // Scripts
  gulp.watch(config.js.all, ['scripts-dev'])

  // Images
  gulp.watch(config.img, ['images'])
})

// Build
gulp.task('build', function (done) {
  runSequence(
    'clean',
    ['inject-critical-css', 'inject-prod-scripts', 'images', 'fonts'],
    done
  )
})

// Build Deploy
gulp.task('build-deploy', function (done) {
  allowChmod = false

  gulp.start('build')
})

// Default
gulp.task('default', function (done) {
  runSequence(
    'clean',
    ['inject-dev-scripts', 'images', 'fonts', 'inject-critical-css'],
    ['watch'],
    done
  )
})
