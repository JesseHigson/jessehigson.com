'use strict'

require('dotenv').config({ path: '.env' })

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
var gutil = require('gulp-util')
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
var flexbugs = require('postcss-flexbugs-fixes')
var cssvariables = require('postcss-css-variables')
var sass = require('gulp-sass')
var webp = require('gulp-webp')
var clone = require('gulp-clone')
var browserify = require('browserify')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
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
var imageResize = require('gulp-image-resize')
var spawn = require('child_process').spawn
var critical = require('critical').stream
var inline = require('gulp-inline-css')
var nano = require('cssnano')
var es = require('event-stream')
var log = require('fancy-log')

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

// The current environment
var environment = process.env.ENVIRONMENT || 'production'

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

const parameters = yaml(fs.readFileSync(config.parameters[environment], 'utf8'))

gulp.task('inject-cdn-url', function () {
  if (!fs.existsSync(config.cdn)) {
    fs.writeFileSync(config.cdn, `
/* inject:cdn */
/* endinject */
    `)
  }

  return gulp.src(config.cdn)
    .pipe(plugins.inject(gulp.src(config.parameters[environment]), {
      transform: function (filepath, file, i, length) {
        if ('cdn_url' in parameters) {
          return '$assetBaseUrl: "' + parameters.cdn_url + '"'
        }
      },
      starttag: '/* inject:cdn */',
      endtag: '/* endinject */'
    }))
    .pipe(gulp.dest(config.scssFolder))
})

/* Stylesheets
 ========================================================================== */
