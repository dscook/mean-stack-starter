var gulp                = require('gulp'),
    $                   = require('gulp-load-plugins')(),
    shell               = require('gulp-shell'),
    nodemon             = require('gulp-nodemon'),
    childProcess        = require('child_process'),
    mkdirp              = require('mkdirp'),
    mongoose            = require('mongoose'),
    express             = require('express'),
    protractor          = require('gulp-protractor').protractor,
    rimraf              = require('rimraf'),
    sequence            = require('run-sequence'),
    config              = require('./config'),
    fs                  = require('fs');

// GLOBAL CONFIGURATION
// - - - - - - - - - - - - - - -
var environment = 'development';

var envConfig = {
    development: {
        sassStyle: 'nested',
        compress: false,
        beautify: true,
        comments: true,
        mangle: false
    },
    staging: {
        sassStyle: 'compressed',
        compress: true,
        beautify: false,
        comments: false,
        mangle: true
    },
    production: {
        sassStyle: 'compressed',
        compress: true,
        beautify: false,
        comments: false,
        mangle: true
    }
};

// MAIN TASKS
// - - - - - - - - - - - - - - -

// Default task: builds the app, starts a server, and recompiles assets when they change
// Used in development
gulp.task('default', ['start']);

// Run the end-to-end tests
// Note this does not work on Windows, you must run 'gulp' and 'webdriver-manager start' manually
// followed by 'gulp protractor'
gulp.task('tests', ['protractor'], function () {
    // Quit all running proccesses on test completion
    process.exit();
});

// TEARDOWN HANDLING
// - - - - - - - - - - - - - - -

// Process handles are global variables so we can kill them on exit from this process
var mongoProcess;
var webdriverProcess;

// Terminate any spawned processes as part of the tidy up when this process exits
process.on('exit', function () {
    if (mongoProcess) {
        mongoProcess.kill();
    }
    if (webdriverProcess) {
        // Kill all processes in the webdriver group, as it spawns a child process
        process.kill(-webdriverProcess.pid);
    }
});

// DEVELOPMENT TASKS
// - - - - - - - - - - - - - - -

// Starts MongoDB, waits for mongo to have started fully
gulp.task('mongo', function (callback) {
    mkdirp.sync('./db');
    mongoProcess = childProcess.spawn('mongod', ['--dbpath=db', '--smallfiles']);
    mongoProcess.stdout.on('data', function (data) {
        // Uncomment the below if you need to debug mongo startup problems
        //console.log('mongoSTDOUT:' + data);
        if (String(data).indexOf('waiting for connections on port 27017') !== -1) {
            callback();
        } else if (String(data).indexOf('addr already in use') !== -1) {
            // Linux machines start mongo with an init.d script
            // Use the existing instance if it's running
            console.log('BUILDSCRIPT: Mongo already running, script will utilise existing instance');
            callback();
        }
    });
    mongoProcess.stderr.on('data', function (data) {
        console.log('mongoSTDERR:' + data);
    });
});

// Starts the server, which you can view at http://localhost:8080
gulp.task('start', ['mongo', 'build'], function () {
    // Watch for changes in HTML files
    gulp.watch(['./public/*.html', 
                './public/modules/**/*.html',
                './public/img/*'], ['build-copy']);
    // Watch Sass
    gulp.watch(['./public/scss/**/*'], ['build-sass']);
    // Watch for javascript changes
    gulp.watch(['./public/modules/**/*.js', './shared/js/**/*'], ['build-javascript']);

    return nodemon({
                    script: 'server.js',
                    ext: 'js',
                    // Must specify default directories due to a bug in nodemon
                    ignore: ['.sass-cache/*',
                             'bower_components/*',
                             'build/*',
                             'node_modules',
                             'public/*',
                             'tests/*'],
                    env: { 'NODE_ENV': 'development' },
                    // Enable the node debugger
                    nodeArgs: ['--debug']
                  });
});

// TEST TASKS
// - - - - - - - - - - - - - - -

// Drop the database
gulp.task('database-drop', ['mongo'], function (callback) {
    // Get the environment from the express environment variable for consistency with the app
    var app = express();
    var environment = app.get('env');
    mongoose.connect(config.mongodb[environment].url);
    mongoose.connection.on('open', function () {
        mongoose.connection.db.dropDatabase(function (err) {
            if (err) {
                callback(err);
            } else {
                mongoose.connection.close(callback);
            }
        });
    });
});

