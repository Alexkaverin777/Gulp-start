const {src, dest, watch, parallel, series} = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const broweserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');


//Авто обновление страницы
function browesersync() {
    broweserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
};

function clearDist() {
    return del('dist')
}


function images(params) {
    return src('app/img/**/*')
    .pipe(imagemin(
        [
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]
    ))
    .pipe(dest('dist/img'))
};


function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'//должен быть последним
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(broweserSync.stream())
}

//функция для обработки стилей 
function styles (){
    return src('app/scss/style.scss')
    .pipe(scss({outputStyle: 'compressed'}))//exspandet
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(broweserSync.stream())
}

function build() {
    return src([
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ],  {base: 'app'})

    .pipe(dest('dist'))
}


function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js','!app/js/main.min.js'], scripts);
    watch(['app/*html']).on('change', broweserSync.reload)
}

exports.styles = styles;
exports.watching = watching;
exports.browesersync = browesersync;
exports.scripts = scripts;
exports.images = images;
exports.clearDist = clearDist


exports.build = series(clearDist, images, build);
exports.default = parallel(styles, scripts, browesersync, watching);


//gulp 
//gulp build