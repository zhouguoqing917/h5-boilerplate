var fs = require('fs');
var path = require('path');

var gulp = require('gulp');
var jscs = require('gulp-jscs');
var less = require('gulp-less');
var uglify = require('gulp-uglify');   //压缩
var cssmin = require('gulp-minify-css'); //- 压缩CSS为一行；
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');       //图片压缩
var replace = require('gulp-replace');
var autoprefixer = require('gulp-autoprefixer');
var banner = require('gulp-banner');
var concat = require('gulp-concat');
var rev = require('gulp-rev');
var argv = require('yargs').argv;
var del = require('del');
var processhtml = require('gulp-processhtml');
var minifyHTML   = require('gulp-minify-html');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var livereload = require('gulp-livereload'); //  网页自动刷新（服务器控制客户端同步刷新）
var webserver = require('gulp-webserver'); // 本地服务器
require('es6-promise').polyfill();
var auto_pixer=['last 2 versions', 'Android > 4.0', 'iOS > 6', 'Firefox >= 32', 'Chrome >= 32','ie >= 8',
    'ExplorerMobile > 9','> 1%'];

//  npm install --save-dev gulp-imagemin

var runSequence = require('run-sequence');

var pkg = require('./package.json');
var dirs = pkg['h5bp-configs'].directories;
var opts = {
    src :   process.cwd() +   '/src',
    dist : process.cwd() + '/dist',
    dirs: dirs
};


//时间格式化
var dateString = function (fmt) {
    var dt = new Date();
    var dm = String((dt.getMonth() + 1) >= 12 ? 12 : (dt.getMonth() + 1)),
        dd = String(dt.getDate()),dh = String(dt.getHours()),
        dmi = String(dt.getMinutes()),dse = String(dt.getSeconds());
    dm.length < 2 ? dm = '0' + dm : dm;
    dd.length < 2 ? dd = '0' + dd : dd;
    dh.length < 2 ? dh = '0' + dh :dh;
    dmi.length < 2? dmi = '0' + dmi:dmi;
    dse.length < 2? dse = '0' + dse:dse;

    if (fmt && fmt === 'YYYYMMDD') {
        return dt.getFullYear() + '' + dm + '' + dd;

    } else if(fmt && fmt == 'YYYYMMDDS') {
        return dt.getFullYear() + '' + dm + '' + dd  + dh + '' + dmi + '' + dse;

    } else {
        return dt.getFullYear() + '' + dm + '' + dd + ' ' + dh + ':' + dmi + ':' + dse;
    }
};

opts.date = dateString();
opts.ver = dateString('YYYYMMDD');
opts.uri="http://tv.sohu.com/upload/touch";
var comment = '/*! h5 Boilerplate v 1.0 ,' +' date '+opts.date + ' */\n\n';

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
    'copy:vendor',
    'copy:fonts',
    'copy:main.css',
    'copy:doc',
    'copy:test'
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

gulp.task('copy:vendor', function () {
    return gulp.src([
            dirs.src +'/js/vendor/*min.js',
            '!'+dirs.src +'/js/vendor/zepto*.js'

         ], {
        // Include hidden files by default
        dot: false

    }).pipe(gulp.dest(dirs.dist + '/js/vendor'));
});
gulp.task('copy:fonts', function () {
    return gulp.src([dirs.src +'/fonts/*'], {
        // Include hidden files by default
        dot: false

    }).pipe(gulp.dest(dirs.dist + '/fonts/'));
});


