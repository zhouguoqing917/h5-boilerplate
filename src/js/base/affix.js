/* ========================================================================
 *  affix.js v3.1.1 ;http://www.runoob.com/bootstrap/bootstrap-affix-plugin.html
  Affix 插件可以让一个<div>元素漂浮在网页上，你可以让该<div>元素随屏滚动，或者固定在指定位置上。
 用法： 你可以通过data属性或者通过JavaScript来使用Affix 插件。
 1、通过 dom data属性 你只需为需要监听的页面元素添加data-spy="affix"即可。然后使用偏移量来确定一个元素的开和关.
 2、通过js : $('#myAffix').affix({ offset: 20 })
 * ======================================================================== */


!function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options);
    this.$window = $(window)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this));

    this.$element     = $(element);
    this.affixed      = null;
    this.unpin        = null;
    this.pinnedOffset = null;

    this.checkPosition();
  }

  Affix.RESET = 'affix affix-top affix-bottom';

  Affix.DEFAULTS = {
    offset: 0
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$window.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return;

    var scrollHeight = $(document).height();
    var scrollTop    = this.$window.scrollTop();
    var position     = this.$element.offset();
    var offset       = this.options.offset;
    var offsetTop    = offset.top;
    var offsetBottom = offset.bottom;

    if (this.affixed == 'top') position.top += scrollTop;

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset;
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element);
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element);

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false;

    if (this.affixed === affix) return;
    if (this.unpin) this.$element.css('top', '');

    var affixType = 'affix' + (affix ? '-' + affix : '');
    var e         = $.Event(affixType + '.bs.affix');

    this.$element.trigger(e);

    if (e.isDefaultPrevented()) return;

    this.affixed = affix;
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null;

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')));

    if (affix == 'bottom') {
      this.$element.offset({ top: scrollHeight - offsetBottom - this.$element.height() });
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  var old = $.fn.affix;

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this);
      var data    = $this.data('bs.affix');
      var options = typeof option == 'object' && option;

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)));
      if (typeof option == 'string') data[option]();
    })
  }

  $.fn.affix.Constructor = Affix;


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old;
    return this;
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this);
      var data = $spy.data();

      data.offset = data.offset || {};

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom;
      if (data.offsetTop)    data.offset.top    = data.offsetTop;

      $spy.affix(data);
    })
  })

}(window.jQuery || window.Zepto, window);