// Start the selenium webdriver
gulp.task('webdriver', function (callback) {
    // The webdriver spanws child processes so make it the group leader so we can kill them all on exit
    webdriverProcess = childProcess.spawn('webdriver-manager', ['start'], {detached: true});
    var webdriverStartedString = 'Started org.openqa.jetty.jetty.Server';
    webdriverProcess.stdout.on('data', function (data) {
        console.log('webdriverSTDOUT:' + data);
    });
    webdriverProcess.stderr.on('data', function (data) {
        // For some reason the web driver writes its output to standard error
        if (String(data).indexOf(webdriverStartedString) !== -1) {
            callback();
        }
    });
});

// Run the protractor tests
gulp.task('protractor', ['database-drop', 'start', 'webdriver'], function () {
    // Must pass no files to gulp protractor so we can order tests in the protractor conf
    return gulp.src([])
            .pipe(protractor({
                configFile: "./tests/protractor.conf.js",
                args: ['--baseUrl', 'http://localhost:8080']
            })) 
            .on('error', function (e) { 
                throw e });
});

// PRODUCTION TASKS
// - - - - - - - - - - - - - - -

// Performs a production build, pass in callback so we can block until the build is complete
gulp.task('production-build', function (callback) {
    environment = 'production';
    sequence('build', callback);
});

// STAGING TASKS
// - - - - - - - - - - - - - - -

// Performs a production build, pass in callback so we can block until the build is complete
gulp.task('staging-build', function (callback) {
    environment = 'staging';
    sequence('build', callback);
});

// BUILD CONFIGURATION
// - - - - - - - - - - - - - - -

// Sass will check these folders for files when @import is used
var sassPaths = [
    './public/scss',
    './bower_components/foundation-apps/scss',
    './bower_components/fontawesome/scss'
];

// These files include Foundation for Apps and AngularJS
var librariesJS = [
    // JQuery must come before Angular so it is used rather than the built in jQuery Lite
    './bower_components/jquery/dist/jquery.js',
    './bower_components/fastclick/lib/fastclick.js',
    './bower_components/viewport-units-buggyfill/viewport-units-buggyfill.js',
    './bower_components/tether/tether.js',
//  Mokey patched angular library used until library fixed by vendor
//    './bower_components/angular/angular.js',
    './bower_components/hammerjs/hammer.js',
    './monkey-patches/angular.js',
    './bower_components/angular-animate/angular-animate.js',
    './bower_components/angular-resource/angular-resource.js',
    './bower_components/angular-sanitize/angular-sanitize.js',
    './bower_components/angular-ui-router/release/angular-ui-router.js',
    './bower_components/angular-socket-io/socket.js',
    './bower_components/foundation-apps/js/vendor/**/*.js',
    './bower_components/foundation-apps/js/angular/**/*.js',
    '!./bower_components/foundation-apps/js/angular/app.js',
    './bower_components/matchmedia/matchMedia.js',
    './bower_components/matchmedia-ng/matchmedia-ng.js',
    './bower_components/lodash/lodash.js',
    './bower_components/Chart.js/Chart.js',
    './bower_components/angular-chart.js/dist/angular-chart.js',
    './bower_components/angular-tooltips/src/js/angular-tooltips.js',
    './bower_components/ngstorage/ngStorage.js',
    './bower_components/angular-pickadate/src/angular-pickadate.js',
// Money patched ez-plus libraries used until fixed by vendor
//    './bower_components/ez-plus/src/jquery.ez-plus.js',
//    './bower_components/angular-ez-plus/js/angular-ezplus.js',
    './monkey-patches/jquery.ez-plus.js',
    './monkey-patches/angular-ezplus.js',
    './node_modules/socket.io/node_modules/socket.io-client/socket.io.js',
    './node_modules/angular-uuid/angular-uuid.js'
];

// These files include any internal libraries
var sharedJS = [
    './shared/js/async.js',
    './shared/js/enums.js',
    './shared/js/utils.js'
];

// These files are for our application's JavaScript
var appJS = [
  './public/modules.js'
];

// BUILD TASKS
// - - - - - - - - - - - - - - -

// Cleans the build directory
gulp.task('build-clean', function (callback) {
    rimraf('./build', callback);
});

// Creates the build directory
gulp.task('build-create-dir', function () {
    if (!fs.existsSync('./build')) {
        fs.mkdirSync('./build');
    }
});

