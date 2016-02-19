var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var jscs = require('gulp-jscs');
var less = require('gulp-less');
var uglify = require('gulp-uglify');   //压缩
var cssmin = require('gulp-minify-css'); //- 压缩CSS为一行；
var rename = require('gulp-rename');
//var imagemin = require('gulp-imagemin');       //图片压缩
var replace = require('gulp-replace');
var autoprefixer = require('gulp-autoprefixer');
var banner = require('gulp-banner');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var argv = require('yargs').argv;
var del = require('del');
var processhtml = require('gulp-processhtml');
var minifyHTML   = require('gulp-minify-html');



// Temporary solution until gulp 4
// https://github.com/gulpjs/gulp/issues/355
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;
var opts = {
    src :   process.cwd() +   '/src',
    dist : process.cwd() + '/dist',
    dirs: dirs
};

if(gulp.env.dev){
    opts.uri="http://127.0.0.1";
}else{
    opts.uri="http://tv.sohu.com/upload/touch";
}
var exec = require('child_process').exec,child;
child = exec('rm -rf dist',function(err,out) {
    console.log(out); err && console.log(err);
});
child = exec('rm -rf archive',function(err,out) {
    console.log(out); err && console.log(err);
});
// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', function () {
    fs.mkdirSync(path.resolve(dirs.archive), '0755');
});

gulp.task('archive:zip', function (done) {

    var archiveName = path.resolve(dirs.archive, pkg.name + '_v' + pkg.version + '.zip');
    var archiver = require('archiver')('zip');
    var files = require('glob').sync('**/*.*', {
        'cwd': dirs.dist,
        'dot': true // include hidden files
    });
    var output = fs.createWriteStream(archiveName);

    archiver.on('error', function (error) {
        done();
        throw error;
    });

    output.on('close', done);

    files.forEach(function (file) {

        var filePath = path.resolve(dirs.dist, file);

        // `archiver.bulk` does not maintain the file
        // permissions, so we need to add files individually
        archiver.append(fs.createReadStream(filePath), {
            'name': file,
            'mode': fs.statSync(filePath)
        });

    });

    archiver.pipe(output);
    archiver.finalize();

});

gulp.task('clean', function(done) {
    del([dirs.dist,dirs.archive], done);
});


gulp.task('copy', [
    'copy:index.html',
    'copy:jquery',
    'copy:zepto',
    'copy:modernizr',
    'copy:main.css',
    'copy:misc'
]);

var jsmincfg = {
    mangle: {
        toplevel: true,
        except: ['Zepto', 'jQuery', 'Backbone', 'seajs', 'define', 'require', 'module', 'exports']
    },
    fromString: true,
    compress: true
};


gulp.task('copy:index.html', function () {
    return gulp.src(dirs.src + '/index.html')
               .pipe(replace(/{{JQUERY_VERSION}}/g, pkg.devDependencies.jquery))
        .pipe(replace(/{{_VER_}}/g, pkg.devDependencies.jquery))
               .pipe(gulp.dest(dirs.dist));
});

gulp.task('copy:jquery', function () {
    return gulp.src(['js/vendor/jquery-v2.2.0.min.js'])
               .pipe(rename('jquery-v2.2.0'+ '.min.js'))
               .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:zepto', function () {
    return gulp.src(['js/vendor/zepto-v1.1.6.min.js'])
        .pipe(rename('zepto-v1.1.6'+ '.min.js'))
        .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});
gulp.task('copy:modernizr', function () {
    return gulp.src(['js/vendor/modernizr-v2.8.3.min.js'])
        .pipe(rename('modernizr-v2.8.3'+ '.min.js'))
        .pipe(gulp.dest(dirs.dist + '/js/vendor'));
});

gulp.task('copy:main.css', function () {
    var comment = '/*! h5 Boilerplate v' + pkg.version  +
                    ' | ' + pkg.homepage + ' */\n\n';

    return gulp.src(dirs.src + '/css/main.css')
                .pipe(banner(comment, {
                    pkg: pkg
                }))
               .pipe(autoprefixer({
                   browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
                   cascade: false
               }))
               .pipe(gulp.dest(dirs.dist + '/css'));
});


gulp.task('less', function () {
    gulp.src([
        'src/less/font-awesome.less'
        ,'src/less/light.less'

        ])
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
            cascade: false
        }))
        .pipe(cssmin()) //兼容IE7及以下需设置compatibility属性 .pipe(cssmin({compatibility: 'ie7'}))
        .pipe(gulp.dest('src/css'));
});

