
(function(win,doc) {
    WeixinJS = (typeof WeixinJS === 'undefined') ? {} : WeixinJS;
    function contentLoaded(win, fn) {
        var done = false, top = true,
            doc = win.document, root = doc.documentElement,
            add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
            rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
            pre = doc.addEventListener ? '' : 'on',
            init = function (e) {
                if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                if (!done && (done = true)) fn.call(win, e.type || e);
            },
            poll = function () {
                try { root.doScroll('left'); } catch (e) {  setTimeout(poll, 50); return; }
                init('poll');
            };

        if (doc.readyState == 'complete') {
            fn.call(win, 'lazy')
        } else {
            if (doc.createEventObject && root.doScroll) {
                try {  top = !win.frameElement;  } catch (e) { }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    }
    WeixinJS.contentLoaded=contentLoaded;
    WeixinJS.cfg = {
       appId : ''
    };
    window.videoMetaData = WeixinJS.videoMetaData = {};
    var getVideoMetaData = function () {
        var o = document.getElementsByTagName("meta");
        var rlt = {};
        for (var i = 0; i < o.length; i++) {
            var vn = o[i].getAttribute('name');
            var vp = o[i].getAttribute('property');
            var vl = o[i].getAttribute('content') || "";
            if (vn == null || vn == undefined || vn.length == 0) {
                vn = vp;
            }
            if (vn == null || vn == undefined || vn.length == 0) {
                continue;
            }
            rlt[vn] = vl;
        }
        window.videoMetaData = WeixinJS.videoMetaData = rlt;
        return rlt;
    };
    WeixinJS.UA = window.navigator.userAgent;
    WeixinJS.getVideoMetaData = window['getVideoMetaData'] = getVideoMetaData;
    WeixinJS.IsWeixin = !! (window['WeixinJSBridge'] || /MicroMessenger/i.test(WeixinJS.UA));
    WeixinJS.IsAndroid = !!(/Android|HTC|Adr/i.test(WeixinJS.UA)  || !!(window.navigator.platform + '').match(/Linux/i));
    WeixinJS.IsIpad = !WeixinJS.IsAndroid && /iPad/i.test(WeixinJS.UA);
    WeixinJS.IsIpod = !WeixinJS.IsAndroid && /iPod/i.test(WeixinJS.UA);
    WeixinJS.IsIphone = !WeixinJS.IsAndroid && /iPod|iPhone/i.test(WeixinJS.UA);
    WeixinJS.IsIOS = WeixinJS.IsIpad || WeixinJS.IsIphone;
    WeixinJS.dataForWeixin = {};
    WeixinJS.getData = function (data) {
        data = data|| {};
        videoMetaData = WeixinJS.getVideoMetaData();

        WeixinJS.dataForWeixin = {
            appId: WeixinJS.cfg.appId, //appid 设置空就好了,web id=25250114746637056375,微信app_id:wxb6c82517aa33d525
            MsgImg: data['image'] ||videoMetaData['og:image'] || "http://css.tv.itc.cn/global/images/nav1/logo.gif", //分享qq朋友时所带的图片路径
            TLImg:data['image']|| videoMetaData['og:image'] || "http://css.tv.itc.cn/global/images/nav1/logo.gif", //分享朋友圈时所带的图片路径
            url: data['url']||videoMetaData['og:url'] || encodeURIComponent(window.location.href), //分享附带链接地址
            imgWidth: data['width']||videoMetaData['og:imgWidth'] || "300", //图片宽度
            imgHeight: data['height']|| videoMetaData['og:imgHeight'] || "300", //图片高度
            title:data['title']|| videoMetaData['og:title'] || document.getElementsByTagName('title')[0].text.split(' ')[0] || "", //分享标题
            desc: data['description'] || data['content'] ||videoMetaData['description'] || document.getElementsByTagName('title')[0].text.split(' ')[0] || "", //分享内容介绍
            type: data['type']||videoMetaData['og:type'] || "",
            callback: data['callback'] || function(){}
        };
        return WeixinJS.dataForWeixin;
    };


    WeixinJS.onJSBridgeReady = function (data) {
        var dataForWeixin =  WeixinJS.getData(data);
        if (typeof dataForWeixin == 'undefined') return;

        var wxtitle = dataForWeixin.title.substr(0, 22);
        if (!(wxtitle.indexOf('搜狐视频') > -1)) {
            wxtitle += "-搜狐视频";
            dataForWeixin.title = wxtitle;
        }

        if (WeixinJS.IsWeixin && /tv\.sohu\.com/i.test(dataForWeixin.url)) {
            try {
                var _href = dataForWeixin.url;
                _href = _href.replace(/http:\/\/tv\.sohu\.com/i, 'http://wx.m.tv.sohu.com');
                _href = _href.replace(/http:\/\/my\.tv\.sohu\.com/i, 'http://wx.m.tv.sohu.com');
                dataForWeixin.url = _href;
            } catch (e) {
            }
        }

        WeixinJSBridge.on('menu:share:appmessage', function (argv) {
            // 发送给qq好友
            WeixinJSBridge.invoke('sendAppMessage', {
                "appid": dataForWeixin.appId,
                "img_url": dataForWeixin.MsgImg,
                "img_width": dataForWeixin.imgWidth,
                "img_height": dataForWeixin.imgHeight,
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function (res) {
                if (res.err_msg == "send_app_msg:ok") {
                    //发送给好友成功
                    console.log(res.err_msg);
                }
                (dataForWeixin.callback)();
            });
        });
        WeixinJSBridge.on('menu:share:timeline', function (argv) {
            // 分享到weixin朋友圈,oldshare
            (dataForWeixin.callback)(); //callback
            WeixinJSBridge.invoke('shareTimeline', {
                "img_url": dataForWeixin.TLImg,
                "img_width": dataForWeixin.imgWidth,
                "img_height": dataForWeixin.imgHeight,
                "link": dataForWeixin.url,
                "desc": dataForWeixin.desc,
                "title": dataForWeixin.title
            }, function (res) {
                if (res.err_msg == "share_timeline:ok") {
                    console.log(res.err_msg);
                }
            });
        });
        //weixinNewShare
        WeixinJSBridge.on("menu:general:share", function (argv) {
            var content = "#分享视频#" + dataForWeixin.title;
            if (WeixinJS.IsIOS) {
                content += dataForWeixin.url;
                dataForWeixin.desc = dataForWeixin.desc.substr(0, 29)
            }
           var opts= {
                "content": content,
                "title": dataForWeixin.title,
                "desc": dataForWeixin.desc,
                "img_url": dataForWeixin.TLImg,
                "img_width": dataForWeixin.imgWidth,
                "img_height": dataForWeixin.imgHeight,
                "link": dataForWeixin.url,
                "data_url": dataForWeixin.url
            };
            if(dataForWeixin &&  dataForWeixin.type) {
                opts.type = dataForWeixin.type;
            }
            console.log("menu:general:share",opts);
            argv.generalShare(opts, function (res) {
                WeixinJSBridge.log(res.err_msg);
            });
        });
    };

    WeixinJS.init = function (data) {
        if (!WeixinJS.IsWeixin) return;

        if (typeof(WeixinJS.onJSBridgeReady) != 'undefined') {
            WeixinJS.onJSBridgeReady(data);
        } else {
            setTimeout(function(){
                WeixinJS.init(data);
            }, 300);
        }
    };
    WeixinJS.contentLoaded(win,function(){
        var data = WeixinJS.getData();
        WeixinJS.init(data);
    });

    WeixinJS.chkJSB =function(data){
        var _this =this;
        WeixinJS.contentLoaded(window,function(){
            var dt = WeixinJS.getData(data);
            WeixinJS.init(dt);
        });
    };

    window.WeixinJS = WeixinJS;

    if (typeof define === "function") {
        //export
        define('base/weixin', function(require, exports, module) {
            //window.WeixinApi = WeixinJS;
            module.exports =  WeixinJS;
        });
    }

}(window,document ));


