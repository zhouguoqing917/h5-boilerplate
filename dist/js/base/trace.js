/*   
 *   @description: 
 *   @version    : 1.0.0
 *   @created-by : guoqingzhou
 *   @create-date: 15/12/28
 *   @update-log :
 *   15/12/28  guoqingzhou  xx
 *
 *
 */
(function(global,$) {

    var vars = global.VARS;
    var Trace={};

    var sUserAgent = window.navigator.userAgent;
    Trace.sysOS = function() {
            if (vars.IsIOS) return 'ios';
            if (vars.IsAndroid) return 'android';

            var isWin = (navigator.platform == "Win32") || (navigator.platform == "Win64") || (navigator.platform == "Windows");
            var isMac = (navigator.platform == "Mac68K") || (navigator.platform == "MacPC") || (navigator.platform == "Macintosh") || (navigator.platform == "MacIntel");
            if (isMac) return "Mac";
            var isUnix = (navigator.platform == "X11") && !isWin && !isMac;
            if (isUnix) return "Unix";
            var isLinux = (String(navigator.platform).indexOf("Linux") > -1);
            if (isLinux) return "Linux";
            if (isWin) {
                var isWin2K = sUserAgent.indexOf("Windows NT 5.0") > -1 || sUserAgent.indexOf("Windows 2000") > -1;
                if (isWin2K) return "Win2000";
                var isWinXP = sUserAgent.indexOf("Windows NT 5.1") > -1 || sUserAgent.indexOf("Windows XP") > -1;
                if (isWinXP) return "WinXP";
                var isWin2003 = sUserAgent.indexOf("Windows NT 5.2") > -1 || sUserAgent.indexOf("Windows 2003") > -1;
                if (isWin2003) return "Win2003";
                var isWinVista = sUserAgent.indexOf("Windows NT 6.0") > -1 || sUserAgent.indexOf("Windows Vista") > -1;
                if (isWinVista) return "WinVista";
                var isWin7 = sUserAgent.indexOf("Windows NT 6.1") > -1 || sUserAgent.indexOf("Windows 7") > -1;
                if (isWin7) return "Win7";
                var isWin8 = sUserAgent.indexOf("Windows NT 6.2") > -1 || sUserAgent.indexOf("Windows 8") > -1;
                if (isWin8) return "Win8";
            }
            if (vars.IsWindows) return 'windows';
            return "other";
        };

    Trace.sysPlatform = function() {
            if (vars.IsIOS) {
                if (vars.IsIPad) {
                    return 'ipad';
                } else {
                    return 'iphone';
                }

            } else if (vars.IsAndroid) {
                if (vars.IsAndroidPad) {
                    return 'androidpad';
                } else {
                    return 'android';
                }

            } else if (vars.IsWindowsPhone) {
                return 'windowsphone';

            } else if (vars.IsWindows) {
                var isWin = (navigator.platform == "Win32") || (navigator.platform == "Windows");
                var plat64 = sUserAgent.indexOf("WOW64") > -1 || sUserAgent.indexOf("Win64") > -1;
                if (isWin && plat64) {
                    return "Win64";
                } else {
                    return "Win32";
                }

            } else {
                return navigator.platform;
            }

        };


    /**
     * @memberof Util
     * @summary 发送统计数据;
     * @type {function}
     * @param {string} url                      - 发送统计的url的链接地址
     * @param {number|string} time              - 可选参数,是广告发统计用的,只是调试用到
     * @param {function} callback          - 可选参数,回调函数
     */
    Trace.imgPingback= function (url,time,callback) {
        var arguLen = arguments.length;
        if(!arguLen ||(arguLen===1 && typeof(arguments[0])!=='string')){
            return;
        }
        url = arguments[0];
        if(arguLen===2){
            if(typeof(arguments[1])==='function'){
                callback = arguments[1];
            }else{
                time = arguments[1];
            }
        }else if(arguLen===3){
            time = arguments[1];
            callback = arguments[2];
        }

        var pingbackURLs = url.split('|'),
            images = [],
            i = 0,
            l = pingbackURLs.length;

        (function sendPingBack(n) {
            images[n] = new Image();
            images[n].onabort = images[n].onerror = images[n].onload = function() {
                if (vars.ENABLE_DEBUG && time !== undefined) {
                    vars.ADPingbackCount++;
                    console.log('第' + vars.ADPingbackCount + '个上报,第' + time + '秒:', pingbackURLs[i]);
                }
                if (++n >= l) {
                    callback && typeof(callback) == 'function' && callback();
                } else {
                    sendPingBack(n);
                }
            };
            images[n].src = pingbackURLs[n];
        })(i);

    };

    Trace.pingback= function(el, position, details, callback) {
        position = position || (el && el.attr('position')) || '';
        var pageData = window['pageData'] || {};
        var params = {};
        var _href = location.href || 'http://m.tv.sohu.com/';
        details = details || (el && el.attr('details')) || {};

        try {
            params = {
                't': +new Date,
                'op': 'click',
                'details': JSON.stringify(details),
                'url': encodeURIComponent(_href),
                'refer': encodeURIComponent(document.referrer || ""),
                'screen': vars.ScreenSize,
                'os':Trace.sysOS(),
                'platform': Trace.sysPlatform()
            };

        } catch (e) {
            console.log('trace click exception ', e);
        }

        Trace.imgPingback('/pv.gif?' + $.param(params),callback);
    } ;

    global.Trace = Trace;

    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/trace',function(require, exports, module) {
            module.exports = Trace;
        })
    }


}(window));
