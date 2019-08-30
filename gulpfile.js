let gulp = require('gulp'),
    jade = require('gulp-pug'),
    batchreplace = require('gulp-batch-replace'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    minify=require('@node-minify/core'),
    gcc=require('@node-minify/google-closure-compiler'),
    browserSync = require('browser-sync').create();

let classList = require('./src/class_replace');

let bootsrapJS = [
    'node_modules/bootstrap/js/dist/index.js',
    'node_modules/bootstrap/js/dist/util.js',
    'node_modules/bootstrap/js/dist/collapse.js',
];
let js2_objects = [
    'node_modules/jquery/dist/jquery.min.js',
    //'node_modules/popper.js/dist/umd/popper.min.js',
    'builds/development/bootstrap.min.js',
    //'node_modules/jquery-lazy/jquery.lazy.min.js',
    'src/suprachem.js'
];

gulp.task('jade', function () {
    return gulp.src('src/*pug')
        .pipe(jade())
        .pipe(gulp.dest('builds/development'));
});


gulp.task('sass', function () {
    return gulp.src('suprachem.scss')
        .pipe(sass())
        .pipe(autoprefixer({browserlist: ["last 2 version", "> 1%", "maintained node versions", "not dead"]}))
        .pipe(rename("suprachem.css"))
        .pipe(gulp.dest("builds/development"))
});

gulp.task('classReplaceHtml', function () {
    return gulp.src('builds/development/*.html')
        .pipe(batchreplace(classList))
        .pipe(gulp.dest('builds/dist'))
});

gulp.task('classReplaceCss', function () {
    return gulp.src('builds/development/suprachem.css')
        .pipe(csso())
        .pipe(batchreplace(classList))
        .pipe(gulp.dest("builds/dist"))
});

//bootstrapJS
gulp.task('bsJS', function () {
    return gulp.src(bootsrapJS)
        .pipe(concat("bootstrap.min.js"))
        .pipe(batchreplace(classList))
        .pipe(gulp.dest('builds/development'));
});

//new bootstrap js
gulp.task('bsJS2', function () {
    return minify({
        compressor: gcc,
        input:bootsrapJS,
        output:'builds/development/bootstrap.min.js',
        options:{
            compilationLevel: 'WHITESPACE_ONLY'
        },
        callback:function () {
            return gulp.src('builds/development/bootstrap.min.js')
                .pipe(batchreplace(classList))
                .pipe(gulp.dest('builds/development'));
        }
    });
});

//concat js
gulp.task('js', function () {
    return gulp.src(js2_objects)
        .pipe(concat("suprachem.js"))
        .pipe(gulp.dest("builds/dist"))
});

//browsersync
gulp.task('browserSync', function () {
    browserSync.init({
        server: {
            baseDir: "./builds/dist/"
        }
    });
});

//replace classes in html and css
gulp.task('classReplace', gulp.series('classReplaceHtml', 'classReplaceCss'));

//jade and html class replace
gulp.task('noSassNoJs', gulp.series('jade', 'classReplaceHtml'));

//do all stuff
//gulp.task('default', gulp.series('jade', 'sass', 'classReplace', 'bsJS', 'js'));
gulp.task('default', gulp.series('jade', 'sass', 'classReplace', 'bsJS2', 'js'));
