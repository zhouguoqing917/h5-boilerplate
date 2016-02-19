/**
 *
 *   @description: 焦点图
 *
 **/
(function(global,$){

    'use strict';

    var focus = {
        param: {
            //焦点列表的class
            listClass: 'js_focusList',
            //焦点位置class
            locationClass: 'js_focusLocation',
            //当前展示焦点图class
            showClass: 'js_focusShow',
            //当前展示焦点图位置class
            showLocationClass: 'current',
            //第一个内容的克隆对象class
            firstCloneClass: 'js_firstClone',
            //最后一个内容的克隆对象class
            lastCloneClass: 'js_lastClone',
            //当横向移动距离超过该距离时才进行滚动内容
            minMoveDist: 40,
            //动画时间
            animateTime: 200,
            //自动滚动间隔时间
            autoScrollTime: 5000
        },
        model: {
            //触摸起始点x坐标
            startX: 0,
            //触摸起始点y坐标
            startY: 0,
            //触摸移动点x坐标
            moveX: 0,
            //横向滚动标志位
            moveFlag: true,
            //滚动锁
            moveLock: false,
            //listClass的margin-left
            listMarginLeft: 0,
            //是否是移动设备
            isMobile: true,
            //自动滚动计时器
            autoInterval: null,
            //是否处于拖拽状态，pc浏览器时才用
            pcDragFlag: false
        },
        view: {},
        ctrl: {}
    };

    var p = focus.param,
        m = focus.model,
    // v = focus.view,
        c = focus.ctrl;
    //========================== 参数层 ==========================
    //参数判断和初始化
    p.init = function () {

        if ($('.' + p.listClass).length === 0 || $('.' + p.listClass + ' a').length === 0) {

            return false;
        }

        return true;
    };
    //========================== 模型层 ==========================
    //模型初始化
    m.init = function () {
        //初始化移动设备标志位
        // m.isMobile = ("createTouch" in document);
        m.isMobile = 'ontouchstart' in window;
    };

    //获取单个焦点内容宽度
    m.getItemWidth = function () {
        var aTags = $('.' + p.listClass + ' li');

        if (aTags.length > 1) {
            return (aTags[1].offsetLeft - aTags[0].offsetLeft);

        } else {

            return $(aTags[0]).width();
        }
    };

    //获取焦点图内容宽度
    m.getFocusListWidth = function () {
        var focusListWidth = -1;
        //获取所有内容a标签
        var aTags = $('.' + p.listClass + ' a');
        //获取内容长度
        var counts = aTags.length;
        //如果有内容存在,以第一个内容宽度为标准,乘以总个数
        if (counts > 0) {
            var aTag = $(aTags[0]);
            focusListWidth = aTag.width() * counts;
        }

        return focusListWidth;
    };

    //是否有位置标签b
    m.isHashLocationTags = function () {
        //获取所有位置b标签
        var Tags = $('.' + p.locationClass + ' li');

        return (Tags.length > 0);
    };

    //========================== 视图层 ==========================
    //========================== 控制层 ==========================
    //业务初始化
    c.init = function () {
        //参数检查和初始化
        if (p.init()) {
            //模型参数初始化
            m.init();
            //焦点标志位初始化
            c.focusInit();
            //添加克隆元素
            c.addCloneTag();
            //事件初始化
            c.eventInit();
            //启动自动滚动
            c.startAutoScroll();
            //如果内容不存在直接隐藏该容器
        } else {
            $('.' + p.listClass).hide();
        }
    };

    //自动滚动
    c.startAutoScroll = function () {
        //启动自动滚动业务
        m.autoInterval = setInterval(function () {
            c.showFocusByType('next');
        }, p.autoScrollTime);
    };

    //焦点初始化
    c.focusInit = function () {
        //获取所有内容a标签
        var contentTags = $('.' + p.listClass + ' li');
        //移除所有焦点显示标志位class
        contentTags.removeClass(p.showClass);
        //获取第一个内容标签
        var firstATag = $(contentTags[0]);
        //添加焦点显示标志位class
        firstATag.addClass(p.showClass);
        //查看是否有位置标签
        if (m.isHashLocationTags()) {
            //获取所有的标签
            var indexTags = $('.' + p.locationClass + ' li');
            //移除所有的焦点位置class
            indexTags.removeClass('current');
            //获取第一个内容对应的b标签(底部位置标签)
            var firstBTag = $(indexTags[0]);
            //添加新的焦点位置class
            firstBTag.addClass('current');
        }
    };

    //事件初始化
    c.eventInit = function () {
        var cp = c.process;

        var start, move, end;
        //根据浏览器判断对应的事件类型
        start = m.isMobile ? 'touchstart' : 'mousedown';
        move = m.isMobile ? 'touchmove' : 'mousemove';
        end = m.isMobile ? 'touchend' : 'mouseleave click';
        //焦点图触摸开始事件
        $('.' + p.listClass).on(start, function (event) {
            cp.proStart(event);
        });

        //焦点图触摸移动事件
        $('.' + p.listClass).on(move, function (event) {

            if (!m.moveLock) {
                cp.proMove(event);
            }
        });

        //焦点图触摸结束事件
        $('.' + p.listClass).on(end, function (event) {
            cp.proEnd(event);

            return false;
        });
    };

    //移动到指定索引部分
    c.moveByIndex = function (index, fn) {
        var cbFn = (typeof fn === 'function') ? fn : function () {};
        //获取变动位置距离
        var changeDist = index * m.getItemWidth() * (-1);
        //横向同步移动
        $('.' + p.listClass).animate({'margin-left': changeDist + 'px'}, p.animateTime, '', cbFn);
    };

    //展示上一个/下一个焦点内容
    c.showFocusByType = function (type) {    //修改标志位
        //检查是否有滚动锁
        if (!m.moveLock) {
            //添加滚动锁
            m.moveLock = true;
            //当前焦点a标签
            var curTag = $('.' + p.showClass);
            //根据类型获取目标内容dom节点(a标签)
            var distDom = (type === 'next') ? curTag.next() : curTag.prev();

            if (m.moveFlag) {
                //目标焦点内容索引
                var index;
                //获取所有的内容标签
                var contentTags = $('.' + p.listClass + ' li');
                //获取所有的位置标签
                var indexTags = $('.' + p.locationClass + ' li');
                //移除之前的焦点标志class
                contentTags.removeClass(p.showClass);
                //移除只有的位置标志class
                indexTags.removeClass(p.showLocationClass);
                //获取目标dom索引
                index = distDom.index();
                //循环滚动临界状态
                if (distDom.hasClass(p.firstCloneClass) || distDom.hasClass(p.lastCloneClass)) {
                    //不同临界值的各种属性
                    var marginLeft, focusIndex, locationIndex;
                    //如果是在最尾端
                    if (type === 'next') {
                        focusIndex = 1;
                        locationIndex = 0;
                        marginLeft = m.getItemWidth() * (-1) + 'px';
                        //如果是在最首端
                    } else {
                        focusIndex = contentTags.length - 2;
                        locationIndex = indexTags.length - 1;
                        marginLeft = m.getItemWidth() * (-1) * focusIndex + 'px';
                    }
                    //移动内容
                    c.moveByIndex(index, function () {
                        //解除滚动锁
                        m.moveLock = false;
                        $(this).css({'margin-left': marginLeft});
                        //添加新的焦点标志位
                        $(contentTags[focusIndex]).addClass(p.showClass);
                        //添加新的焦点位置标志位
                        $(indexTags[locationIndex]).addClass(p.showLocationClass);
                    });

                } else {
                    //移动内容
                    c.moveByIndex(index, function () {
                        //动画完成,解除滚动锁
                        m.moveLock = false;
                    });
                    //添加新的焦点标志位
                    distDom.addClass(p.showClass);
                    //添加新的焦点位置标志位
                    $(indexTags[index - 1]).addClass(p.showLocationClass);
                }
                //还原为有效焦点内容
            } else {
                //移动内容
                c.moveByIndex(curTag.index(), function () {
                    //动画完成,解除滚动锁
                    m.moveLock = false;
                });
            }
        }
    };

    //添加克隆元素
    c.addCloneTag = function () {
        //获取列表容器tag
        var listTag = $('.' + p.listClass);
        //获取所有内容a标签
        var contentTags = listTag.find('li');
        //对首元素进行克隆
        var firstCloneTag = $(contentTags[0]).clone();
        //添加指定class
        firstCloneTag.addClass(p.firstCloneClass);
        //对莫元素进行克隆
        var lastCloneTag = $(contentTags[contentTags.length - 1]).clone();
        //添加指定class
        lastCloneTag.addClass(p.lastCloneClass);
        //将首元素的克隆元素未添加到最末端
        listTag.append(firstCloneTag);
        //将末元素的克隆元素未添加到最前端
        listTag.prepend(lastCloneTag);
        //计算新的margin-left
        var marginLeft = m.getItemWidth() * -(1) + 'px';
        //设置margin-left
        listTag.css({'margin-left': marginLeft});
    };

    //事件处理
    c.process = {};

    //触摸开始
    c.process.proStart = function (e) {

        if (!m.isMobile && m.moveLock) {

            return;
        }
        //记录触摸起始点的x y坐标
        m.startX = m.isMobile ? e.touches[0].pageX : e.clientX;
        m.startY = m.isMobile ? e.touches[0].pageY : e.clientY;
        //记录当前的margin-left
        m.listMarginLeft = parseInt($('.' + p.listClass).css('margin-left').split('px')[0], 10);
        //取消自动滚动
        clearInterval(m.autoInterval);
        //如果当前是pc浏览器
        if (!m.isMobile) {
            m.pcDragFlag = true;
        }
    };

    //触摸移动
    c.process.proMove = function (e) {
        //如果当前浏览器为pc浏览器
        if (!m.isMobile) {
            //如果未处于拖拽状态，或者是滚动锁状态
            if (!m.pcDragFlag || m.moveLock) {

                return;
            }
        }
        //获取触摸移动时的x y坐标
        var moveX = m.isMobile ? e.touches[0].pageX : e.clientX,
            moveY = m.isMobile ? e.touches[0].pageY : e.clientY;
        var xDist, yDist;
        //向右移动水平距离
        xDist = (moveX > m.startX) ? (moveX - m.startX) : (m.startX - moveX);
        //向上移动垂直距离
        yDist = (moveY < m.startY) ? (m.startY - moveY) : (moveY - m.startY);

        //水平移动
        if (xDist > yDist) {
            //如果是水平移动，则阻止默认事件
            e.preventDefault();
            e.stopPropagation();
            //触摸移动点x坐标缓存
            m.moveX = moveX;
            //当前焦点的横向偏移量
            var changeDist = m.listMarginLeft + (moveX - m.startX);
            //横向同步移动
            $('.' + p.listClass).css({'margin-left': changeDist + 'px'});
        }
    };

    //触摸结束
    c.process.proEnd = function (e) {
        //如果当前是pc浏览器
        if (!m.isMobile) {
            //获取pc下拖拽后的鼠标x坐标
            m.moveX = e.clientX;

            if (m.pcDragFlag) {
                m.pcDragFlag = false;

            } else {

                return;
            }
        }

        //点击处理,cover click
        if ((m.isMobile && m.moveX === 0) ||
            (!m.isMobile && m.startX === m.moveX)) {
            window.location.href = $('.' + p.showClass + ' a').attr('href');
            return;
        }
        //向左移动,下一个
        if (m.moveX > m.startX) {
            //如果移动距离过短,则不进行翻页
            if ((m.moveX - m.startX) < p.minMoveDist) {
                m.moveFlag = false;
            }
            c.showFocusByType('prev');
            //向右移动,上一个
        } else {
            //如果移动距离过短,则不进行翻页
            if ((m.startX - m.moveX) < p.minMoveDist) {
                m.moveFlag = false;
            }
            c.showFocusByType('next');
        }
        //重置移动标志位
        m.moveFlag = true;
        m.moveX = 0;
        //开启自动滚动
        c.startAutoScroll();
    };

    focus.init = function(){
        $(document).ready(function () {
            focus.ctrl.init();
        });
    };
    global.Focus = focus;

}(window,window.jQuery||window.zepto));

