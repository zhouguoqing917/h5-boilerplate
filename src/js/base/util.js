/**
 *
 *   @description: 该文件用于定义公共(工具)封装静态工具函数及方法
 *
 *   @version    : 1.0.5
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-12-08
 *
 *   @update-log :
 *                 1.0.1 - 定义公共(工具)方法
 *                 1.0.2 - getSohuDefaultApplink方法中微信并且非iphone下才跳到应用宝
 *                 1.0.3 - 在带有parseXXX处理的方法中加入了try-catch处理
 *                         进行了jshint优化
 *                 1.0.4 - 更改方法名MUID为createUUID
 *                 1.0.5 - 修复makePlayUrl中的bug
 *                         新增formatDateTime方法
 *                         自定义监听类型的所有监听器
 **/

(function (global) {
    'use strict';
    var vars = global.VARS;

    var Util = {
        getAndroidVersionNumber: function () {
            var versionNum = vars.UA.match(/android(.*?);/i) || [];
            return versionNum[1] || '0';
        },

        /**
         * @memberof Util
         * @summary 解析字符串版本号，返回一个数字版本号
         * @type {function}
         * @param {string} versionStr               - 版本号字符串
         * @return {Number}
         */
        getVersionNumber: function (versionStr) {
            var rst = 0;

            try {
                var versionNum = versionStr.replace(/_/g, '.').replace(/^([0-9]+\.[0-9]+)[0-9\.]*/, '$1');
                rst = parseFloat(versionNum || 0);

            } catch (e) {
            }

            return rst;
        },

        /**
         * @memberof Util
         * @summary 加载评论列表后的时间(从现在到评论的时间)
         * @type {function}
         * @param {number} time                     - 时间戳
         * @return {string}                         - 刚刚-1分钟前-59分钟前-1小时前-23小时前-1天前-29天前-1个月前-11个月前-1年前—2年前
         */
        timeFromNow: function (time) {
            var rst = time;

            try {
                var sec = 60,
                    hour = sec * 60,
                    day = hour * 24,
                    month = day * 30,
                    year = month * 12;

                time = (+new Date() - parseInt(time, 10)) / 1000;

                if (time >= year) {
                    rst = Math.floor(time / year) + '年前';

                } else if (time >= month) {
                    rst = Math.floor(time / month) + '个月前';

                } else if (time >= day) {
                    rst = Math.floor(time / day) + '天前';

                } else if (time >= hour) {
                    rst = Math.floor(time / hour) + '小时前';

                } else if (time >= sec) {
                    rst = Math.floor(time / sec) + '分钟前';

                } else {
                    rst = '刚刚';
                }

            } catch (e) {
            }

            return rst;
        },
        /**
         * @memberof Util
         * @summary 格式化时间
         * @type {function}
         * @param {date} time       - 时间1
         * @param {date} time       - 时间
         * @return {string}
         */
        formatDateTime: function (date, now) {
            var rt = '';
            try {

                date = date || new Date();
                now = now || new Date();
                var ss = 60,
                    hh = ss * 60,
                    dd = hh * 24,
                    mm = dd * 30,
                    yy = mm * 12;

                var month = date.getMonth() + 1,
                    day = date.getDate();

                var subDate = now.getTime() - date.getTime();  //时间差的毫秒数
                //计算出相差天数
                var days = Math.floor(subDate / (24 * 3600 * 1000));
                //计算出小时数
                var leave1 = subDate % (24 * 3600 * 1000);   //计算天数后剩余的毫秒数
                var hours = Math.floor(leave1 / (3600 * 1000));
                //计算相差分钟数
                var leave2 = leave1 % (3600 * 1000);       //计算小时数后剩余的毫秒数
                var minutes = Math.floor(leave2 / (60 * 1000));
                //计算相差秒数
                var leave3 = leave2 % (60 * 1000);     //计算分钟数后剩余的毫秒数
                var seconds = Math.round(leave3 / 1000);

                //时间：小于5分钟显示”刚刚“，大于5分钟小于1小时显示N分钟前，
                // 大于1小时小于24小时显示N小时前，大于24小时小于48小时显示昨天，
                // 大于48小时小于7天显示消息推送对应星期N，大于7天显示y-m-d；
                if (month.toString().length < 2) {
                    month = '0' + month;
                }

                if (day.toString().length < 2) {
                    day = '0' + day;
                }

                if (days > 7) {
                    //大于7天显示y-m-d
                    return date.getFullYear() + '-' + month + '-' + day;

                } else if (days >= 2 && days <= 7) {
                    //大于48小时小于7天显示消息推送对应星期N
                    var wkday = date.getDay() || 1;
                    var wkstr = '星期一';

                    switch (wkday) {
                        case 0:
                            wkstr = '星期日';
                            break;
                        case 1:
                            wkstr = '星期一';
                            break;
                        case 2:
                            wkstr = '星期二';
                            break;
                        case 3:
                            wkstr = '星期三';
                            break;
                        case 4:
                            wkstr = '星期四';
                            break;
                        case 5:
                            wkstr = '星期五';
                            break;
                        case 6:
                            wkstr = '星期六';
                            break;
                    }
                    rt = wkstr;

                } else if (days >= 1 && days < 2) {
                    //大于24小时小于48小时显示昨天
                    rt = '昨天';

                } else {

                    if (hours < 24 && hours >= 1) {
                        //大于1小时小于24小时显示N小时前
                        rt = hours + '小时前';

                    } else {

                        if (hours < 1 && minutes >= 5) {
                            //大于5分钟小于1小时显示N分钟前
                            rt = minutes + '分钟前';

                        } else {
                            //小于5分钟显示'刚刚'
                            rt = '刚刚';
                        }
                    }
                }

                return rt;

            } catch (e) {
            }
        },
        /**
         * @memberof Util
         * @summary 将秒数转换为hh:mm:ss格式
         * @type {function}
         * @param {number|string} seconds           - 秒数
         * @return {string}                         - hh:mm:ss格式的字符串
         */
        secondsToTime: function (seconds) {
            var rst = seconds;

            try {
                var totalSeconds = parseInt(seconds, 10);

                if (isNaN(totalSeconds)) {
                    totalSeconds = 0;
                }
                var minutes = Math.floor(totalSeconds / 60);
                seconds = totalSeconds % 60;

                if (seconds < 10) {
                    seconds = '0' + seconds;
                }

                if (minutes < 60) {

                    if (minutes < 10) {
                        minutes = '0' + minutes;
                    }

                    rst = minutes + ':' + seconds;

                } else {
                    var hours = Math.floor(minutes / 60);
                    minutes = minutes % 60;

                    if (minutes < 10) {
                        minutes = '0' + minutes;
                    }

                    if (hours < 10) {
                        hours = '0' + hours;
                    }

                    rst = hours + ':' + minutes + ':' + seconds;
                }

            } catch (e) {
            }

            return rst;
        },

        /**
         * @memberof Util
         * @summary 将秒数转换为文本格式的时间，eg. 65 -> "1分5秒"
         * @type {function}
         * @param {number|string} seconds           - 秒数
         * @return {string}                         - 文本格式的时间
         */
        secondsToTimeText: function (seconds) {
            var rst = seconds;

            try {
                var totalSeconds = parseInt(seconds, 10);

                if (isNaN(totalSeconds)) {
                    totalSeconds = 0;
                }
                var minutes = Math.floor(totalSeconds / 60);
                seconds = totalSeconds % 60 + '秒';

                if (minutes < 60) {

                    rst = (minutes > 0 ? minutes + '分' : '') + seconds;

                } else {
                    var hours = Math.floor(minutes / 60);
                    minutes = minutes % 60;

                    rst = (hours > 0 ? hours + '小时' : '') + minutes + '分' + seconds;
                }

            } catch (e) {
            }

            return rst;
        },

        /**
         * @memberof Util
         * @summary 将数字数量缩短为带单位的字符串，如10,000转化为'1万'
         * @type {function}
         * @param {number|string} count             - 数量
         * @return {string}                         - 带单位的字符串
         */
        shortCount: function (count) {
            var rst = count;

            try {
                count = parseInt(count, 10);

                if (count > 100000000) {
                    count = Math.floor(count / 100000000) + '亿';

                } else if (count > 10000) {
                    count = Math.floor(count / 10000) + '万';
                }

                rst = count;

            } catch (e) {
            }

            return rst;
        },

        /**
         * @memberof Util
         * @summary 将数字数量缩短为带单位的字符串，如10,000转化为'1万 106000 会转为1.1万 (四舍五入)
         * @type {function}
         * @param {number|string} count             - 数量
         * @return {string}                         - 带单位的字符串
         */
        shortFixedCount: function (count) {
            var rst = count;

            try {
                count = parseFloat(count);

                if (count && count >= 100000000) {
                    count = (count / 100000000).toFixed(1) + '亿';

                } else if (count && count >= 10000) {
                    count = (count / 10000).toFixed(1) + '万';
                }
                rst = count;

            } catch (e) {
            }

            return rst;
        },

        /**
         * @memberof Util
         * @summary 截取日期字符串 2013-12-18 07:07:46:57.000 转换为2013-12-18
         * @type {function}
         * @param {string} timeString               - 时间字符串
         * @return {string}                         - 日期字符串
         */
        dateString: function (timeString) {
            var match = timeString.match(/([0-9]{4}\-[0-9]+\-[0-9]+)/);

            if (match) {
                timeString = match[1];
            }

            return timeString;
        },
        compareVersion : function(a, b) {
            var as = a.split('.');
            var bs = b.split('.');
            if (a === b) return 0;

            for (var i = 0; i < as.length; i++) {
                var x = parseInt(as[i]);
                if (!bs[i]) return 1;
                var y = parseInt(bs[i]);
                if (x < y) return -1;
                if (x > y) return 1;
            }
            return 1;
        },

        getTouchPosition : function(e) {
            e = e.originalEvent || e; //jquery wrap the originevent
            if(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
                return {
                    x: e.targetTouches[0].pageX,
                    y: e.targetTouches[0].pageY
                };
            } else {
                return {
                    x: e.pageX,
                    y: e.pageY
                };
            }
        },
        /**
         * @memberof Util
         * @summary 为dom节点添加loading效果
         * @type {function}
         * @param {docElement} el                   - dom节点
         * @return {docElement}                     - 源dom节点
         */
        setLoad: function (el) {
            el = $(el);

            if (!el.hasClass('_load_inited')) {
                el.addClass('_load_inited').append($('<i class="ui_loading"><u></u><u></u><u></u></i>'));
            }

            return el;
        },

        /**
         * @memberof Util
         * @summary 加载script
         * @type {function}
         * @param {string} url                      - script的url地址
         * @param {function} callback               - 可选参数,加载完script后的回调函数
         * @param {object} opts                     - 可选参数,给回调函数传的参数
         */
         loadScript: function (url, callback, opts,type,charset) {
            type =type || 'script';
            charset = charset||'';
            var head = document.getElementsByTagName('head')[0] || document.body,script;
            if(type == 'css') {
                script = document.createElement("link");
                script.setAttribute('rel', 'stylesheet');
                script.setAttribute('href', url);
            }else{
                script = document.createElement('script');
                script.src = url;
            }
            if (charset) {
                script.charset = charset || 'utf-8';
            }
            var done = false;
            script.onload = script.onreadystatechange = function () {
                if (!done && (!this.readyState || this.readyState !== 'loading')) {
                    done = true;
                    if (callback) {
                        callback.apply(null, opts || []);
                    }
                    script.onload = script.onreadystatechange = null;
                    if(type == 'script') {
                        head.removeChild(script);
                    }
                }
            };
            head.appendChild(script);
            return script;
        },

        /**
         * @memberof Util
         * @summary 把web地址转为移动端地址
         * @type {function}
         * @param {string} url                      - web地址
         */
        formatURL: function (url) {
            url += '';
            url = url.replace(/^https?:\/\/(my\.|v\.)?tv\./i, 'http://m.tv.')
                .replace('http://s.', 'http://m.s.')
                .replace('http://m.s.', 'http://m.tv.')
                .replace(/^http:\/\/(video\.)?2012/i, 'http://m.s');

            return url;
        },

        /**
         * @memberof Util
         * @summary 生成播放页地址
         * @type {function}
         * @param {object} object
         * @param {string} channeled
         * @returns {string} url
         */
        makePlayUrl: function (object, channeled) {
            var url = '';

            if (/^(t\.)*m\.tv\.sohu\.com/.test(location.host)) {
                url = 'http://' + location.host;

            } else {
                url = 'http://m.tv.sohu.com';
            }

            if (object.vid) {
                object.site = object.site || 1;

                if (object.site === 1) {
                    url += '/v';

                } else {
                    url += '/u/vw/';
                }
                url += object.vid + '.shtml';

                if (channeled) {
                    url += '?channeled=' + channeled;
                }
            }

            return url;
        },

        /**
         * @memberof Util
         * @summary 取得页面的垂直滚动距离
         * @type {function}
         * @return {Number}                         - 页面垂直滚动距离的象素值
         */
        getPageOffset: function () {

            return window.pageYOffset || (document.body && document.body.scrollTop) || 0;
        },

        /**
         * @memberof Util
         * @summary 获取搜狐视频客户端默认下载链接
         * @type {function}
         * @param {string} apkLink                  - 可选参数，如果填写改参数，直接返回
         * @return {string}                         - 搜狐视频客户端默认下载链接
         */
        getSohuDefaultApplink: function (apkLink) {

            if (apkLink && typeof(apkLink) === 'string') {

                return apkLink;
            }
            var downloadLink = 'http://m.tv.sohu.com/app';

            if (vars.IsAndroid) {

                if (vars.IsAndroidPad) {
                    downloadLink = 'http://upgrade.m.tv.sohu.com/channels/hdv/5.0.0/SohuTVPad_5.0.0_1369_201507271523.apk';

                } else {
                    downloadLink = 'http://upgrade.m.tv.sohu.com/channels/hdv/5.0.0/SohuTV_5.0.0_680_201506111914.apk';
                }
            }

            if (vars.IsIphone) {
                downloadLink = 'https://itunes.apple.com/cn/app/sou-hu-shi-pin-gao-qing/id458587755?mt=8';
            }

            if (vars.IsIpad) {
                downloadLink = 'https://itunes.apple.com/cn/app/sou-hu-shi-pin-hd/id414430589?mt=8';
            }

            if (vars.IsWindowsPhone) {
                downloadLink = 'http://www.windowsphone.com/zh-CN/apps/403faf93-d22c-4331-ac32-9560ee9fac94';
            }

            if (vars.IsWindowsPad) {
                downloadLink = 'http://apps.microsoft.com/windows/zh-CN/app/c5ae3c2a-5573-45c2-ac63-7d67e01de6bb';
            }
            //微信并且非iphone下 才跳到应用宝
            if (vars.IsWeixinBrowser && !vars.IsIphone) {
                downloadLink = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.sohu.sohuvideo&g_f=991881';
            }

            return downloadLink;
        },


        /**
         * @memberof Util
         * @summary Android获取网络连接类型,如果取不到返回空字符串,取到的话返回值为 2g|3g|wifi
         * @type {function}
         * @return {string}                         - 网络连接类型
         */
        getConnectionType: function () {
            var _connection = window.navigator['connection'],
                _connectionType,
                connectionType = '';

            if (_connection) {
                _connectionType = _connection['type'];

                if (_connectionType === _connection['CELL_2G']) {
                    connectionType = '2g';

                } else if (_connectionType === _connection['CELL_3G']) {
                    connectionType = '3g';

                } else if (_connectionType === _connection['WIFI']) {
                    connectionType = 'wifi';
                }
            }

            return connectionType;
        },

        /**
         * @memberof Util
         * @summary 格式化时间，返回xxxx-xx-xx
         * @type {function}
         * @param {date} date                       - 时间对象，不填返回当前时间字符串
         * @return {string}                         - 返回时间字符串,如2013-12-04
         */
        formatDateWithBar: function (date) {
            try {
                date=date||'';

                if (date && typeof(date) == 'string' ){
                    if(date && date.indexOf('-')>-1){
                        return date;
                    }
                    if(date.indexOf('CST')>-1 || date.indexOf('GMT')>-1){
                        date = new Date(date);
                    }else{
                        date = new Date(parseInt(date));
                    }
                } else if(date && typeof(date) == 'number') {
                    date = new Date(parseInt(date));
                } else if (date && typeof(date) == 'object') {
                    date = date || new Date();
                } else {
                    date = new Date();
                }
                var month = date.getMonth() + 1,
                    day = date.getDate();
                if (month.toString().length < 2) {
                    month = '0' + month;
                }
                if (day.toString().length < 2) {
                    day = '0' + day;
                }
                return date.getFullYear() + '-' + month + '-' + day;
            } catch (e) {
                console.log(e);
            }
        },

        /**
         * @memberof Util
         * @summary 格式化时间，返回xxxx年xx月xx日
         * @type {function}
         * @param {date} date                       - 时间对象，不填返回当前时间字符串
         * @return {string}                         - 返回时间字符串,如2013年12月04日
         */
        formatDateWithZh: function (date) {
            date = date || new Date();
            var month = date.getMonth() + 1,
                day = date.getDate();

            if (month.toString().length < 2) {
                month = '0' + month;
            }

            if (day.toString().length < 2) {
                day = '0' + day;
            }

            return date.getFullYear() + '年' + month + '月' + day + '日';
        },

        /**
         * @memberof Util
         * @summary 格式化时间，返回指定样式的字符串
         * @type {function}
         * @param {date} date                       - 时间对象
         * @param {string} format                   - 格式化结果,如: yyyy-MM-dd hh:mm:ss
         * @return {string}                         - 返回时间字符串,如20131204
         */
        formatDateStr: function (date, format) {
            var o = {
                'M+': date.getMonth() + 1, // month
                'd+': date.getDate(), // day
                'h+': date.getHours(), // hour
                'm+': date.getMinutes(), // minute
                's+': date.getSeconds(), // second
                'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
                'S': date.getMilliseconds()
                // millisecond
            };

            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }

            for (var k in o) {

                if (new RegExp('(' + k + ')').test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k]
                        : ('00' + o[k]).substr(('' + o[k]).length));
                }
            }

            return format;
        },

        /**
         * @memberof Util
         * @summary 获取平台参数类型编码
         *          1. PC
         *          2. iPad
         *          3. iPhone
         *          4. AndroidPad
         *          5. AndroidPhone
         *          6. AndroidTV
         *          7. WindowsPad
         *          8. WindowsPhone
         *          9. Symbian
         * @type {function}
         * @return {number}                         - 返回对应的平台类型编码
         */
        getUserPt: function () {
            var pt = 1;

            if (typeof navigator.platform !== 'undefined') {
                var pcArr = ['Win32', 'Win64', 'Windows', 'Mac68K', 'MacPC', 'Macintosh', 'MacIntel'];

                for (var i = 0, l = pcArr.length; i < l; i++) {

                    if (navigator.platform === pcArr[i]) {
                        pt = 1;

                        break;
                    }
                }
            }

            if (vars.IsIpad) {
                pt = 2;
            }

            if (vars.IsIphone) {
                pt = 3;
            }

            if (vars.IsAndroid) {
                pt = 5;

                if (/tv/i.test(vars.UA)) {
                    pt = 6;
                }
            }

            if (vars.IsAndroidPad) {
                pt = 4;
            }

            if (vars.IsWindowsPad) {
                pt = 7;
            }

            if (vars.IsWindowsPhone) {
                pt = 8;
            }

            return pt;
        },

        getUserPt2: function () {
            var pt = 'pc';

            if (typeof navigator.platform !== 'undefined') {
                var pcArr = ['Win32', 'Win64', 'Windows', 'Mac68K', 'MacPC', 'Macintosh', 'MacIntel'];

                for (var i = 0, l = pcArr.length; i < l; i++) {
                    if (navigator.platform === pcArr[i]) {
                        pt = 'pc';
                        break;
                    }
                }
            }

            if (vars.IsIpad) {
                pt = 'iPad';
            }

            if (vars.IsIphone) {
                pt = 'iPhone';
            }

            if (vars.IsAndroid) {
                pt = 'android';
            }

            if (vars.IsAndroidPad) {
                pt = 'androidPad';
            }

            if (vars.IsWindowsPad) {
                pt = 'windowsPad';
            }

            if (vars.IsWindowsPhone) {
                pt = 'windowsPhone';
            }

            return pt;
        },

        getUserSysPt: function () {
            var pt = 'pc';

            if (typeof navigator.platform !== 'undefined') {
                var pcArr = ['Win32', 'Win64', 'Windows', 'Mac68K', 'MacPC', 'Macintosh', 'MacIntel'];

                for (var i = 0, l = pcArr.length; i < l; i++) {

                    if (navigator.platform === pcArr[i]) {
                        pt = 'pc';

                        break;
                    }
                }
            }
            if (vars.IsAndroid) {
                pt = 'android';
            }
            if (vars.IsAndroidPad) {
                pt = 'android';
            }

            if (vars.IsIpad) {
                pt = 'ios';
            }

            if (vars.IsIphone) {
                pt = 'ios';
            }

            if (vars.IsWindowsPad) {
                pt = 'windows';
            }

            if (vars.IsWindowsPhone) {
                pt = 'windows';
            }
        },
        /**
         * @memberof Util
         * @summary 将数组逆序
         * @type {function}
         * @param {array|object} obj               - 数组对象
         * @return {array|string}                  - 调整顺序后的数组对象
         */
        reverse: function (obj) {

            return Array.isArray(obj) ? obj.reverse() : String(obj).split('').reverse().join('');
        },

        /**
         * @memberof Util
         * @summary 获取方法名称
         * @type {function}
         * @param {function} fn                    - 方法
         * @return {string}                        - 方法名称
         */
        getFnName: function (fn) {
            var fnstr = '';

            if (typeof fn === 'function') {
                fnstr = fn.name || (/function ([^\(]+)/.exec(fn.toString()) || [])[1] || '';
            }

            return fnstr;
        },

        /**
         * @memberof Util
         * @summary 生成uuid的一部分
         * @type {function}
         * @param {number} length                  - 指定长度(默认16位)
         * @return {string}                        - uuid
         */
        createUUIDPart: function (length) {
            var uuidpart = '';

            try {
                length = (typeof length === 'number' && length > 0) ? length : 16;

                for (var i = 0; i < length; i++) {
                    var uuidchar = parseInt((Math.random() * 256), 10).toString(16); //十六制

                    if (uuidchar.length === 1) {
                        uuidchar = '0' + uuidchar;
                    }
                    uuidpart += uuidchar;
                }

            } catch (e) {
            }

            return uuidpart;
        },

        /**
         * @memberof Util
         * @summary 生成一个随机数
         * @type {function}
         * @param {number} Min                     - 随机数最小值
         * @param {number} Max                     - 随机数最大值
         * @return {number}                        - 随机数
         */
        getRandomNum: function (Min, Max) {
            var Range = Max - Min;
            var Rand = Math.random();
            return (Min + Math.round(Rand * Range));
        },

        /**
         * @memberof Util
         * @summary 格式化当前日期
         * @type {function}
         * @return {number}                        - 格式化结果，如20150325
         */
        formatDateWithBar2: function () {
            var date = date || new Date(),
                month = date.getMonth() + 1,
                day = date.getDate();

            if (month.toString().length < 2) {
                month = '0' + month;
            }

            if (day.toString().length < 2) {
                day = '0' + day;
            }
            //yyyymmdd
            return date.getFullYear() + '' + month + day;
        },

        /**
         * @memberof Util
         * @summary 生成一个完整的uuid
         * @type {function}
         * @return {string}                        - uuid
         */
        createUUID: function () {
            //sublen 6 char
            //队角形斜边=Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2))
            //像素
            var sw = Math.floor(window.screen.width);
            var sh = Math.floor(window.screen.height);
            var screenSize = Math.floor(Math.sqrt(sw * sw + sh * sh)) || 0;
            var plt = Math.round(this.getUserPt()) || 1;
            var systime = (+new Date) * 1000;
            var uuid = systime + plt + screenSize + Math.round(Math.random() * 1000);
            console.log('h5-uuid:', uuid);

            return uuid;
        },
        evalJSON: function (src) {
            var obj = {};
            try {
                if (/\\%/.test(src)) {
                    src = decodeURIComponent(src);
                }
                if (typeof (JSON) == 'object' && JSON.parse) {
                    obj = eval("[" + src + "]")[0];
                } else {
                    obj = eval("(" + src + ")");
                }
            } catch (e) {
                try {
                    if (/\\%/.test(src)) {
                        src = decodeURIComponent(src);
                    }
                    obj = JSON.parse(src);
                } catch (b) {
                    console.log(b);
                }
            }
            return obj;
        },

        /**
         * 遍历数组，对象，nodeList
         * @name each
         * @grammar utils.each(obj,iterator,[context])
         * @since 1.2.4+
         * @desc
         * * obj 要遍历的对象
         * * iterator 遍历的方法,方法的第一个是遍历的值，第二个是索引，第三个是obj
         * * context  iterator的上下文
         * @example
         * Util.each([1,2],function(v,i){
     *     console.log(v)//值
     *     console.log(i)//索引
     * })
         * Util.each(document.getElementsByTagName('*'),function(n){
     *     console.log(n.tagName)
     * })
         */
        each: function (obj, iterator, context) {
            if (obj == null) return;
            if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === false)
                        return false;
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === false)
                            return false;
                    }
                }
            }
        },

        makeInstance: function (obj) {
            var noop = new Function();
            noop.prototype = obj;
            obj = new noop;
            noop.prototype = null;
            return obj;
        },
        /**
         * 将source对象中的属性扩展到target对象上
         * @name extend
         * @grammar Util.extend(target,source)  => Object  //覆盖扩展
         * @grammar Util.extend(target,source,true)  ==> Object  //保留扩展
         */
        extend: function (t, s, b) {
            if (s) {
                for (var k in s) {
                    if (!b || !t.hasOwnProperty(k)) {
                        t[k] = s[k];
                    }
                }
            }
            return t;
        },
        extend2: function (t) {
            var a = arguments;
            for (var i = 1; i < a.length; i++) {
                var x = a[i];
                for (var k in x) {
                    if (!t.hasOwnProperty(k)) {
                        t[k] = x[k];
                    }
                }
            }
            return t;
        },
        /**
         * 模拟继承机制，subClass继承superClass
         * @name inherits
         * @grammar Util.inherits(subClass,superClass) => subClass
         * @example
         * function SuperClass(){
     *     this.name = "小李";
     * }
         * SuperClass.prototype = {
     *     hello:function(str){
     *         console.log(this.name + str);
     *     }
     * }
         * function SubClass(){
     *     this.name = "小张";
     * }
         * Util.inherits(SubClass,SuperClass);
         * var sub = new SubClass();
         * sub.hello("早上好!"); ==> "小张早上好！"
         */
        inherits: function (subClass, superClass) {
            var oldP = subClass.prototype,
                newP = Util.makeInstance(superClass.prototype);
            Util.extend(newP, oldP, true);
            subClass.prototype = newP;
            return (newP.constructor = subClass);
        },

        /**
         * 用指定的context作为fn上下文，也就是this
         * @name bind
         * @grammar Util.bind(fn,context)  =>  fn
         */
        bind: function (fn, context) {
            return function () {
                return fn.apply(context, arguments);
            };
        },

        /**
         * 创建延迟delay执行的函数fn
         * @name defer
         * @grammar Util.defer(fn,delay)  =>fn   //延迟delay毫秒执行fn，返回fn
         * @grammar Util.defer(fn,delay,exclusion)  =>fn   //延迟delay毫秒执行fn，若exclusion为真，则互斥执行fn
         * @example
         * function test(){
     *     console.log("延迟输出！");
     * }
         * //非互斥延迟执行
         * var testDefer = Util.defer(test,1000);
         * testDefer();   =>  "延迟输出！";
         * testDefer();   =>  "延迟输出！";
         * //互斥延迟执行
         * var testDefer1 = Util.defer(test,1000,true);
         * testDefer1();   =>  //本次不执行
         * testDefer1();   =>  "延迟输出！";
         */
        defer: function (fn, delay, exclusion) {
            var timerID;
            return function () {
                if (exclusion) {
                    clearTimeout(timerID);
                }
                timerID = setTimeout(fn, delay);
            };
        },

        /**
         * 查找元素item在数组array中的索引, 若找不到返回-1
         * @name indexOf
         * @grammar Util.indexOf(array,item)  => index|-1  //默认从数组开头部开始搜索
         * @grammar Util.indexOf(array,item,start)  => index|-1  //start指定开始查找的位置
         */
        indexOf: function (array, item, start) {
            var index = -1;
            start = this.isNumber(start) ? start : 0;
            this.each(array, function (v, i) {
                if (i >= start && v === item) {
                    index = i;
                    return false;
                }
            });
            return index;
        },
        getDataSet : function(el){
            var dataset = {};
            try {
                if (el) {
                    if(typeof(el)=='Array' && el.length>0){
                        el = el[0];
                    }
                    var dataJson = el.dataset || {}; //get all dataset
                    var j = 0;
                    if (dataJson && dataJson.vid) {
                        for (j in dataJson) {
                            var k = j;
                            var v = dataJson[k] || '';
                            k = k.replace(/data-/, '');
                            dataset[k] = v;
                        }
                        return dataset;
                    } else {
                        var nodeMap = el.attributes || {}; //get all NamedNodeMap
                        dataset = {};
                        for (j in nodeMap) {
                            var attr = nodeMap[j] || '';
                            var k = attr.name;
                            var v = attr.value || '';
                            if (/data-/i.test(k)) {
                                k = k.replace(/data-/, '');
                                //console.log(k, v);
                                dataset[k] = v;
                            }
                        }
                    }
                }
            }catch(e){
                console.log(e)
            }
            return dataset;
        },
        /**
         * 移除数组array中的元素item
         * @name removeItem
         * @grammar Util.removeItem(array,item)
         */
        removeItem: function (array, item) {
            for (var i = 0, l = array.length; i < l; i++) {
                if (array[i] === item) {
                    array.splice(i, 1);
                    i--;
                }
            }
        },

        /**
         * 删除字符串str的首尾空格
         * @name trim
         * @grammar Util.trim(str) => String
         */
        trim: function (str) {
            return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
        },

        /**
         * 将字符串list(以','分隔)或者数组list转成哈希对象
         * @name listToMap
         * @grammar Util.listToMap(list)  => Object  //Object形如{test:1,br:1,textarea:1}
         */
        listToMap: function (list) {
            if (!list)return {};
            list = Util.isArray(list) ? list : list.split(',');
            for (var i = 0, ci, obj = {}; ci = list[i++];) {
                obj[ci.toUpperCase()] = obj[ci] = 1;
            }
            return obj;
        },

        /**
         * 将str中的html符号转义,默认将转义''&<">''四个字符，可自定义reg来确定需要转义的字符
         * @name unhtml
         * @grammar Util.unhtml(str);  => String
         * @grammar Util.unhtml(str,reg)  => String
         * @example
         * var html = '<body>You say:"你好！Baidu & UEditor!"</body>';
         * Util.unhtml(html);   ==>  &lt;body&gt;You say:&quot;你好！Baidu &amp; UEditor!&quot;&lt;/body&gt;
         * Util.unhtml(html,/[<>]/g)  ==>  &lt;body&gt;You say:"你好！Baidu & UEditor!"&lt;/body&gt;
         */
        unhtml: function (str, reg) {
            try{
                    return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|#10|#13);)?/g, function (a, b) {
                        if (b) {
                            return a;
                        } else {
                            return {
                                '<': '&lt;',
                                '&': '&amp;',
                                '"': '&quot;',
                                '>': '&gt;',
                                "'": '&#39;',
                                "\n":'&#10;',
                                "\r":'&#13;'
                            }[a]
                        }

                    }) : '';
                }catch(e){
                return str;
            }
        },
        /**
         * 将str中的转义字符还原成html字符
         * @name html
         * @grammar Util.html(str)  => String   //详细参见<code><a href = '#unhtml'>unhtml</a></code>
         */
        html: function (str) {
            try {
                return str ? str.replace(/&((g|l|quo)t|amp|#39|#10|#13);/g, function (m) {
                    return {
                        '&lt;': '<',
                        '&amp;': '&',
                        '&quot;': '"',
                        '&gt;': '>',
                        '&#39;': "'",
                        '&#10;': "<br>",
                        '&#13;': "<br>"
                    }[m]
                }) : '';
            }catch(e){
                return str;
            }
        },
        /**
         * 将css样式转换为驼峰的形式。如font-size => fontSize
         * @name cssStyleToDomStyle
         * @grammar Util.cssStyleToDomStyle(cssName)  => String
         */
        cssStyleToDomStyle: function () {
            var test = document.createElement('div').style,
                cache = {
                    'float': test.cssFloat != undefined ? 'cssFloat' : test.styleFloat != undefined ? 'styleFloat' : 'float'
                };

            return function (cssName) {
                return cache[cssName] || (cache[cssName] = cssName.toLowerCase().replace(/-./g, function (match) {
                    return match.charAt(1).toUpperCase();
                }));
            };
        }(),
        /**
         * 动态加载文件到doc中，并依据obj来设置属性，加载成功后执行回调函数fn
         * @name loadFile
         * @grammar Util.loadFile(doc,obj)
         * @grammar Util.loadFile(doc,obj,fn)
         * @example
         * //指定加载到当前document中一个script文件，加载成功后执行function
         * Util.loadFile( document, {
     *     src:"test.js",
     *     tag:"script",
     *     type:"text/javascript",
     *     defer:"defer"
     * }, function () {
     *     console.log('加载成功！')
     * });
         */
        loadFile: function () {
            var tmpList = [];

            function getItem(doc, obj) {
                try {
                    for (var i = 0, ci; ci = tmpList[i++];) {
                        if (ci.doc === doc && ci.url == (obj.src || obj.href)) {
                            return ci;
                        }
                    }
                } catch (e) {
                    return null;
                }

            }

            return function (doc, obj, fn) {
                var item = getItem(doc, obj);
                if (item) {
                    if (item.ready) {
                        fn && fn();
                    } else {
                        item.funs.push(fn)
                    }
                    return;
                }
                tmpList.push({
                    doc: doc,
                    url: obj.src || obj.href,
                    funs: [fn]
                });
                if (!doc.body) {
                    var html = [];
                    for (var p in obj) {
                        if (p == 'tag')continue;
                        html.push(p + '="' + obj[p] + '"')
                    }
                    doc.write('<' + obj.tag + ' ' + html.join(' ') + ' ></' + obj.tag + '>');
                    return;
                }
                if (obj.id && doc.getElementById(obj.id)) {
                    return;
                }
                var element = doc.createElement(obj.tag);
                delete obj.tag;
                for (var p in obj) {
                    element.setAttribute(p, obj[p]);
                }
                element.onload = element.onreadystatechange = function () {
                    if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                        item = getItem(doc, obj);
                        if (item.funs.length > 0) {
                            item.ready = 1;
                            for (var fi; fi = item.funs.pop();) {
                                fi();
                            }
                        }
                        element.onload = element.onreadystatechange = null;
                    }
                };
                element.onerror = function () {
                    throw Error('The load ' + (obj.href || obj.src) + ' fails,check the url settings of file config.js ')
                };
                doc.getElementsByTagName("head")[0].appendChild(element);
            }
        }(),
        /**
         * 判断obj对象是否为空
         * @name isEmptyObject
         * @grammar Util.isEmptyObject(obj)  => true|false
         * @example
         * Util.isEmptyObject({}) ==>true
         * Util.isEmptyObject([]) ==>true
         * Util.isEmptyObject("") ==>true
         */
        isEmptyObject: function (obj) {
            if (obj == null) return true;
            if (this.isArray(obj) || this.isString(obj)) return obj.length === 0;
            for (var key in obj) if (obj.hasOwnProperty(key)) return false;
            return true;
        },

        /**
         * 统一将颜色值使用16进制形式表示
         * @name fixColor
         * @grammar Util.fixColor(name,value) => value
         * @example
         * rgb(255,255,255)  => "#ffffff"
         */
        fixColor: function (name, value) {
            if (/color/i.test(name) && /rgba?/.test(value)) {
                var array = value.split(",");
                if (array.length > 3)
                    return "";
                value = "#";
                for (var i = 0, color; color = array[i++];) {
                    color = parseInt(color.replace(/[^\d]/gi, ''), 10).toString(16);
                    value += color.length == 1 ? "0" + color : color;
                }
                value = value.toUpperCase();
            }
            return  value;
        },

        /**
         * 深度克隆对象，从source到target
         * @name clone
         * @grammar Util.clone(source) => anthorObj 新的对象是完整的source的副本
         * @grammar Util.clone(source,target) => target包含了source的所有内容，重名会覆盖
         */
        clone: function (source, target) {
            var tmp;
            target = target || {};
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    tmp = source[i];
                    if (typeof tmp == 'object') {
                        target[i] = Util.isArray(tmp) ? [] : {};
                        Util.clone(source[i], target[i])
                    } else {
                        target[i] = tmp;
                    }
                }
            }
            return target;
        },
        /**
         * 转换cm/pt到px
         * @name transUnitToPx
         * @grammar Util.transUnitToPx('20pt') => '27px'
         * @grammar Util.transUnitToPx('0pt') => '0'
         */
        transUnitToPx: function (val) {
            if (!/(pt|cm)/.test(val)) {
                return val
            }
            var unit;
            val.replace(/([\d.]+)(\w+)/, function (str, v, u) {
                val = v;
                unit = u;
            });
            switch (unit) {
                case 'cm':
                    val = parseFloat(val) * 25;
                    break;
                case 'pt':
                    val = Math.round(parseFloat(val) * 96 / 72);
            }
            return val + (val ? 'px' : '');
        },
        /**
         * 动态添加css样式
         * @name cssRule
         * @grammar Util.cssRule('添加的样式的节点名称',['样式'，'放到哪个document上'])
         * @grammar Util.cssRule('body','body{background:#ccc}') => null  //给body添加背景颜色
         * @grammar Util.cssRule('body') =>样式的字符串  //取得key值为body的样式的内容,如果没有找到key值先关的样式将返回空，例如刚才那个背景颜色，将返回 body{background:#ccc}
         * @grammar Util.cssRule('body','') =>null //清空给定的key值的背景颜色
         */
        cssRule: function (key, style, doc) {
            doc = doc || document;
            var head = doc.getElementsByTagName('head')[0], node;
            if (!(node = doc.getElementById(key))) {
                if (style === undefined) {
                    return ''
                }
                node = doc.createElement('style');
                node.id = key;
                head.appendChild(node)
            }
            if (style === undefined) {
                return node.innerHTML
            }
            if (style !== '') {
                node.innerHTML = style;
            } else {
                head.removeChild(node)
            }
        }
    };
    /**
     * 判断str是否为字符串
     * @name isString
     * @grammar Util.isString(str) => true|false
     */
    /**
     * 判断array是否为数组
     * @name isArray
     * @grammar Util.isArray(obj) => true|false
     */
    /**
     * 判断obj对象是否为方法
     * @name isFunction
     * @grammar Util.isFunction(obj)  => true|false
     */
    /**
     * 判断obj对象是否为数字
     * @name isNumber
     * @grammar Util.isNumber(obj)  => true|false
     */
    Util.each(['String', 'Function', 'Array', 'Number', 'RegExp', 'Object'], function (v) {
        Util['is' + v] = function (obj) {
            return Object.prototype.toString.apply(obj) == '[object ' + v + ']';
        }
    });

    String.prototype.replaceAll = function (s1, s2) {

        return this.replace(new RegExp(s1, 'gm'), s2); //g全局
    };