// Copies application files and Foundation assets
gulp.task('build-copy', function () {
    // Main application HTML and images
    gulp.src(['./public/*.html', 
              './public/modules/**/*.html'], {
        base: './public/'
    })
    .pipe(gulp.dest('./build'));

    // Application images
    gulp.src('./public/img/*')
    .pipe(gulp.dest('./build/assets/img/'));

    // Application SVG icons
    gulp.src('./public/icons/*')
    .pipe(gulp.dest('./build/assets/icons/'));

    // Iconic SVG icons
    gulp.src('./bower_components/foundation-apps/iconic/**/*')
    .pipe(gulp.dest('./build/assets/img/iconic/'));

    // Font Awesome SVG icons
    gulp.src('./bower_components/fontawesome/fonts/**/*')
    .pipe(gulp.dest('./build/assets/fonts/'));

    // IcoMoon generated icon fonts
    gulp.src('./public/fonts/**/*')
    .pipe(gulp.dest('./build/assets/fonts/'));    

    // CSS files for Angular Chart
    gulp.src('./bower_components/angular-chart.js/dist/angular-chart.css')
    .pipe(gulp.dest('./build/assets/css/'));

    // CSS files for Angular Tooltips
    gulp.src('./bower_components/angular-tooltips/dist/angular-tooltips.min.css')
    .pipe(gulp.dest('./build/assets/css/'));

    // Foundation's Angular partials
    return gulp.src(['./bower_components/foundation-apps/js/angular/components/**/*.html'])
    .pipe(gulp.dest('./build/components/'));
});

// Compiles Sass
gulp.task('build-sass', function () {
    return gulp.src('./public/scss/app.scss')
            .pipe($.rubySass({
                loadPath: sassPaths,
                style: envConfig[environment].sassStyle,
                bundleExec: true
            })).on('error', function (err) {
                console.log(err);
            })
            .pipe($.autoprefixer({
                browsers: ['last 2 versions', 'ie 10']
            }))
            .pipe(gulp.dest('./build/assets/css/'));
});

// Set up angular config constants for our given environment
gulp.task('build-app-config', function () {
    return gulp.src('angularConfig.json')
    .pipe($.ngConfig('app', {
        environment: environment,
        createModule: false
    }))
    // Rename output file to index.js so that ngpack picks it up
    .pipe($.rename('index.js'))
    // Put this in factories so that ngpack will process it
    // TODO: once ngpack is updated this can be changed to a constants directory
    .pipe(gulp.dest('public/modules/app/factories/config/'))
});

// Copies the mathjax library, in its own task as this process is lengthy and we need to block until it is complete
gulp.task('build-mathjax', function () {
    // Already minified MathJax library, the whole structure must be brought in due to the way MathJax loads
    // Copying using the native filesystem commands is quicker than piping using gulp
    return gulp.src('')
           .pipe(shell(['mkdir -p ./build/assets/']))
           .pipe(shell(['cp -r ./bower_components/MathJax/ ./build/assets/MathJax/']));
});

// Concatenate application javascript
gulp.task('build-app-javascript', function () {
    // Ngpack is a utility to collapse Angular JS module javascript
    return gulp.src('')
           .pipe(shell(['ngpack build']));
});

// Copies the Foundation for Apps / Angular JavaScript and the application javascript
// Ensures the application javascript is concatenated before this task runs
gulp.task('build-javascript', ['build-app-javascript'], function () {
    // External library JavaScript
    gulp.src(librariesJS)
    .pipe($.uglify({
      compress: envConfig[environment].compress,
      output: {
        beautify: envConfig[environment].beautify,
        comments: envConfig[environment].comments
      },
      mangle: envConfig[environment].mangle
    }).on('error', function(e) {
      console.log(e);
    }))
    .pipe($.concat('external.js'))
    .pipe(gulp.dest('./build/assets/js/'));

    // Internal library javascript
    gulp.src(sharedJS)
    .pipe($.uglify({
      compress: envConfig[environment].compress,
      output: {
        beautify: envConfig[environment].beautify,
        comments: envConfig[environment].comments
      },
      mangle: envConfig[environment].mangle
    }).on('error', function(e) {
      console.log(e);
    }))
    .pipe($.concat('internal.js'))
    .pipe(gulp.dest('./build/assets/js/'));

    // App JavaScript
    return gulp.src('./public/modules.js')
            .pipe($.uglify({
                compress: envConfig[environment].compress,
                output: {
                    beautify: envConfig[environment].beautify,
                    comments: envConfig[environment].comments
                },
                mangle: envConfig[environment].mangle
            }).on('error', function(e) {
                console.log(e);
            }))
            .pipe(gulp.dest('./build/'));
});

// Builds the entire app, pass in callback so we can block until build is complete
gulp.task('build', function (callback) {
    sequence('build-clean', 
             'build-create-dir',
             'build-app-config', // this must come before build-javascript as it sets up the angular constants
             ['build-copy', 'build-sass', 'build-javascript', 'build-mathjax'], callback);
});

