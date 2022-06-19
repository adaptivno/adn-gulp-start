const {src, dest, parallel, series, watch} = require('gulp');

const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const csscomb = require('gulp-csscomb');
const replace = require('gulp-replace-path');
const fileinclude = require('gulp-file-include');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const archive = require('gulp-vinyl-zip');


function browsersync() {
    browserSync.init({
        server: { baseDir: "dist/" },
        notify: false,
        online: true
    })
}

function jslibs() {
    return src('src/js/libs/**/*.js')
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
}

function js() {
    return src('src/js/*.js')
        .pipe(dest('dist/js'))
        .pipe(browserSync.stream());
}

function jssource() {
    return src('src/js/libs/**/*.js')
        .pipe(dest('dist/js/libs'));
}

function styles() {
    return src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gcmq())
        .pipe(csscomb('csscomb.json'))
        .pipe(replace('../../img/', '../img/'))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

function html() {
    return src('src/*.*')
        .pipe(fileinclude({
            indent: 'boolean'
        }))
        .pipe(replace('../img/', 'img/'))
        .pipe(dest('dist'))
        .pipe(browserSync.stream());
}

function fonts() {
    return src('src/fonts/**/*')
        .pipe(dest('dist/fonts'))
}

function img() {
    return src('src/img/**/*')
        .pipe(newer('dist/img'))
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}]
        }))
        .pipe(dest('dist/img'))
        .pipe(browserSync.stream());
}

function clean() {
    return del('dist');
}

function cleanzip() {
    return del('html.zip');
}

function startzip() {
    return src('dist/**/**/**/*')
        .pipe(archive.dest('html.zip'));
}

function startwatch() {
    watch('src/js/*.js', {usePolling: true}, js);
    watch('src/js/libs/*.js', {usePolling: true}, jslibs);
    watch([
        'src/scss/*.scss',
        'src/scss/base/*.scss',
        'src/scss/modules/*.scss',
        'src/scss/scripts/*.scss'
    ], {usePolling: true}, styles);
    watch([
        'src/*.html',
        'src/inc/*.html'
    ], {usePolling: true}, html);
    watch('src/img/**/*', {usePolling: true}, img);
}

exports.browsersync = browsersync;
exports.js = js;
exports.jslibs = jslibs;
exports.styles = styles;
exports.html = html;
exports.fonts = fonts;
exports.img = img;
exports.clean = clean;
exports.cleanzip = cleanzip;
exports.startzip = startzip;
exports.build = series(clean, parallel(styles, html, js, jslibs, jssource, img, fonts));
exports.zip = series(clean, cleanzip, parallel(styles, html, js, jslibs, jssource, img, fonts), startzip);

exports.default = parallel(styles, html, js, jslibs, img, fonts, browsersync, startwatch);