gulp.task('inject-critical-css', function () {
return gulp.src([config.compiledHTML])
  .pipe(critical({
    base: '_site/',
    css: '_site/assets/dist/css/style.min.css',
    extract: false,
    ignore: ['@font-face', /url\(/],
    inline: true,
    minify: true,
    dimensions: [{
      height: 812,
      width: 375
    }, {
      height: 768,
      width: 1024
    }, {
      height: 1050,
      width: 1680
    }]
  }))
  .on('error', function (error) { return log.error(error.message) })
  .pipe(gulp.dest('_site'))
})


gulp.task('compile-dev-sass', function () {
  return gulp.src(config.scss)
    // Sass
    .pipe(sass()
      .on('error', sass.logError))

    // Prefix where needed
    .pipe(postcss([flexbugs, cssvariables, autoprefixer(config.autoprefixer), nano()]))

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


gulp.task('compile-prod-sass', function () {
  return gulp.src(config.scss)
    // Sass
    .pipe(sass()
      .on('error', sass.logError))

    // Prefix where needed
    .pipe(postcss([flexbugs, cssvariables, autoprefixer(config.autoprefixer), nano()]))

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

gulp.task('inject-styles', function () {
  var files = gulp.src([config.dist.css + '/**/*.css', '!' + config.dist.css + '/{admin,critical}*.css'], { read: false })

  return Promise.all([
    gulp.src(config.styles.folder + config.styles.filename)
      // Inject
      .pipe(inject(files, {
        transform: function (filepath) {
          return '<link rel="stylesheet" media="print" onload="this.media=\'all\'" href="{{ site.cdn_url }}' + filepath + '" type="text/css" data-turbolinks-eval="false" crossorigin>'
        },
        ignorePath: '/_site'
      }))
      .pipe(gulp.dest(config.styles.folder)),

    gulp.src(config.styles.folder + config.styles.preload)
      // Inject
      .pipe(inject(files, {
        transform: function (filepath) {
          return '<link rel="preload" as="style" href="{{ site.cdn_url }}' + filepath + '"  type="text/css" crossorigin />'
        },
        ignorePath: '/_site',
        starttag: '<!-- inject:css-preload -->',
        endtag: '<!-- endinject -->'
      }))
      .pipe(gulp.dest(config.styles.folder)),

  ])
})

gulp.task('dev-styles', gulp.series('inject-cdn-url', 'compile-dev-sass', 'inject-styles'))
gulp.task('prod-styles', gulp.series('inject-cdn-url', 'compile-prod-sass', 'inject-styles'))

/* Javascript
 ========================================================================== */
// Production
gulp.task('compile-prod-js', function () {
  return browserify({
    debug: false,
    entries: [config.js.app],
    insertGlobalVars: {
      environment: function (file, dir) {
        return '"prod"'
      }
    }
  })

    // Minify modules
    .transform('uglifyify', { global: true })
    // Transpile ES6+ syntax
    .transform('babelify')
    .bundle()
    .on('error', errorLogger)
    .pipe(source('app.js'))

    // Set destination
    .pipe(buffer())

    // Write sourcemaps
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))

    // Revision
    .pipe(rev())

    // Write again
    .pipe(gulp.dest(config.dist.js))

    // Show total size of js
    .pipe(size({
      title: 'js'
    }))
})

gulp.task('inject-prod-scripts', function () {
  return Promise.all([
    gulp.src(config.scripts.folder + config.scripts.filename)
      // Inject
      .pipe(inject(gulp.src(config.dist.js + '/**/*.js'), {
        transform: function (filepath) {
          return '<script src="{{ site.cdn_url }}' + filepath + '" async data-turbolinks-eval="false" crossorigin></script>'
        },
        ignorePath: '/_site'
      }))
      .pipe(gulp.dest(config.scripts.folder)),

    gulp.src(config.scripts.folder + config.scripts.preload)
      // Inject
      .pipe(inject(gulp.src(config.dist.js + '/**/*.js'), {
        transform: function (filepath) {
          return '<link rel="preload" as="script" href="{{ site.cdn_url }}' + filepath + '" crossorigin />'
        },
        ignorePath: '/_site',
        starttag: '<!-- inject:js-preload -->',
        endtag: '<!-- endinject -->'
      }))
      .pipe(gulp.dest(config.scripts.folder)),

  ])
})

gulp.task('scripts-prod', gulp.series('compile-prod-js', 'inject-prod-scripts'))

// Development
gulp.task('compile-dev-js', function () {
  return browserify(config.js.app)
    // Handle errors gracefully
    .plugin('errorify')

    // Minify modules
    // .transform('uglifyify', {global: true})

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

gulp.task('inject-dev-scripts', function () {
  var files = gulp.src(config.dist.js + '/**/*.js', { read: false })
  var livereloadConfig = require('./livereload.conf')

  return Promise.all([
    gulp.src(config.scripts.folder + config.scripts.filename, { allowEmpty: true })
    // Inject
    .pipe(inject(files, {
      transform: function (filepath) {
        const lr = '<script src="https://' + livereloadConfig.host + ':' + livereloadConfig.port + '/livereload.js" data-turbolinks-eval="false"></script>\n'
        // Concatenate the livereload snippet and JS files
        return lr + '<script src="{{ site.cdn_url }}' + filepath + '" data-turbolinks-eval="false" crossorigin></script>'
      },
      ignorePath: '/_site',
    }))
    .pipe(gulp.dest(config.scripts.folder)),

    gulp.src(config.scripts.folder + config.scripts.preload)
      .pipe(inject(files, {
        transform: function (filepath) {
          // Concatenate the livereload snippet and JS files
          return '<link rel="preload" as="script" href="{{ site.cdn_url }}' + filepath + '" crossorigin />'
        },
        ignorePath: '/_site',
        starttag: '<!-- inject:js-preload -->',
        endtag: '<!-- endinject -->'
      }))
      .pipe(gulp.dest(config.scripts.folder))

      // Reload browser window
      .pipe(livereload())
  ])
})

gulp.task('scripts-dev', gulp.series('compile-dev-js', 'inject-dev-scripts'))

/* HTML
 ========================================================================== */

gulp.task('html', () => {
  const arguments_ = {
    dev: [
      'exec',
      'jekyll',
      'build',
      '--trace',
      '--drafts',
      '--config',
      '_config.yml,_config.dev.yml'
    ],
    staging: [
      'exec',
      'jekyll',
      'build',
      '--config',
      '_config.yml,_config.staging.yml'
    ],
    production: [
      'exec',
      'jekyll',
      'build'
    ]
  }

  return spawn('bundle', arguments_[environment], {
    stdio: 'inherit'
  })
})


/* Images
 ========================================================================== */
 gulp.task('images', function () {
  // Imagemin
  return gulp.src([config.img, config.svg])
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

    // Set destination
    .pipe(gulp.dest(config.dist.img))

    // Reload browser window
    .pipe(livereload())

    // Show total size of images
    .pipe(size({
      title: 'images'
    }))
})

gulp.task('videos', function () {
  return gulp.src([config.video])
    .pipe(gulp.dest(config.dist.video))

    // Show total size of videos
    .pipe(size({
      title: 'videos'
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

  var livereloadConfig = require('./livereload.conf')

  // Livereload
  livereload.listen(livereloadConfig)
  gulp.watch(config.liveReloadFiles).on('change', function (file) {
    livereload.changed(file.path)
  })

  // Styles
  gulp.watch([config.scss, '!' + config.cdn], gulp.series('dev-styles'))

  // Scripts
  gulp.watch(config.js.all, gulp.series('scripts-dev'))

  // Images
  gulp.watch(config.img, gulp.series('images'))

  // Videos
  gulp.watch(config.video, gulp.series('videos'))

  // HTML
  gulp.watch(config.html, gulp.series('html'))
})


// Build
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'prod-styles',
    'scripts-prod',
    'images',
    'fonts',
    'videos'
  ),
  'html',
  'inject-critical-css'
))

// Build Deploy
gulp.task('build-deploy', function (done) {
  allowChmod = false

  gulp.start('build')
})

// Default
gulp.task('default',
  gulp.series(
  'clean',
  gulp.parallel(
    'dev-styles',
    'scripts-dev',
    'images',
    'fonts',
    'videos'
  ),
  'html',
  'watch'
))