gulp.task('img', function() {
    return gulp.src('src/img/**/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(livereload())
        .pipe(gulp.dest('dist/img'));
});


gulp.task('copy:main.css', function () {


    return gulp.src(dirs.src + '/css/main.css')
                .pipe(banner(comment))
               .pipe(autoprefixer({
                   browsers: ['last 2 versions', 'ie >= 8', '> 1%'],
                   cascade: false
               }))
               .pipe(gulp.dest(dirs.dist + '/css'));
});

gulp.task('less', function() {
    return gulp.src([opts.src+'/less/**/*.less'])
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(less())
        .pipe(autoprefixer({
            browsers:  auto_pixer,
            cascade: false,
            remove:false
        }))
        .pipe(gulp.dest(opts.dist+'/css'))
        .pipe(cssmin()) //兼容IE7及以下需设置compatibility属性 .pipe(cssmin({compatibility: 'ie7'}))
        //.pipe(gulp.dest(opts.dist+'/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(livereload())
        .pipe(gulp.dest(opts.dist+'/css'))


});
gulp.task('copy:demo', function () {
    return gulp.src([
        // Copy all files
        dirs.src + '/demo/*'
    ], {
        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist+'/demo'))
});
gulp.task('copy:doc', function () {
    return gulp.src([
        // Copy all files
            dirs.src + '/doc/*'
    ], {
        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist+'/doc'))
});
gulp.task('copy:test', function () {
    return gulp.src([
        // Copy all files
            dirs.src + '/test/*'
    ], {
        // Include hidden files by default
        dot: true

    }).pipe(gulp.dest(dirs.dist+'/test'));
});

//压缩seajs+comboHash
gulp.task('seajs', function() {
    return gulp.src([
            opts.src + '/js/seajs/seajs.js',
            '!'+opts.src+'/js/seajs/*.min.js'
    ])  .pipe(concat('seajs.js'))
        // .pipe(rename({suffix: '.dev'}))
        .pipe(gulp.dest(opts.dist + '/js/'))
        .pipe(uglify(jsmincfg))
        // .pipe(rename('seajs.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(livereload())
        .pipe(gulp.dest(opts.dist + '/js/'));  //输出
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
            opts.src+'/js/zepto/svp_tpl.js',
            opts.src+'/js/zepto/svp_fx_fn.js',
            opts.src+'/js/zepto/svp_position.js',
            opts.src+'/js/zepto/svp_zepto.js',
            opts.src+'/js/zepto/fastclick.js',
            opts.src+'/js/zepto/lazyLoad.js',

            '!'+opts.src+'/js/zepto/*.min.js'

    ])  .pipe(concat('zepto.js'))
        .pipe(livereload())
        .pipe(gulp.dest(opts.dist + '/js/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
//        .pipe(gulp.dest(opts.dist + '/js/'))
        //        .pipe(rename({ suffix: '.'+opts.ver}))
        .pipe(livereload())
        .pipe(gulp.dest(opts.dist + '/js/'));
});

gulp.task('baseLib', function() {
    return gulp.src([
            opts.src + '/js/base/rem.js',
            opts.src + '/js/base/xdefind.js',
            opts.src + '/js/base/es5-shim.js',
            opts.src + '/js/base/vars.js',
            opts.src + '/js/base/Console.js',
            opts.src + '/js/base/jq-zepto-adapter.js',
            opts.src + '/js/base/ua.js',
            opts.src + '/js/base/device.js',
            opts.src + '/js/base/util.js',
            opts.src + '/js/base/cookie.js',
            opts.src + '/js/base/trace.js',
            opts.src + '/js/base/localStorage.js',
            opts.src + '/js/base/scroll.js',
            opts.src + '/js/base/loading.js',
            opts.src + '/js/base/transition.js',
            opts.src + '/js/base/rDialog.js',
            opts.src + '/js/base/button.js',
            opts.src + '/js/base/carousel.js',
            opts.src + '/js/base/collapse.js',
            opts.src + '/js/base/dropdown.js',
            opts.src + '/js/base/tips.js',
            opts.src + '/js/base/scrollspy.js',
            opts.src + '/js/base/tab.js',
            opts.src + '/js/base/affix.js',
            opts.src + '/js/base/cover.js',
            opts.src + '/js/base/parallax.js',
            opts.src + '/js/base/weixin.js',
            opts.src + '/js/base/codec.js',
            opts.src + '/js/base/qrcode.js',

            '!'+opts.src+'/js/base/*.min.js'
    ])
    .pipe(concat('baseLib.js'))
    .pipe(livereload())
    .pipe(gulp.dest(opts.dist + '/js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify(jsmincfg))
    .pipe(livereload())
    .pipe(gulp.dest(opts.dist + '/js/'));

});

gulp.task('scripts', function() {
    return gulp.src([
            opts.src + '/js/**/*.js',

            '!'+opts.src+'/js/zepto/*.js',
            '!'+opts.src+'/js/seajs/*.js',
            '!'+opts.src+'/js/**/*.min.js'
    ])

        .pipe(gulp.dest(opts.dist + '/js/'))
        .pipe(livereload())
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify(jsmincfg))
        .pipe(livereload())
        .pipe(gulp.dest(opts.dist + '/js/'))
});


gulp.task('js:all', ['seajs','zepto','baseLib','scripts']);

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
        .pipe(gulp.dest(opts.dist + '/css'))
        .pipe(cssmin())
        .pipe(livereload())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(opts.dist +'/css/'))

});
gulp.task('html', function() {
    return gulp.src(opts.src+'/**/*.html')
        .pipe(livereload())
        .pipe(gulp.dest(opts.dist+'/'))

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
        ['clean','less','js:all'],
        'copy','img','cssmin','archive',
    done);
});

gulp.task('default', ['build']);

// 注册任务
gulp.task('webserver', function() {
    gulp.run('build');

    gulp.src( './' )           // 服务器目录（./代表根目录）
        .pipe(webserver({      // 运行gulp-webserver
            livereload: true,  // 启用LiveReload
            open: true         // 服务器启动时自动打开网页
        }));
});

// 监听任务
gulp.task('watch', function() {

    gulp.run('build');
    livereload.listen();

    gulp.watch([opts.src + '/**/*.html'], ['html']);// 监听根目录下所有.html文件

    gulp.watch([opts.src + '/less/**/*.less'], ['less']);

    gulp.watch([opts.src + '/css/*'], ['cssmin']);
    //js太慢了
    gulp.watch([opts.src + '/js/base/*.js'], ['baseLib']);

    gulp.watch([opts.src + '/js/**/*.js'], ['scripts','baseLib']);

    gulp.watch([opts.src + '/img/**'], function (event) {
        gulp.run('img');
    });
    gulp.watch([opts.src + '/fonts/**'], ['copy:fonts']);

    gulp.watch(['dist/**']).on('change', function (file) {
        livereload.changed(file);

    });
});
