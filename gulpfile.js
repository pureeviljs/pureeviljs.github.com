// Assigning modules to local variables
var gulp = require('gulp');
var less = require('gulp-less');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');

var metalsmith      = require('gulp-metalsmith');
var markdown        = require('metalsmith-markdown');
var layouts         = require('metalsmith-layouts');
var permalinks      = require('metalsmith-permalinks');
var assets          = require('metalsmith-assets');
//var archive         = require('metalsmith-archive');
var collections     = require('metalsmith-collections');
var permalinks      = require('metalsmith-permalinks');
//var pagination      = require('metalsmith-pagination');
var paginate          = require('metalsmith-pager');
var dateFormatter   = require('metalsmith-date-formatter');
var pkg = require('./package.json');

// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' */\n',
    ''
].join('');

// Metalsmith
var dir = {
    base:   __dirname + '/',
    lib:    __dirname + '/lib/',
    assets: __dirname + '/assets/',
    source: __dirname + '/src/',
    dest:   './build/'
};

// Default task
// Default task
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy']);

// Less task to compile the less files and add the banner
gulp.task('less', function() {
    return gulp.src('less/clean-blog.less')
        .pipe(less())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest('assets/css'))
});

// Minify CSS
gulp.task('minify-css', ['less'], function() {
    return gulp.src('assets/css/clean-blog.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('assets/css'))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('assets/js/clean-blog.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('assets/js'))
});

// Copy Bootstrap core files from node_modules to vendor directory
gulp.task('bootstrap', function() {
    return gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('assets/vendor/bootstrap'))
});

// Copy jQuery core files from node_modules to vendor directory
gulp.task('jquery', function() {
    return gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('assets/vendor/jquery'))
});

// Copy Font Awesome core files from node_modules to vendor directory
gulp.task('fontawesome', function() {
    return gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('assets/vendor/font-awesome'))
});

gulp.task('metalsmith', function() {
    return gulp.src('src/**')
        .pipe(metalsmith({
            root: __dirname,
            metadata: {
                title: "My Static Site & Blog",
                description: "It's about saying »Hello« to the World.",
                generator: "Metalsmith",
                url: "http://www.metalsmith.io/"
            },
            use: [
                //clean(false),
                //source(dir.source),
                //destination(dir.dest),
                dateFormatter({
                    date: [
                        {
                            key: 'date',
                            format: 'MM DD YYYY'
                        }
                    ]
                }),
                //archive(),
                collections({
                    posts: {
                        pattern: 'posts/*.md'
                    }
                }),
                markdown(),
                permalinks({
                    pattern: 'posts/:title'
                }),
                paginate({
                    // name of the collection the files belong
                    collection: 'posts',

                    // maximum number of element that could be displayed
                    // in the same page.
                    elementsPerPage: 5,

                    // pattern for the path at which the page trunk should
                    // be available
                    pagePattern: 'page/:PAGE/index.html',

                    // format in which the page number should be displayed
                    // in the page navigation bar
                    pageLabel: '[ :PAGE ]',

                    // name of the file that will be the homepage.
                    // this file will have the same info of the page "page/1/index.html".
                    index: 'pagerx.html',

                    // path where the pagination template is located.
                    // it should be relative to the path configured as "source" for metalsmith.
                    paginationTemplatePath: '__partials/pagination.html',

                    // name of the layout that should be used to create the page.
                    layoutName: 'archive.html'

                }),
                /*pagination({
                    'collections.articles': {
                        perPage: 5,
                        template: 'index.jade',
                        first: 'index.html',
                        path: 'page/:num/index.html',
                        filter: function (page) {
                            return !page.private
                        },
                        pageMetadata: {
                            title: 'Archive'
                        }
                    }
                }),*/
                assets({
                    source: dir.assets,
                    destination: 'assets'
                }),
                layouts({
                    engine: 'handlebars'
                })
            ]
        })).pipe(gulp.dest('build'));
});

gulp.task('clean', function () {
    return gulp.src(dir.dest).pipe(clean());
});

// Copy all third party dependencies from node_modules to vendor directory
gulp.task('copy', ['bootstrap', 'jquery', 'fontawesome']);


// Watch Task that compiles LESS and watches for HTML or JS changes and reloads with browserSync
gulp.task('dev', ['less', 'minify-css', 'minify-js'], function() {
    /** watch */
});

// build all
gulp.task('build-all', ['clean', 'less', 'minify-css', 'minify-js', 'metalsmith']);