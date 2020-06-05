//essential
const { src, dest, watch, series, parallel } = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const ejs  = require('gulp-ejs');
const rename  = require('gulp-rename');
const connect   = require('gulp-connect');
const spritesmith = require('gulp.spritesmith');
const svgSprite = require('gulp-svg-sprite');
const replace = require('gulp-replace');

//clean
async function clean(cb){
    await del('dist/**', { force:true });
    cb()
};

//task
function svgSpriteTask() {
    return src('./src/svgs/*.svg').pipe(svgSprite({
        mode: {
            css: {
              render: {
                scss: {
                    dest: '_svg'
                }
              }
            }
        }
    }))
    .pipe(dest('./src/styles/sprite'));
}

function sassTask() {
    return src('./src/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(dest('./dist/css'))
    .pipe(connect.reload());
}

function ejsTask() {
    return src('./src/views/*.ejs')
    .pipe(ejs({ title: "nxflow" }))
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('./dist'))
    .pipe(connect.reload());
}

//file move
function fileTask(){
    return src('./src/styles/sprite/css/svg/*.svg')
    .pipe(dest('./dist/svg'))
}
function imgTask(){
    return src('./src/img/*.*')
    .pipe(dest('./dist/img'))
}
function fontTask(){
    return src('./src/fonts/*.*')
    .pipe(dest('./dist/font'))
}

//serve
function connectServer() {
    connect.server({
        root: './dist',
        livereload: true,
        port: 8001
    });
}
function watchFile() {
    watch('./src/styles/**/*.scss', sassTask)
    watch('./src/views/*.ejs', ejsTask)
}

//replace
function replaceSvgTask() {
    return src('./src/styles/sprite/css/_svg.scss')
      .pipe(replace('url("svg', 'url("/svg'))
      .pipe(dest('./src/styles/sprite/css/'));
}

//imagesprite
function spriteTask() {
    let spriteData = src('./src/images/*.png')
    .pipe(spritesmith({
        imgName: './sprite.png',
        cssName: 'sprite.css',
        padding: 4,        
    }));
    spriteData.img.pipe(dest('./dist/img'));
    return spriteData.css.pipe(dest('./dist/css'));
}
function replaceTask() {
    return src('./dist/css/sprite.css')
      .pipe(replace('./sprite.png', '/img/sprite.png'))
      .pipe(dest('./dist/css/'));
}

exports.default = parallel(
    series(clean, svgSpriteTask, replaceSvgTask, sassTask, ejsTask, 
        fileTask, imgTask, fontTask, spriteTask, replaceTask,
        connectServer),
    watchFile
);

exports.replaceTask = replaceTask;