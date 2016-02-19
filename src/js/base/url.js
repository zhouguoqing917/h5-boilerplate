/**
 *   @description: 该文件用于定义url工具类
 **/

(function(global){
    'use strict';

    var URL = {
        URLGlobalParms: {},
        getQueryString: function(name) {
            var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            if (r !== null) {
                return unescape(r[2]);
            }
            return "";
        },
        /**
         * @memberOf URL
         * @summary 将url中的参数转换为json数据对象键值对形式的对象
         * @type {function}
         * @param {string} queryString              - 可选参数, 如果不指定url，则默认从当前页面url中获取参数
         * @return {object}
         */
        getQueryData: function (queryString) {

            /* 去掉字符串前面的"?"，并把&amp;转换为& */
            queryString = queryString.replace(/^\?+/, '').replace(/&amp;/, '&');
            var querys = queryString.split('&'),
                i = 0,
                _URLParms = {},
                item;

            while (i < querys.length) {
                item = querys[i].split('=');
                
                if (item[0]) {
                    var value = item[1] || '';
                    
                    try {
                        value = decodeURIComponent(value);
                    
                    } catch (e) {
                        value = unescape(value);
                    }
                    value = (value === 'null') ? null : value;
                    _URLParms[decodeURIComponent(item[0])] = value;
                }
                i++;
            }
            
            return _URLParms;
        },

        /**
         * @memberOf URL
         * @summary 获取当前页面连接中指定参数
         * @type {function}
         * @param {string} param1                     - 如果param2为undefined，param1是指从当前页面url中获取指定参数的key, 如果param2不为空，param1为指定的url
         * @param {string} param2                     - 可选参数，如果param2存在，则从指定的param1连接中获取对应参数的key
         * @return {string|null}
         */
        getParam: function (param1, param2) {
            var reg, url;
            if (typeof param2 === 'undefined') {
                url =  window.location.href;
                reg = new RegExp('(^|&?)' + param1 + '=([^&]*)(&|$)', 'i');

            } else {
                url = param1;
                reg = new RegExp('(^|&?)' + param2 + '=([^&]*)(&|$)', 'i');
            }
            var rstArr = url.match(reg);
            
            if (rstArr !== null) {
                
                return decodeURIComponent(rstArr[2]);
            }
            
            return null;
        },



        /**
         * @memberOf URL
         * @summary 参数对象转为url QueryString字符串
         * @type {function}
         * @param {dom} el                          - 设置这个DOM对象的url
         * @return {string}
         */
        objToQueryString: function (obj) {
            var result = [],
                key, value;

            for (key in obj) {
                value = obj[key];
                var clz = Object.prototype.toString.call(value);

                if (clz === '[object Array]') {
                    result.push(key + '=' + JSON.stringify(value));

                } else if (clz === '[object Object]') {
                    result.push(key + '=' + JSON.stringify(value));

                } else {
                    result.push(key + '=' + encodeURIComponent('undefined' === typeof value ? '' : value));
                }
            }
            return result.join('&');
        },



        /**
         * @memberOf URL
         * @summary 向指定url中添加参数
         * @type {function}
         * @param {string} url                      - 指定url链接
         * @param {string} key                      - 参数的键
         * @param {string} value                    - 参数的值
         * @return {string}
         */
        setParam: function (url, name, val) {
            try {

                if (typeof url !== 'undefined' && typeof name !== 'undefined' && typeof val !== 'undefined') {

                    if (url.indexOf('?') === -1) {
                        url += '?' + name + '=' + val;

                    } else {
                        var urlParamArr = url.split('?');
                        var pStr = urlParamArr[1];
                        var pArr = pStr.split('&') ||[];
                        var findFlag = false;
                        for(var i=0;i<pArr.length;i++){
                            var index =i;
                            var item = pArr[i] ||{};
                            var paramArr = item.split('=');

                            if (name === paramArr[0]) {
                                findFlag = true;
                                pArr[index] = name + '=' + val;

                                return false;
                            }
                        }

                        if (!findFlag) {
                            url += '&' + name + '=' + val;
                        
                        } else {
                            url = urlParamArr[0] + '?' + pArr.join('&');
                        }
                    }
                }

            } catch (e) {
                console.log(e);
            }

            return url;
        },

        /**
         * @memberOf URL
         * @summary 向指定url中添加多个参数
         * @type {function}
         * @param {string} url                      - 指定url链接
         * @param {string|object} param             - 为string时,param表示key，param2标志value; object时，忽略param2，将对象中所有属性添加到url中
         * @param {string} param2                   - 当param为string时生效，标志value
         * @return {string}
         */
        setParams: function (url, param, param2) {
            //只添加1个参数
            if (typeof param === 'string' && typeof param2 !== 'undefined') {

                return this.setParam(url, param, param2);
                //添加多个参数
            } else if (typeof param === 'object') {

                for (var i in param) {
                    url = this.setParam(url, i, param[i]);
                }

                return url;

            } else {

                return url;
            }
        },
        init: function () {
            URL.URLGlobalParms = URL.getQueryData(location.search.substring(1)) ;
            return URL.URLGlobalParms;
        }
    };

    URL.init();

    global.QueryURL = URL;

}(window));