/**
 *
 *   @description: 该文件用于给VARS扩展设备/平台判断的相关参数和部分方法扩展
 *
 *   @version    : 1.0.4
 *
 *   @create-date: 2015-02-20
 *
 *   @update-date: 2015-12-01
 *
 *   @update-log :
 *                 1.0.1 - VARS扩展设备、平台判断的相关参数和部分方法扩展
 *                 1.0.2 - 新增note3判断参数IsSAMSUNGNote3
 *                         新增IsBaiduBoxApp、IsOldBaiduBrowser和IsNewUCBrowser参数
 *                 1.0.3 - 新增SVP_URL参数
 *                         新增IsSoGouBrowser参数
 *                 1.0.4 - 新增VSTAR_API_URL、VSTAR_PXY_URL、VSTAR_PXY_TEST_URL、VSTAR_MAIN_PATH、IsSohuVideoClient参数
 *
 **/
(function (global) {
  
  'use strict';

  var VARS = {};
  //settings
  VARS.API_KEY = 'f351515304020cad28c92f70f002261c';
  VARS.API_TOKEN = '';
  VARS.API_PRI_URL = 'http://test.com/'; //http://101.200.197.106:8080;
  VARS.API_PRI_URL_TEST = 'http://my.test.com/';
  VARS.PAGE_PATH = '/';
  VARS.DEBUG = false;
  VARS.IsAutoTrace = true;

  if(/my\.test\.com/i.test(location.href)){
    VARS.DEBUG = true;
  }

  VARS.UA = window.navigator.userAgent;

  VARS.IsTouch = 'ontouchstart' in window;
  //获取设备密度
  var getDevicePixelRatio = function () {
    var ratio = 1;
    
    try {
      
      if (window.screen.systemXDPI !== undefined && window.screen.logicalXDPI !== undefined && window.screen.systemXDPI > window.screen.logicalXDPI) {
        ratio = window.screen.systemXDPI / window.screen.logicalXDPI;
      
      } else if (window.devicePixelRatio !== undefined) {
        ratio = window.devicePixelRatio;
      
      } else {
        ratio = window.devicePixelRatio;
      }
      ratio = parseFloat(ratio) || 1;

    } catch (e) {}
    
    return ratio;
  };

  /**
   * @memberof VARS
   * @summary 设备屏幕象素密度
   * @type {number}
   */
  VARS.PixelRatio = getDevicePixelRatio();

  /**
   * @memberof VARS
   * @summary 是否是androd设备
   * @type {boolean}
   */
  // HTC Flyer平板的UA字符串中不包含Android关键词
  // 极速模式下视频不显示 UCWEB/2.0 (Linux; U; Adr 4.0.3; zh-CN; LG-E612) U2/1.0.0 UCBrowser/9.6.0.378 U2/1.0.0 Mobile
  VARS.IsAndroid = !!(/Android|HTC|Adr/i.test(VARS.UA)  || !!(window.navigator.platform + '').match(/Linux/i));
  
  /**
   * @memberof VARS
   * @summary 是否是ios pad
   * @type {boolean}
   */
  VARS.IsIpad = !VARS.IsAndroid && /iPad/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是ios pod
   * @type {boolean}
   */
  VARS.IsIpod = !VARS.IsAndroid && /iPod/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是是否是ios phone
   * @type {boolean}
   */
  VARS.IsIphone = !VARS.IsAndroid && /iPod|iPhone/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是ios设备
   * @type {boolean}
   */
  VARS.IsIOS = VARS.IsIpad || VARS.IsIphone;

  /**
   * @memberof VARS
   * @summary 是否是windows phone
   * @type {boolean}
   */
  VARS.IsWindowsPhone = /Windows Phone/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是老版本windows phone(8.1之前算) winphone 8.1之前算old(采用全屏播放),8.1(含)之后，采用的是标准播放(小窗+假全屏)
   * @type {boolean}
   */
  VARS.IsOldWindowsPhone = /Windows\sPhone\s([1234567]\.|8\.0)/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是新版本windows phone(8.1之前算) winphone 8.1之前算old(采用全屏播放),8.1(含)之后，采用的是标准播放(小窗+假全屏)
   * @type {boolean}
   */
  VARS.IsNewWindowsPhone = VARS.IsWindowsPhone && !VARS.IsOldWindowsPhone;

  /**
   * @memberof VARS
   * @summary 是否是windows pad
   * @type {boolean}
   */
  VARS.IsWindowsPad = /Windows\sPad/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是windows系统
   * @type {boolean}
   */
  VARS.IsWindows = /Windows/i.test(VARS.UA);

  /**
   * @memberof VARS
   * @summary 是否是vivo手机
   * @type {boolean}
   */
  VARS.IsVivoPhone = /vivo/i.test(VARS.UA);

  VARS.ScreenSizeCorrect = 1;
  
  if (VARS.IsAndroid) {
    
    if ((window['screen']['width'] / window['innerWidth']).toFixed(2) ===  VARS.PixelRatio.toFixed(2)) {
      VARS.ScreenSizeCorrect = 1 / VARS.PixelRatio;
    }
  }
  VARS.AdrPadRegex = /pad|XiaoMi\/MiPad|lepad|YOGA|MediaPad|GT-P|SM-T|GT-N5100|sch-i800|HUAWEI\s?[MTS]\d+-\w+|Nexus\s7|Nexus\s8|Nexus\s11|Kindle Fire HD|Tablet|tab/i;
  VARS.ScreenSize = Math.floor(window.screen['width'] * VARS.ScreenSizeCorrect) + 'x' + Math.floor(window.screen['height'] * VARS.ScreenSizeCorrect);
  //根据这些值就可以反向算出屏幕的物理尺寸 ,屏幕尺寸=屏幕对角线的像素值/（密度*160）
  //屏幕尺寸=Math.sqrt(Math.pow(width, 2)+Math.pow(height, 2))/ (密度*160)
  //判断是否为平板
  VARS.gpadJSON = {};
  
  var isGpad = function () {
    //安卓pad正则
    var padScreen = 1;
    var _IsAndroidPad = false;
    var _ratio = VARS.ScreenSizeCorrect || 1;
    //像素
    var sw = Math.floor(window.screen.width * _ratio);
    var sh = Math.floor(window.screen.height * _ratio);
    var inch = 1;
    
    try {
      //对角线长度大于
      padScreen = parseFloat(Math.sqrt(sw * sw + sh * sh));
      //尺寸
      inch = parseFloat(padScreen / (160 * VARS.PixelRatio));
    
    } catch (e) {}
    // 对角线长度大于1280 则为Pad
    if (!!('ontouchstart' in window) && VARS.IsAndroid) {
      var adrPad = !!(VARS.AdrPadRegex.test(VARS.UA));

      if (/mobile/i.test(VARS.UA) && !adrPad ) {
        _IsAndroidPad = false;

      } else {

        if (adrPad) {
          _IsAndroidPad = true;
        } else {
          // 对角线长度大于 2500 ,inch > 7.0  则为Pad
          if (!_IsAndroidPad && (padScreen >= 2500 || inch > 7.0)) {
            _IsAndroidPad = true;
          }
        }
      }
    }
    VARS.gpadJSON ={'width':sw,'height':sh,'PixelRatio':VARS.PixelRatio,' padScreen':padScreen,'inch':inch,'isGpad':_IsAndroidPad,'UA':VARS.UA};
    //alert(JSON.stringify(VARS.gpadJSON));
    return _IsAndroidPad;
  };

  /**
   * @memberof VARS
   * @summary 是否是androd pad
   * @type {boolean}
   */
  VARS.IsAndroidPad = isGpad();


  /**
   * @memberof VARS
   * @summary 是否是ie browser
   * @type {boolean}
   */
  VARS.IsIEBrowser = !!document.all && ((navigator.platform === 'Win32') || (navigator.platform === 'Win64') || (navigator.platform === 'Windows'));

  /**
   * @memberof VARS
   * @summary 是否是safari browser
   * @type {boolean}
   */
  VARS.IsSafariBrowser = !! (VARS.UA.match(/Safari/i) && !VARS.IsAndroid);

  /**
   * @memberof VARS
   * @summary 是否是chrome browser
   * @type {boolean}
   */
  VARS.IsChromeBrowser = !! (VARS.UA.match(/Chrome/i) && !VARS.IsAndroid);

  /**
   * @memberof VARS
   * @summary 是否是微信 webview
   * @type {boolean}
   */
  VARS.IsWeixinBrowser = !! (window['WeixinJSBridge'] || /MicroMessenger/i.test(VARS.UA));


  //导出接口
  global.VARS = VARS;


    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/vars',function(require, exports, module) {
            module.exports = VARS;
        })
    }

}(window));