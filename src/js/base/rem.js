/*
 *   @description: 设置rem字体
 *   @version    : 1.0.0
 *   @created-by : guoqingzhou
 *   @create-date: 16/5/10
 *
 */
!function(win) {
    window.svp = window.svp || {};
    var doc = window.document;
    var docEl  = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var dpr = 1 ;// 物理像素与逻辑像素的对应关系
    var scale = 1;// css 像素缩放比率
    var maxRem = 62;
    var tid = null;
    // 初始化数据
    var designWidth = docEl.getAttribute('data-design') || 750; // psd设计稿宽度
    if (win.devicePixelRatio >= 3) {
        dpr = 3;
    } else if (win.devicePixelRatio === 2) {
        dpr = 2;
    }
    scale =(1/dpr).toFixed(1);

    function setViewport() {
        if (metaEl) {
            metaEl.setAttribute('content', 'width=device-width, initial-scale=' + scale + ', minimum-scale=' + scale +
                ', maximum-scale=' + scale + ', user-scalable=no');
        }
    }

    // 设置 rem 的基准像素
    function setRem() {
        var width = docEl.getBoundingClientRect().width; //viewportWidth
        var rem = ( width / designWidth *100).toFixed(4);
        rem = rem < 0.08 ? 0.08 : rem;
        rem = rem > 100 ? 100 : rem;
        console.log("html fontSize: ",rem);
        docEl.style.fontSize = rem + 'px';
        svp.rem = rem;
    }

    var _evt = 'onorientationchange' in window ? 'orientationchange' : 'resize';

    window.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(setRem, 300);
        }
    }, false);

    window.addEventListener(_evt, function() {
        clearTimeout(tid);
        tid = setTimeout(setRem, 300);
    }, false);

    setRem(); //设置rem字体

    svp.setRem = setRem;
    svp.setViewport=setViewport;
    svp.scale=scale;
    svp.dpr = dpr;
    svp.rem = svp.rem || maxRem;

    docEl.setAttribute('data-dpr', dpr);
    docEl.setAttribute('data-scale', scale);
    docEl.setAttribute('data-design',designWidth);

    svp.rem2px = function(d) {
        var val = parseFloat(d) * svp.rem;
        if (typeof d === 'string' && d.match(/rem$/)) {
            val += 'px';
        }
        return val;
    };

    svp.px2rem = function(d) {
        var val = parseFloat(d) / svp.rem;
        if (typeof d === 'string' && d.match(/px$/)) {
            val += 'rem';
        }
        return val;
    }

}(window);