gulp.task('copy:misc', function () {
    return gulp.src([
        // Copy all files
        dirs.src + '/**/*',
        // Exclude the following files
        // (other tasks will handle the copying of these files)
        '!' + dirs.src + '/css/main.css',
        '!' + dirs.src + '/index.html'

    ], {
        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist));
});

//压缩seajs+comboHash
gulp.task('seajs', function() {
    return gulp.src([
            opts.src+'/js/seajs.js'
    ])  .pipe(concat('seajs.dev.js'))
        .pipe(uglify(jsmincfg))
        .pipe(rename('seajs.min.js'))
        .pipe(gulp.dest(opts.dist+'/js/'));  //输出
});

//压缩zepto
gulp.task('zepto', function() {

    return gulp.src([
            opts.src+'/js/zepto/zepto.js',
            opts.src+'/js/zepto/event.js',
            opts.src+'/js/zepto/ajax.js',
            opts.src+'/js/zepto/form.js',
            opts.src+'/js/zepto/ie.js',
            opts.src+'/js/zepto/detect.js',
            opts.src+'/js/zepto/fx.js',
            opts.src+'/js/zepto/fx_methods.js',
            opts.src+'/js/zepto/assets.js',
            opts.src+'/js/zepto/data.js',
            opts.src+'/js/zepto/deferred.js',
            opts.src+'/js/zepto/callbacks.js',
            opts.src+'/js/zepto/selector.js',
            opts.src+'/js/zepto/touch.js',
            opts.src+'/js/zepto/ios3.js',
            opts.src+'/js/zepto/gesture.js',
            opts.src+'/js/zepto/stack.js',
            opts.src+'/js/zepto/svp_fx_fn.js',
            opts.src+'/js/zepto/svp_position.js',
            opts.src+'/js/zepto/svp_zepto.js'


    ])  .pipe(concat('zepto.dev.js'))
        .pipe(uglify(jsmincfg))
        .pipe(rename('zepto.min.js'))
        .pipe(gulp.dest(opts.dist+'/js/'));  //输出
});


//压缩zepto
gulp.task('light', function() {

    return gulp.src([

            opts.src+'js/intro.js',
            opts.src+'js/device.js',
            opts.src+'js/util.js',
            opts.src+'js/detect.js',
            opts.src+'js/zepto-adapter.js',
            opts.src+'js/fastclick.js',
            opts.src+'js/template7.js',
            opts.src+'js/page.js',
            opts.src+'js/tabs.js',
            opts.src+'js/bar-tab.js',
            opts.src+'js/modal.js',
            opts.src+'js/calendar.js',
            opts.src+'js/picker.js',
            opts.src+'js/datetime-picker.js',
            opts.src+'js/pull-to-refresh-js-scroll.js',
            opts.src+'js/pull-to-refresh.js',
            opts.src+'js/infinite-scroll.js',
            opts.src+'js/notification.js',
            opts.src+'js/index.js',
            opts.src+'js/searchbar.js',
            opts.src+'js/panels.js',
            opts.src+'js/router.js',
            opts.src+'js/init.js'


    ])  .pipe(concat('light.dev.js'))
        .pipe(uglify(jsmincfg))
        .pipe(rename('light.min.js'))
        .pipe(gulp.dest(opts.dist+'/js/'));  //输出
});


gulp.task('jsmin', ['seajs','zepto','light']);

gulp.task('lint:js', function () {
    return gulp.src([
        'gulpfile.js',
        dirs.src + '/js/*.js',
        dirs.test + '/*.js'
    ]).pipe(jscs())
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(jshint.reporter('fail'));
});

//压缩css
gulp.task('cssmin', function() {
    return gulp.src('src/css/**/*.css')
        .pipe(cssmin())
        .pipe(gulp.dest('dist/css/'));
});


//压缩js
gulp.task('jsmin', function() {

    return gulp.src('src/js/*.js')
        .pipe(rename({suffix: '.min.'+opts.ver }))   //rename压缩后的文件名
        .pipe(uglify(jsmincfg))
        .pipe(gulp.dest('dist/js/'));  //输出
});

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------

gulp.task('archive', function (done) {
    runSequence(
        'build',
        'archive:create_archive_dir',
        'archive:zip',
    done);
});

gulp.task('build', function (done) {
    runSequence(
        ['clean','less','jsmin'],
        'copy','archive',
    done);
});

gulp.task('default', ['build']);
