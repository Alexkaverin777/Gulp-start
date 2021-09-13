const {src, dest, series, parallel, watch} = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const fileInclude = require('gulp-file-include');
const broweserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const csso = require("gulp-csso");



function clearDist() {
    return del('dist')
}


function images(params) {
    return src('app/img/**/*')
        .pipe(imagemin(
            [
                imagemin.gifsicle({ interlaced: true }),
                imagemin.mozjpeg({ quality: 75, progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        { removeViewBox: true },
                        { cleanupIDs: false }
                    ]
                })
            ]
        ))
        .pipe(dest('dist/img'))
};


function scripts() {
    return src([
        'app/js/main.js'//должен быть последним
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(broweserSync.stream())
}

//Библиотека JS
function libsJS() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        // 'node_modules/wowjs/dist/wow.min.js',
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'));
}

//функция для обработки стилей
function styles() {
    return src([
        'app/scss/style.scss'
    ])
        .pipe(scss({ outputStyle: 'compressed' }))//exspandet
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(broweserSync.stream())
}
// Библиотека CSS
function libsCSS() {
    return src([
        'node_modules/normalize.css/normalize.css'
        // 'node_modules/reset-css/reset.css'
        // 'node_modules/animate.css/animate.min.css'
    ])
        .pipe(concat('libs.min.css'))
        .pipe(csso())
        .pipe(dest('app/css'));
}


function build() {
    return src([
        'app/css/**.min.css',
        'app/fonts/**/*',
        'app/js/**.min.js',
        'app/*.html'
    ], { base: 'app' })

        .pipe(dest('dist'))
}


const htmlInclude = () => {
    return src(['./app/include/*.html'])
      .pipe(fileInclude({
        prefix: '@',
        basepath: '@file'
      }))
      .pipe(dest('./app'))
      .pipe(broweserSync.stream());
  }



function watching() {

    broweserSync.init({
        server: {
            baseDir: 'app/'
        }
    });

    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch('./app/include/html/*.html', htmlInclude);
    watch('./app/include/*.html', htmlInclude);

    watch(['app/*.html']).on('change', broweserSync.reload)
}

exports.styles = styles;
exports.libsCSS = libsCSS;
exports.watching = watching;
exports.scripts = scripts;
exports.libsJS = libsJS;
exports.images = images;
exports.htmlInclude = htmlInclude;


exports.build = series(clearDist, images, build);
exports.default = parallel(styles, libsCSS, scripts, libsJS, htmlInclude, watching);


//gulp
//gulp build