//如果浏览器不支持String原生trim的方法，模拟一个
    if (!String.prototype.hasOwnProperty('trim')) {
        String.prototype.trim = function () {
            return this.replace(/^(\s|\r|\n|\r\n)*|(\s|\r|\n|\r\n)*$/g, '');
        };
    }

//如果浏览器不支持Function原生bind的方法，模拟一个
    if (!Function.prototype.hasOwnProperty('bind')) {
        Function.prototype.bind = function (context) {
            var fn = this,
                args = arguments.length > 1 ? Array.slice(arguments, 1) : null;
            return function () {
                return fn.apply(context || this, args);
            };
        };
    }
    /**
     * 自定义events
     * @constructor
     */
    var Events = function () { };

    /**
     * 获得对象所拥有监听类型的所有监听器
     * @public
     * @function
     * @param {Object} obj  查询监听器的对象
     * @param {String} type 事件类型
     * @param {Boolean} force  为true且当前所有type类型的侦听器不存在时，创建一个空监听器数组
     * @returns {Array} 监听器数组
     */
    var addListener = Util.getListener = function (obj, type, force) {
        var allListeners;
        obj =obj||Util.Events||{};
        type = type && type.toLowerCase() ||'';
        return ( ( allListeners = ( obj.__allListeners || force && ( obj.__allListeners = {} ) ) )
            && ( allListeners[type] || force && ( allListeners[type] = [] ) ) );
    };

    Events.prototype = {
        /**
         * 注册事件监听器
         * @name addListener
         * @grammar Util.Events.addListener(types,fn)  //types为事件名称，多个可用空格分隔
         * @example
         * Util.Events.addListener('selectionchange',function(){
     *      console.log("选区已经变化！");
     * })
         * Util.Events.addListener('beforegetcontent aftergetcontent',function(type){
     *         if(type == 'beforegetcontent'){
     *             //do something
     *         }else{
     *             //do something
     *         }
     *         console.log(this.getContent) // this是注册的事件的编辑器实例
     * })
         */
        addListener: function (types, listener) {
            types = Util.trim(types).split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                console.log(typeof(this),this);
                debugger
                addListener(this, ti, true).push(listener);
            }
        },
        /**
         * 移除事件监听器
         * @name removeListener
         * @grammar Util.Events.removeListener(types,fn)  //types为事件名称，多个可用空格分隔
         * @example
         * //changeCallback为方法体
         * Util.Events.removeListener("selectionchange",changeCallback);
         */
        removeListener: function (types, listener) {
            types = Util.trim(types).split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                Util.removeItem(addListener(this, ti) || [], listener);
            }
        },
        /**
         * 触发事件
         * @name fireEvent
         * @grammar Util.Events.fireEvent(types)  //types为事件名称，多个可用空格分隔
         * @example
         * Util.Events.fireEvent("selectionchange");
         */
        fireEvent: function () {
            var types = arguments[0];
            types = Util.trim(types).split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                var listeners = addListener(this, ti),
                    r, t, k;
                if (listeners) {
                    k = listeners.length;
                    while (k--) {
                        if (!listeners[k])continue;
                        t = listeners[k].apply(this, arguments);
                        if (t === true) {
                            return t;
                        }
                        if (t !== undefined) {
                            r = t;
                        }
                    }
                }
                if (t = this['on' + ti.toLowerCase()]) {
                    r = t.apply(this, arguments);
                }
            }
            return r;
        }
    };
    //监听器
    Util.Events = new  Events();


    global.Util = Util;
    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/util',function(require, exports, module) {
            module.exports = Util;
        })
    }
}(window));