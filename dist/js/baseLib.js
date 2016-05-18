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
// defind ,require,inherits
(function (global, undefined) {

    var _makeInstance = function (obj) {
        var noop = new Function();
        noop.prototype = obj;
        obj = new noop;
        noop.prototype = null;
        return obj;
    };

    var _extend = function (target, source, deep) {
        if (source) {
            for (var k in source) {
                if (!deep || !target.hasOwnProperty(k)) {
                    target[k] = source[k];
                }
            }
        }
        return target;
    };
    /**
     * 模拟继承机制，subClass继承superClass
     * @name inherits
     * @grammar inherits(subClass,superClass) => subClass
     * @example
     function SuperClass(){
                  this.name = "小李";
              }
     SuperClass.prototype = {
               hello:function(str){
                   console.log(this.name + str);
               }
            }
     function SubClass(){
              this.name = "小张";
            }
     inherits(SubClass,SuperClass);
     var sub = new SubClass();
     sub.hello("早上好!"); ==> "小张早上好！"
     */
    var _inherits = function (subClass, superClass) {
        var oldP = subClass.prototype,
            newP = _makeInstance(superClass.prototype);
        _extend(newP, oldP, true);
        subClass.prototype = newP;
        return (newP.constructor = subClass);
    };

    if (!global.inherits && typeof global.inherits !== 'function') {
        global.inherits = _inherits;
    }

    //给String扩展indexOf方法
    if (typeof String.indexOf !== 'function') {
        String.prototype.indexOf = function (str) {
            var len = this.length;
            var _len = str.length;
            var index = 0;
            var flag = false;
            while (index < len) {
                if (this.substr(index, _len) === str) {
                    flag = true;
                    break;
                } else {
                    index++;
                }
            }
            if (!flag) {
                index = -1;
            }
            return index;
        };
    }
    //给Array扩展indexOf方法
    if (typeof Array.indexOf !== 'function') {
        Array.prototype.indexOf = function (item) {
            var rst = -1;
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i] === item) {
                    rst = i;

                    break;
                }
            }
            return rst;
        };
    }

    function isType(type) {
        return function(obj) {
            return {}.toString.call(obj) == "[object " + type + "]"
        }
    }

    var isObject = isType("Object");
    var isString = isType("String");
    var isArray = Array.isArray || isType("Array");
    var isFunction = isType("Function");
    /**
     * 没有seajs的时候生效
     */
    if (!global.seajs && typeof global.define !== 'function' && typeof global.require !== 'function') {

        var cachedMods = {};
        function Module() { }
        global.cachedMods=cachedMods;
        global.Module=Module;
        Module.prototype.exec = function () {
            var mod = this;
            if (this.execed) {
                return mod.exports;
            }
            this.execed = true;

            function require(id) {
                return Module.get(id).exec()
            }

            var factory = mod.factory;

            var exports = isFunction(factory) ?
                factory(require, mod.exports = {}, mod) :
                factory;

            if (exports === undefined) {
                exports = mod.exports
            }

            // Reduce memory leak
            delete mod.factory;
            mod.exports = exports;
            return exports;
        };

        global.define = function (id, deps, factory) {
            var argsLen = arguments.length;
            // define(factory)
            if (argsLen === 1) {
                factory = id;
                id = undefined
            } else if (argsLen === 2) {
                factory = deps;

                // define(deps, factory)
                if (isArray(id)) {
                    deps = id;
                    id = undefined
                }
                // define(id, factory)
                else {
                    deps = undefined
                }
            }
            var meta = {
                id: id,
                deps: deps,
                factory: factory
            };
//            console.log("define",meta);
            Module.save(meta);
        };

        Module.save = function (meta) {
            var mod = Module.get(meta.id);
            mod.id = meta.id;
            mod.dependencies = meta.deps;
            mod.factory = meta.factory;
        };
        Module.get = function (id) {
            return global.cachedMods[id] || (global.cachedMods[id] = new Module());
        };
        global.require = function (id) {
            var mod = Module.get(id);
            if (!mod.execed) {
                mod.exec()
            }
            return mod.exports;
        }

    }

})(window);

/*
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */
// use IE <= 8
// vim: ts=4 sts=4 sw=4 expandtab

// Add semicolon to prevent IIFE from being passed as argument to concatenated code.
;

// UMD (Universal Module Definition)
// see https://github.com/umdjs/umd/blob/master/templates/returnExports.js
(function (root, factory) {
    'use strict';

    /* global define, exports, module */
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
    }
}(this, function () {

    /**
     * Brings an environment as close to ECMAScript 5 compliance
     * as is possible with the facilities of erstwhile engines.
     *
     * Annotated ES5: http://es5.github.com/ (specific links below)
     * ES5 Spec: http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf
     * Required reading: http://javascriptweblog.wordpress.com/2011/12/05/extending-javascript-natives/
     */

// Shortcut to an often accessed properties, in order to avoid multiple
// dereference that costs universally. This also holds a reference to known-good
// functions.
    var $Array = Array;
    var ArrayPrototype = $Array.prototype;
    var $Object = Object;
    var ObjectPrototype = $Object.prototype;
    var $Function = Function;
    var FunctionPrototype = $Function.prototype;
    var $String = String;
    var StringPrototype = $String.prototype;
    var $Number = Number;
    var NumberPrototype = $Number.prototype;
    var array_slice = ArrayPrototype.slice;
    var array_splice = ArrayPrototype.splice;
    var array_push = ArrayPrototype.push;
    var array_unshift = ArrayPrototype.unshift;
    var array_concat = ArrayPrototype.concat;
    var array_join = ArrayPrototype.join;
    var call = FunctionPrototype.call;
    var apply = FunctionPrototype.apply;
    var max = Math.max;
    var min = Math.min;

// Having a toString local variable name breaks in Opera so use to_string.
    var to_string = ObjectPrototype.toString;

    /* global Symbol */
    /* eslint-disable one-var-declaration-per-line */
    var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
    var isCallable; /* inlined from https://npmjs.com/is-callable */ var fnToStr = Function.prototype.toString, constructorRegex = /\s*class /, isES6ClassFn = function isES6ClassFn(value) { try { var fnStr = fnToStr.call(value); var singleStripped = fnStr.replace(/\/\/.*\n/g, ''); var multiStripped = singleStripped.replace(/\/\*[.\s\S]*\*\//g, ''); var spaceStripped = multiStripped.replace(/\n/mg, ' ').replace(/ {2}/g, ' '); return constructorRegex.test(spaceStripped); } catch (e) { return false; /* not a function */ } }, tryFunctionObject = function tryFunctionObject(value) { try { if (isES6ClassFn(value)) { return false; } fnToStr.call(value); return true; } catch (e) { return false; } }, fnClass = '[object Function]', genClass = '[object GeneratorFunction]', isCallable = function isCallable(value) { if (!value) { return false; } if (typeof value !== 'function' && typeof value !== 'object') { return false; } if (hasToStringTag) { return tryFunctionObject(value); } if (isES6ClassFn(value)) { return false; } var strClass = to_string.call(value); return strClass === fnClass || strClass === genClass; };

    var isRegex; /* inlined from https://npmjs.com/is-regex */ var regexExec = RegExp.prototype.exec, tryRegexExec = function tryRegexExec(value) { try { regexExec.call(value); return true; } catch (e) { return false; } }, regexClass = '[object RegExp]'; isRegex = function isRegex(value) { if (typeof value !== 'object') { return false; } return hasToStringTag ? tryRegexExec(value) : to_string.call(value) === regexClass; };
    var isString; /* inlined from https://npmjs.com/is-string */ var strValue = String.prototype.valueOf, tryStringObject = function tryStringObject(value) { try { strValue.call(value); return true; } catch (e) { return false; } }, stringClass = '[object String]'; isString = function isString(value) { if (typeof value === 'string') { return true; } if (typeof value !== 'object') { return false; } return hasToStringTag ? tryStringObject(value) : to_string.call(value) === stringClass; };
    /* eslint-enable one-var-declaration-per-line */

    /* inlined from http://npmjs.com/define-properties */
    var supportsDescriptors = $Object.defineProperty && (function () {
        try {
            var obj = {};
            $Object.defineProperty(obj, 'x', { enumerable: false, value: obj });
            for (var _ in obj) { return false; }
            return obj.x === obj;
        } catch (e) { /* this is ES3 */
            return false;
        }
    }());
    var defineProperties = (function (has) {
        // Define configurable, writable, and non-enumerable props
        // if they don't exist.
        var defineProperty;
        if (supportsDescriptors) {
            defineProperty = function (object, name, method, forceAssign) {
                if (!forceAssign && (name in object)) { return; }
                $Object.defineProperty(object, name, {
                    configurable: true,
                    enumerable: false,
                    writable: true,
                    value: method
                });
            };
        } else {
            defineProperty = function (object, name, method, forceAssign) {
                if (!forceAssign && (name in object)) { return; }
                object[name] = method;
            };
        }
        return function defineProperties(object, map, forceAssign) {
            for (var name in map) {
                if (has.call(map, name)) {
                    defineProperty(object, name, map[name], forceAssign);
                }
            }
        };
    }(ObjectPrototype.hasOwnProperty));

//
// Util
// ======
//

    /* replaceable with https://npmjs.com/package/es-abstract /helpers/isPrimitive */
    var isPrimitive = function isPrimitive(input) {
        var type = typeof input;
        return input === null || (type !== 'object' && type !== 'function');
    };

    var isActualNaN = $Number.isNaN || function (x) { return x !== x; };

    var ES = {
        // ES5 9.4
        // http://es5.github.com/#x9.4
        // http://jsperf.com/to-integer
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToInteger */
        ToInteger: function ToInteger(num) {
            var n = +num;
            if (isActualNaN(n)) {
                n = 0;
            } else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0)) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
            return n;
        },

        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToPrimitive */
        ToPrimitive: function ToPrimitive(input) {
            var val, valueOf, toStr;
            if (isPrimitive(input)) {
                return input;
            }
            valueOf = input.valueOf;
            if (isCallable(valueOf)) {
                val = valueOf.call(input);
                if (isPrimitive(val)) {
                    return val;
                }
            }
            toStr = input.toString;
            if (isCallable(toStr)) {
                val = toStr.call(input);
                if (isPrimitive(val)) {
                    return val;
                }
            }
            throw new TypeError();
        },

        // ES5 9.9
        // http://es5.github.com/#x9.9
        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToObject */
        ToObject: function (o) {
            if (o == null) { // this matches both null and undefined
                throw new TypeError("can't convert " + o + ' to object');
            }
            return $Object(o);
        },

        /* replaceable with https://npmjs.com/package/es-abstract ES5.ToUint32 */
        ToUint32: function ToUint32(x) {
            return x >>> 0;
        }
    };

//
// Function
// ========
//

// ES-5 15.3.4.5
// http://es5.github.com/#x15.3.4.5

    var Empty = function Empty() {};

    defineProperties(FunctionPrototype, {
        bind: function bind(that) { // .length is 1
            // 1. Let Target be the this value.
            var target = this;
            // 2. If IsCallable(Target) is false, throw a TypeError exception.
            if (!isCallable(target)) {
                throw new TypeError('Function.prototype.bind called on incompatible ' + target);
            }
            // 3. Let A be a new (possibly empty) internal list of all of the
            //   argument values provided after thisArg (arg1, arg2 etc), in order.
            // XXX slicedArgs will stand in for "A" if used
            var args = array_slice.call(arguments, 1); // for normal call
            // 4. Let F be a new native ECMAScript object.
            // 11. Set the [[Prototype]] internal property of F to the standard
            //   built-in Function prototype object as specified in 15.3.3.1.
            // 12. Set the [[Call]] internal property of F as described in
            //   15.3.4.5.1.
            // 13. Set the [[Construct]] internal property of F as described in
            //   15.3.4.5.2.
            // 14. Set the [[HasInstance]] internal property of F as described in
            //   15.3.4.5.3.
            var bound;
            var binder = function () {

                if (this instanceof bound) {
                    // 15.3.4.5.2 [[Construct]]
                    // When the [[Construct]] internal method of a function object,
                    // F that was created using the bind function is called with a
                    // list of arguments ExtraArgs, the following steps are taken:
                    // 1. Let target be the value of F's [[TargetFunction]]
                    //   internal property.
                    // 2. If target has no [[Construct]] internal method, a
                    //   TypeError exception is thrown.
                    // 3. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Construct]] internal
                    //   method of target providing args as the arguments.

                    var result = apply.call(
                        target,
                        this,
                        array_concat.call(args, array_slice.call(arguments))
                    );
                    if ($Object(result) === result) {
                        return result;
                    }
                    return this;

                } else {
                    // 15.3.4.5.1 [[Call]]
                    // When the [[Call]] internal method of a function object, F,
                    // which was created using the bind function is called with a
                    // this value and a list of arguments ExtraArgs, the following
                    // steps are taken:
                    // 1. Let boundArgs be the value of F's [[BoundArgs]] internal
                    //   property.
                    // 2. Let boundThis be the value of F's [[BoundThis]] internal
                    //   property.
                    // 3. Let target be the value of F's [[TargetFunction]] internal
                    //   property.
                    // 4. Let args be a new list containing the same values as the
                    //   list boundArgs in the same order followed by the same
                    //   values as the list ExtraArgs in the same order.
                    // 5. Return the result of calling the [[Call]] internal method
                    //   of target providing boundThis as the this value and
                    //   providing args as the arguments.

                    // equiv: target.call(this, ...boundArgs, ...args)
                    return apply.call(
                        target,
                        that,
                        array_concat.call(args, array_slice.call(arguments))
                    );

                }

            };

            // 15. If the [[Class]] internal property of Target is "Function", then
            //     a. Let L be the length property of Target minus the length of A.
            //     b. Set the length own property of F to either 0 or L, whichever is
            //       larger.
            // 16. Else set the length own property of F to 0.

            var boundLength = max(0, target.length - args.length);

            // 17. Set the attributes of the length own property of F to the values
            //   specified in 15.3.5.1.
            var boundArgs = [];
            for (var i = 0; i < boundLength; i++) {
                array_push.call(boundArgs, '$' + i);
            }

            // XXX Build a dynamic function with desired amount of arguments is the only
            // way to set the length property of a function.
            // In environments where Content Security Policies enabled (Chrome extensions,
            // for ex.) all use of eval or Function costructor throws an exception.
            // However in all of these environments Function.prototype.bind exists
            // and so this code will never be executed.
            bound = $Function('binder', 'return function (' + array_join.call(boundArgs, ',') + '){ return binder.apply(this, arguments); }')(binder);

            if (target.prototype) {
                Empty.prototype = target.prototype;
                bound.prototype = new Empty();
                // Clean up dangling references.
                Empty.prototype = null;
            }

            // TODO
            // 18. Set the [[Extensible]] internal property of F to true.

            // TODO
            // 19. Let thrower be the [[ThrowTypeError]] function Object (13.2.3).
            // 20. Call the [[DefineOwnProperty]] internal method of F with
            //   arguments "caller", PropertyDescriptor {[[Get]]: thrower, [[Set]]:
            //   thrower, [[Enumerable]]: false, [[Configurable]]: false}, and
            //   false.
            // 21. Call the [[DefineOwnProperty]] internal method of F with
            //   arguments "arguments", PropertyDescriptor {[[Get]]: thrower,
            //   [[Set]]: thrower, [[Enumerable]]: false, [[Configurable]]: false},
            //   and false.

            // TODO
            // NOTE Function objects created using Function.prototype.bind do not
            // have a prototype property or the [[Code]], [[FormalParameters]], and
            // [[Scope]] internal properties.
            // XXX can't delete prototype in pure-js.

            // 22. Return F.
            return bound;
        }
    });

// _Please note: Shortcuts are defined after `Function.prototype.bind` as we
// use it in defining shortcuts.
    var owns = call.bind(ObjectPrototype.hasOwnProperty);
    var toStr = call.bind(ObjectPrototype.toString);
    var arraySlice = call.bind(array_slice);
    var arraySliceApply = apply.bind(array_slice);
    var strSlice = call.bind(StringPrototype.slice);
    var strSplit = call.bind(StringPrototype.split);
    var strIndexOf = call.bind(StringPrototype.indexOf);
    var pushCall = call.bind(array_push);
    var isEnum = call.bind(ObjectPrototype.propertyIsEnumerable);
    var arraySort = call.bind(ArrayPrototype.sort);

//
// Array
// =====
//

    var isArray = $Array.isArray || function isArray(obj) {
        return toStr(obj) === '[object Array]';
    };

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.13
// Return len+argCount.
// [bugfix, ielt8]
// IE < 8 bug: [].unshift(0) === undefined but should be "1"
    var hasUnshiftReturnValueBug = [].unshift(0) !== 1;
    defineProperties(ArrayPrototype, {
        unshift: function () {
            array_unshift.apply(this, arguments);
            return this.length;
        }
    }, hasUnshiftReturnValueBug);

// ES5 15.4.3.2
// http://es5.github.com/#x15.4.3.2
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
    defineProperties($Array, { isArray: isArray });

// The IsCallable() check in the Array functions
// has been replaced with a strict check on the
// internal class of the object to trap cases where
// the provided function was actually a regular
// expression literal, which in V8 and
// JavaScriptCore is a typeof "function".  Only in
// V8 are regular expression literals permitted as
// reduce parameters, so it is desirable in the
// general case for the shim to match the more
// strict and common behavior of rejecting regular
// expressions.

// ES5 15.4.4.18
// http://es5.github.com/#x15.4.4.18
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/forEach

// Check failure of by-index access of string characters (IE < 9)
// and failure of `0 in boxedString` (Rhino)
    var boxedString = $Object('a');
    var splitString = boxedString[0] !== 'a' || !(0 in boxedString);

    var properlyBoxesContext = function properlyBoxed(method) {
        // Check node 0.6.21 bug where third parameter is not boxed
        var properlyBoxesNonStrict = true;
        var properlyBoxesStrict = true;
        var threwException = false;
        if (method) {
            try {
                method.call('foo', function (_, __, context) {
                    if (typeof context !== 'object') { properlyBoxesNonStrict = false; }
                });

                method.call([1], function () {
                    'use strict';

                    properlyBoxesStrict = typeof this === 'string';
                }, 'x');
            } catch (e) {
                threwException = true;
            }
        }
        return !!method && !threwException && properlyBoxesNonStrict && properlyBoxesStrict;
    };

    defineProperties(ArrayPrototype, {
        forEach: function forEach(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var i = -1;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.forEach callback must be a function');
            }

            while (++i < length) {
                if (i in self) {
                    // Invoke the callback function with call, passing arguments:
                    // context, property value, property key, thisArg object
                    if (typeof T === 'undefined') {
                        callbackfn(self[i], i, object);
                    } else {
                        callbackfn.call(T, self[i], i, object);
                    }
                }
            }
        }
    }, !properlyBoxesContext(ArrayPrototype.forEach));

// ES5 15.4.4.19
// http://es5.github.com/#x15.4.4.19
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/map
    defineProperties(ArrayPrototype, {
        map: function map(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var result = $Array(length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.map callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self) {
                    if (typeof T === 'undefined') {
                        result[i] = callbackfn(self[i], i, object);
                    } else {
                        result[i] = callbackfn.call(T, self[i], i, object);
                    }
                }
            }
            return result;
        }
    }, !properlyBoxesContext(ArrayPrototype.map));

// ES5 15.4.4.20
// http://es5.github.com/#x15.4.4.20
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
    defineProperties(ArrayPrototype, {
        filter: function filter(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var result = [];
            var value;
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.filter callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self) {
                    value = self[i];
                    if (typeof T === 'undefined' ? callbackfn(value, i, object) : callbackfn.call(T, value, i, object)) {
                        pushCall(result, value);
                    }
                }
            }
            return result;
        }
    }, !properlyBoxesContext(ArrayPrototype.filter));

// ES5 15.4.4.16
// http://es5.github.com/#x15.4.4.16
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/every
    defineProperties(ArrayPrototype, {
        every: function every(callbackfn/*, thisArg*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.every callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self && !(typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                    return false;
                }
            }
            return true;
        }
    }, !properlyBoxesContext(ArrayPrototype.every));

// ES5 15.4.4.17
// http://es5.github.com/#x15.4.4.17
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
    defineProperties(ArrayPrototype, {
        some: function some(callbackfn/*, thisArg */) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);
            var T;
            if (arguments.length > 1) {
                T = arguments[1];
            }

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.some callback must be a function');
            }

            for (var i = 0; i < length; i++) {
                if (i in self && (typeof T === 'undefined' ? callbackfn(self[i], i, object) : callbackfn.call(T, self[i], i, object))) {
                    return true;
                }
            }
            return false;
        }
    }, !properlyBoxesContext(ArrayPrototype.some));

// ES5 15.4.4.21
// http://es5.github.com/#x15.4.4.21
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduce
    var reduceCoercesToObject = false;
    if (ArrayPrototype.reduce) {
        reduceCoercesToObject = typeof ArrayPrototype.reduce.call('es5', function (_, __, ___, list) { return list; }) === 'object';
    }
    defineProperties(ArrayPrototype, {
        reduce: function reduce(callbackfn/*, initialValue*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.reduce callback must be a function');
            }

            // no value to return if no initial value and an empty array
            if (length === 0 && arguments.length === 1) {
                throw new TypeError('reduce of empty array with no initial value');
            }

            var i = 0;
            var result;
            if (arguments.length >= 2) {
                result = arguments[1];
            } else {
                do {
                    if (i in self) {
                        result = self[i++];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    if (++i >= length) {
                        throw new TypeError('reduce of empty array with no initial value');
                    }
                } while (true);
            }

            for (; i < length; i++) {
                if (i in self) {
                    result = callbackfn(result, self[i], i, object);
                }
            }

            return result;
        }
    }, !reduceCoercesToObject);

// ES5 15.4.4.22
// http://es5.github.com/#x15.4.4.22
// https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/reduceRight
    var reduceRightCoercesToObject = false;
    if (ArrayPrototype.reduceRight) {
        reduceRightCoercesToObject = typeof ArrayPrototype.reduceRight.call('es5', function (_, __, ___, list) { return list; }) === 'object';
    }
    defineProperties(ArrayPrototype, {
        reduceRight: function reduceRight(callbackfn/*, initial*/) {
            var object = ES.ToObject(this);
            var self = splitString && isString(this) ? strSplit(this, '') : object;
            var length = ES.ToUint32(self.length);

            // If no callback function or if callback is not a callable function
            if (!isCallable(callbackfn)) {
                throw new TypeError('Array.prototype.reduceRight callback must be a function');
            }

            // no value to return if no initial value, empty array
            if (length === 0 && arguments.length === 1) {
                throw new TypeError('reduceRight of empty array with no initial value');
            }

            var result;
            var i = length - 1;
            if (arguments.length >= 2) {
                result = arguments[1];
            } else {
                do {
                    if (i in self) {
                        result = self[i--];
                        break;
                    }

                    // if array contains no values, no initial value to return
                    if (--i < 0) {
                        throw new TypeError('reduceRight of empty array with no initial value');
                    }
                } while (true);
            }

            if (i < 0) {
                return result;
            }

            do {
                if (i in self) {
                    result = callbackfn(result, self[i], i, object);
                }
            } while (i--);

            return result;
        }
    }, !reduceRightCoercesToObject);

// ES5 15.4.4.14
// http://es5.github.com/#x15.4.4.14
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/indexOf
    var hasFirefox2IndexOfBug = ArrayPrototype.indexOf && [0, 1].indexOf(1, 2) !== -1;
    defineProperties(ArrayPrototype, {
        indexOf: function indexOf(searchElement/*, fromIndex */) {
            var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
            var length = ES.ToUint32(self.length);

            if (length === 0) {
                return -1;
            }

            var i = 0;
            if (arguments.length > 1) {
                i = ES.ToInteger(arguments[1]);
            }

            // handle negative indices
            i = i >= 0 ? i : max(0, length + i);
            for (; i < length; i++) {
                if (i in self && self[i] === searchElement) {
                    return i;
                }
            }
            return -1;
        }
    }, hasFirefox2IndexOfBug);

// ES5 15.4.4.15
// http://es5.github.com/#x15.4.4.15
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/lastIndexOf
    var hasFirefox2LastIndexOfBug = ArrayPrototype.lastIndexOf && [0, 1].lastIndexOf(0, -3) !== -1;
    defineProperties(ArrayPrototype, {
        lastIndexOf: function lastIndexOf(searchElement/*, fromIndex */) {
            var self = splitString && isString(this) ? strSplit(this, '') : ES.ToObject(this);
            var length = ES.ToUint32(self.length);

            if (length === 0) {
                return -1;
            }
            var i = length - 1;
            if (arguments.length > 1) {
                i = min(i, ES.ToInteger(arguments[1]));
            }
            // handle negative indices
            i = i >= 0 ? i : length - Math.abs(i);
            for (; i >= 0; i--) {
                if (i in self && searchElement === self[i]) {
                    return i;
                }
            }
            return -1;
        }
    }, hasFirefox2LastIndexOfBug);

// ES5 15.4.4.12
// http://es5.github.com/#x15.4.4.12
    var spliceNoopReturnsEmptyArray = (function () {
        var a = [1, 2];
        var result = a.splice();
        return a.length === 2 && isArray(result) && result.length === 0;
    }());
    defineProperties(ArrayPrototype, {
        // Safari 5.0 bug where .splice() returns undefined
        splice: function splice(start, deleteCount) {
            if (arguments.length === 0) {
                return [];
            } else {
                return array_splice.apply(this, arguments);
            }
        }
    }, !spliceNoopReturnsEmptyArray);

    var spliceWorksWithEmptyObject = (function () {
        var obj = {};
        ArrayPrototype.splice.call(obj, 0, 0, 1);
        return obj.length === 1;
    }());
    defineProperties(ArrayPrototype, {
        splice: function splice(start, deleteCount) {
            if (arguments.length === 0) { return []; }
            var args = arguments;
            this.length = max(ES.ToInteger(this.length), 0);
            if (arguments.length > 0 && typeof deleteCount !== 'number') {
                args = arraySlice(arguments);
                if (args.length < 2) {
                    pushCall(args, this.length - start);
                } else {
                    args[1] = ES.ToInteger(deleteCount);
                }
            }
            return array_splice.apply(this, args);
        }
    }, !spliceWorksWithEmptyObject);
    var spliceWorksWithLargeSparseArrays = (function () {
        // Per https://github.com/es-shims/es5-shim/issues/295
        // Safari 7/8 breaks with sparse arrays of size 1e5 or greater
        var arr = new $Array(1e5);
        // note: the index MUST be 8 or larger or the test will false pass
        arr[8] = 'x';
        arr.splice(1, 1);
        // note: this test must be defined *after* the indexOf shim
        // per https://github.com/es-shims/es5-shim/issues/313
        return arr.indexOf('x') === 7;
    }());
    var spliceWorksWithSmallSparseArrays = (function () {
        // Per https://github.com/es-shims/es5-shim/issues/295
        // Opera 12.15 breaks on this, no idea why.
        var n = 256;
        var arr = [];
        arr[n] = 'a';
        arr.splice(n + 1, 0, 'b');
        return arr[n] === 'a';
    }());
    defineProperties(ArrayPrototype, {
        splice: function splice(start, deleteCount) {
            var O = ES.ToObject(this);
            var A = [];
            var len = ES.ToUint32(O.length);
            var relativeStart = ES.ToInteger(start);
            var actualStart = relativeStart < 0 ? max((len + relativeStart), 0) : min(relativeStart, len);
            var actualDeleteCount = min(max(ES.ToInteger(deleteCount), 0), len - actualStart);

            var k = 0;
            var from;
            while (k < actualDeleteCount) {
                from = $String(actualStart + k);
                if (owns(O, from)) {
                    A[k] = O[from];
                }
                k += 1;
            }

            var items = arraySlice(arguments, 2);
            var itemCount = items.length;
            var to;
            if (itemCount < actualDeleteCount) {
                k = actualStart;
                var maxK = len - actualDeleteCount;
                while (k < maxK) {
                    from = $String(k + actualDeleteCount);
                    to = $String(k + itemCount);
                    if (owns(O, from)) {
                        O[to] = O[from];
                    } else {
                        delete O[to];
                    }
                    k += 1;
                }
                k = len;
                var minK = len - actualDeleteCount + itemCount;
                while (k > minK) {
                    delete O[k - 1];
                    k -= 1;
                }
            } else if (itemCount > actualDeleteCount) {
                k = len - actualDeleteCount;
                while (k > actualStart) {
                    from = $String(k + actualDeleteCount - 1);
                    to = $String(k + itemCount - 1);
                    if (owns(O, from)) {
                        O[to] = O[from];
                    } else {
                        delete O[to];
                    }
                    k -= 1;
                }
            }
            k = actualStart;
            for (var i = 0; i < items.length; ++i) {
                O[k] = items[i];
                k += 1;
            }
            O.length = len - actualDeleteCount + itemCount;

            return A;
        }
    }, !spliceWorksWithLargeSparseArrays || !spliceWorksWithSmallSparseArrays);

    var originalJoin = ArrayPrototype.join;
    var hasStringJoinBug;
    try {
        hasStringJoinBug = Array.prototype.join.call('123', ',') !== '1,2,3';
    } catch (e) {
        hasStringJoinBug = true;
    }
    if (hasStringJoinBug) {
        defineProperties(ArrayPrototype, {
            join: function join(separator) {
                var sep = typeof separator === 'undefined' ? ',' : separator;
                return originalJoin.call(isString(this) ? strSplit(this, '') : this, sep);
            }
        }, hasStringJoinBug);
    }

    var hasJoinUndefinedBug = [1, 2].join(undefined) !== '1,2';
    if (hasJoinUndefinedBug) {
        defineProperties(ArrayPrototype, {
            join: function join(separator) {
                var sep = typeof separator === 'undefined' ? ',' : separator;
                return originalJoin.call(this, sep);
            }
        }, hasJoinUndefinedBug);
    }

    var pushShim = function push(item) {
        var O = ES.ToObject(this);
        var n = ES.ToUint32(O.length);
        var i = 0;
        while (i < arguments.length) {
            O[n + i] = arguments[i];
            i += 1;
        }
        O.length = n + i;
        return n + i;
    };

    var pushIsNotGeneric = (function () {
        var obj = {};
        var result = Array.prototype.push.call(obj, undefined);
        return result !== 1 || obj.length !== 1 || typeof obj[0] !== 'undefined' || !owns(obj, 0);
    }());
    defineProperties(ArrayPrototype, {
        push: function push(item) {
            if (isArray(this)) {
                return array_push.apply(this, arguments);
            }
            return pushShim.apply(this, arguments);
        }
    }, pushIsNotGeneric);

// This fixes a very weird bug in Opera 10.6 when pushing `undefined
    var pushUndefinedIsWeird = (function () {
        var arr = [];
        var result = arr.push(undefined);
        return result !== 1 || arr.length !== 1 || typeof arr[0] !== 'undefined' || !owns(arr, 0);
    }());
    defineProperties(ArrayPrototype, { push: pushShim }, pushUndefinedIsWeird);

// ES5 15.2.3.14
// http://es5.github.io/#x15.4.4.10
// Fix boxed string bug
    defineProperties(ArrayPrototype, {
        slice: function (start, end) {
            var arr = isString(this) ? strSplit(this, '') : this;
            return arraySliceApply(arr, arguments);
        }
    }, splitString);

    var sortIgnoresNonFunctions = (function () {
        try {
            [1, 2].sort(null);
            [1, 2].sort({});
            return true;
        } catch (e) { /**/ }
        return false;
    }());
    var sortThrowsOnRegex = (function () {
        // this is a problem in Firefox 4, in which `typeof /a/ === 'function'`
        try {
            [1, 2].sort(/a/);
            return false;
        } catch (e) { /**/ }
        return true;
    }());
    var sortIgnoresUndefined = (function () {
        // applies in IE 8, for one.
        try {
            [1, 2].sort(undefined);
            return true;
        } catch (e) { /**/ }
        return false;
    }());
    defineProperties(ArrayPrototype, {
        sort: function sort(compareFn) {
            if (typeof compareFn === 'undefined') {
                return arraySort(this);
            }
            if (!isCallable(compareFn)) {
                throw new TypeError('Array.prototype.sort callback must be a function');
            }
            return arraySort(this, compareFn);
        }
    }, sortIgnoresNonFunctions || !sortIgnoresUndefined || !sortThrowsOnRegex);

//
// Object
// ======
//

// ES5 15.2.3.14
// http://es5.github.com/#x15.2.3.14

// http://whattheheadsaid.com/2010/10/a-safer-object-keys-compatibility-implementation
    var hasDontEnumBug = !({ 'toString': null }).propertyIsEnumerable('toString');
    var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
    var hasStringEnumBug = !owns('x', '0');
    var equalsConstructorPrototype = function (o) {
        var ctor = o.constructor;
        return ctor && ctor.prototype === o;
    };
    var blacklistedKeys = {
        $window: true,
        $console: true,
        $parent: true,
        $self: true,
        $frame: true,
        $frames: true,
        $frameElement: true,
        $webkitIndexedDB: true,
        $webkitStorageInfo: true,
        $external: true
    };
    var hasAutomationEqualityBug = (function () {
        /* globals window */
        if (typeof window === 'undefined') { return false; }
        for (var k in window) {
            try {
                if (!blacklistedKeys['$' + k] && owns(window, k) && window[k] !== null && typeof window[k] === 'object') {
                    equalsConstructorPrototype(window[k]);
                }
            } catch (e) {
                return true;
            }
        }
        return false;
    }());
    var equalsConstructorPrototypeIfNotBuggy = function (object) {
        if (typeof window === 'undefined' || !hasAutomationEqualityBug) { return equalsConstructorPrototype(object); }
        try {
            return equalsConstructorPrototype(object);
        } catch (e) {
            return false;
        }
    };
    var dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
    ];
    var dontEnumsLength = dontEnums.length;

// taken directly from https://github.com/ljharb/is-arguments/blob/master/index.js
// can be replaced with require('is-arguments') if we ever use a build process instead
    var isStandardArguments = function isArguments(value) {
        return toStr(value) === '[object Arguments]';
    };
    var isLegacyArguments = function isArguments(value) {
        return value !== null &&
            typeof value === 'object' &&
            typeof value.length === 'number' &&
            value.length >= 0 &&
            !isArray(value) &&
            isCallable(value.callee);
    };
    var isArguments = isStandardArguments(arguments) ? isStandardArguments : isLegacyArguments;

    defineProperties($Object, {
        keys: function keys(object) {
            var isFn = isCallable(object);
            var isArgs = isArguments(object);
            var isObject = object !== null && typeof object === 'object';
            var isStr = isObject && isString(object);

            if (!isObject && !isFn && !isArgs) {
                throw new TypeError('Object.keys called on a non-object');
            }

            var theKeys = [];
            var skipProto = hasProtoEnumBug && isFn;
            if ((isStr && hasStringEnumBug) || isArgs) {
                for (var i = 0; i < object.length; ++i) {
                    pushCall(theKeys, $String(i));
                }
            }

            if (!isArgs) {
                for (var name in object) {
                    if (!(skipProto && name === 'prototype') && owns(object, name)) {
                        pushCall(theKeys, $String(name));
                    }
                }
            }

            if (hasDontEnumBug) {
                var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);
                for (var j = 0; j < dontEnumsLength; j++) {
                    var dontEnum = dontEnums[j];
                    if (!(skipConstructor && dontEnum === 'constructor') && owns(object, dontEnum)) {
                        pushCall(theKeys, dontEnum);
                    }
                }
            }
            return theKeys;
        }
    });

    var keysWorksWithArguments = $Object.keys && (function () {
        // Safari 5.0 bug
        return $Object.keys(arguments).length === 2;
    }(1, 2));
    var keysHasArgumentsLengthBug = $Object.keys && (function () {
        var argKeys = $Object.keys(arguments);
        return arguments.length !== 1 || argKeys.length !== 1 || argKeys[0] !== 1;
    }(1));
    var originalKeys = $Object.keys;
    defineProperties($Object, {
        keys: function keys(object) {
            if (isArguments(object)) {
                return originalKeys(arraySlice(object));
            } else {
                return originalKeys(object);
            }
        }
    }, !keysWorksWithArguments || keysHasArgumentsLengthBug);

//
// Date
// ====
//

    var hasNegativeMonthYearBug = new Date(-3509827329600292).getUTCMonth() !== 0;
    var aNegativeTestDate = new Date(-1509842289600292);
    var aPositiveTestDate = new Date(1449662400000);
    var hasToUTCStringFormatBug = aNegativeTestDate.toUTCString() !== 'Mon, 01 Jan -45875 11:59:59 GMT';
    var hasToDateStringFormatBug;
    var hasToStringFormatBug;
    var timeZoneOffset = aNegativeTestDate.getTimezoneOffset();
    if (timeZoneOffset < -720) {
        hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Tue Jan 02 -45875';
        hasToStringFormatBug = !(/^Thu Dec 10 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
    } else {
        hasToDateStringFormatBug = aNegativeTestDate.toDateString() !== 'Mon Jan 01 -45875';
        hasToStringFormatBug = !(/^Wed Dec 09 2015 \d\d:\d\d:\d\d GMT[-\+]\d\d\d\d(?: |$)/).test(aPositiveTestDate.toString());
    }

    var originalGetFullYear = call.bind(Date.prototype.getFullYear);
    var originalGetMonth = call.bind(Date.prototype.getMonth);
    var originalGetDate = call.bind(Date.prototype.getDate);
    var originalGetUTCFullYear = call.bind(Date.prototype.getUTCFullYear);
    var originalGetUTCMonth = call.bind(Date.prototype.getUTCMonth);
    var originalGetUTCDate = call.bind(Date.prototype.getUTCDate);
    var originalGetUTCDay = call.bind(Date.prototype.getUTCDay);
    var originalGetUTCHours = call.bind(Date.prototype.getUTCHours);
    var originalGetUTCMinutes = call.bind(Date.prototype.getUTCMinutes);
    var originalGetUTCSeconds = call.bind(Date.prototype.getUTCSeconds);
    var originalGetUTCMilliseconds = call.bind(Date.prototype.getUTCMilliseconds);
    var dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var daysInMonth = function daysInMonth(month, year) {
        return originalGetDate(new Date(year, month, 0));
    };

    defineProperties(Date.prototype, {
        getFullYear: function getFullYear() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            if (year < 0 && originalGetMonth(this) > 11) {
                return year + 1;
            }
            return year;
        },
        getMonth: function getMonth() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            var month = originalGetMonth(this);
            if (year < 0 && month > 11) {
                return 0;
            }
            return month;
        },
        getDate: function getDate() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetFullYear(this);
            var month = originalGetMonth(this);
            var date = originalGetDate(this);
            if (year < 0 && month > 11) {
                if (month === 12) {
                    return date;
                }
                var days = daysInMonth(0, year + 1);
                return (days - date) + 1;
            }
            return date;
        },
        getUTCFullYear: function getUTCFullYear() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            if (year < 0 && originalGetUTCMonth(this) > 11) {
                return year + 1;
            }
            return year;
        },
        getUTCMonth: function getUTCMonth() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            var month = originalGetUTCMonth(this);
            if (year < 0 && month > 11) {
                return 0;
            }
            return month;
        },
        getUTCDate: function getUTCDate() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var year = originalGetUTCFullYear(this);
            var month = originalGetUTCMonth(this);
            var date = originalGetUTCDate(this);
            if (year < 0 && month > 11) {
                if (month === 12) {
                    return date;
                }
                var days = daysInMonth(0, year + 1);
                return (days - date) + 1;
            }
            return date;
        }
    }, hasNegativeMonthYearBug);

    defineProperties(Date.prototype, {
        toUTCString: function toUTCString() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var day = originalGetUTCDay(this);
            var date = originalGetUTCDate(this);
            var month = originalGetUTCMonth(this);
            var year = originalGetUTCFullYear(this);
            var hour = originalGetUTCHours(this);
            var minute = originalGetUTCMinutes(this);
            var second = originalGetUTCSeconds(this);
            return dayName[day] + ', ' +
                (date < 10 ? '0' + date : date) + ' ' +
                monthName[month] + ' ' +
                year + ' ' +
                (hour < 10 ? '0' + hour : hour) + ':' +
                (minute < 10 ? '0' + minute : minute) + ':' +
                (second < 10 ? '0' + second : second) + ' GMT';
        }
    }, hasNegativeMonthYearBug || hasToUTCStringFormatBug);

// Opera 12 has `,`
    defineProperties(Date.prototype, {
        toDateString: function toDateString() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var day = this.getDay();
            var date = this.getDate();
            var month = this.getMonth();
            var year = this.getFullYear();
            return dayName[day] + ' ' +
                monthName[month] + ' ' +
                (date < 10 ? '0' + date : date) + ' ' +
                year;
        }
    }, hasNegativeMonthYearBug || hasToDateStringFormatBug);

// can't use defineProperties here because of toString enumeration issue in IE <= 8
    if (hasNegativeMonthYearBug || hasToStringFormatBug) {
        Date.prototype.toString = function toString() {
            if (!this || !(this instanceof Date)) {
                throw new TypeError('this is not a Date object.');
            }
            var day = this.getDay();
            var date = this.getDate();
            var month = this.getMonth();
            var year = this.getFullYear();
            var hour = this.getHours();
            var minute = this.getMinutes();
            var second = this.getSeconds();
            var timezoneOffset = this.getTimezoneOffset();
            var hoursOffset = Math.floor(Math.abs(timezoneOffset) / 60);
            var minutesOffset = Math.floor(Math.abs(timezoneOffset) % 60);
            return dayName[day] + ' ' +
                monthName[month] + ' ' +
                (date < 10 ? '0' + date : date) + ' ' +
                year + ' ' +
                (hour < 10 ? '0' + hour : hour) + ':' +
                (minute < 10 ? '0' + minute : minute) + ':' +
                (second < 10 ? '0' + second : second) + ' GMT' +
                (timezoneOffset > 0 ? '-' : '+') +
                (hoursOffset < 10 ? '0' + hoursOffset : hoursOffset) +
                (minutesOffset < 10 ? '0' + minutesOffset : minutesOffset);
        };
        if (supportsDescriptors) {
            $Object.defineProperty(Date.prototype, 'toString', {
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
    }

// ES5 15.9.5.43
// http://es5.github.com/#x15.9.5.43
// This function returns a String value represent the instance in time
// represented by this Date object. The format of the String is the Date Time
// string format defined in 15.9.1.15. All fields are present in the String.
// The time zone is always UTC, denoted by the suffix Z. If the time value of
// this object is not a finite Number a RangeError exception is thrown.
    var negativeDate = -62198755200000;
    var negativeYearString = '-000001';
    var hasNegativeDateBug = Date.prototype.toISOString && new Date(negativeDate).toISOString().indexOf(negativeYearString) === -1;
    var hasSafari51DateBug = Date.prototype.toISOString && new Date(-1).toISOString() !== '1969-12-31T23:59:59.999Z';

    defineProperties(Date.prototype, {
        toISOString: function toISOString() {
            if (!isFinite(this)) {
                throw new RangeError('Date.prototype.toISOString called on non-finite value.');
            }

            var year = originalGetUTCFullYear(this);

            var month = originalGetUTCMonth(this);
            // see https://github.com/es-shims/es5-shim/issues/111
            year += Math.floor(month / 12);
            month = (month % 12 + 12) % 12;

            // the date time string format is specified in 15.9.1.15.
            var result = [month + 1, originalGetUTCDate(this), originalGetUTCHours(this), originalGetUTCMinutes(this), originalGetUTCSeconds(this)];
            year = (
                (year < 0 ? '-' : (year > 9999 ? '+' : '')) +
                strSlice('00000' + Math.abs(year), (0 <= year && year <= 9999) ? -4 : -6)
                );

            for (var i = 0; i < result.length; ++i) {
                // pad months, days, hours, minutes, and seconds to have two digits.
                result[i] = strSlice('00' + result[i], -2);
            }
            // pad milliseconds to have three digits.
            return (
                year + '-' + arraySlice(result, 0, 2).join('-') +
                'T' + arraySlice(result, 2).join(':') + '.' +
                strSlice('000' + originalGetUTCMilliseconds(this), -3) + 'Z'
                );
        }
    }, hasNegativeDateBug || hasSafari51DateBug);

// ES5 15.9.5.44
// http://es5.github.com/#x15.9.5.44
// This function provides a String representation of a Date object for use by
// JSON.stringify (15.12.3).
    var dateToJSONIsSupported = (function () {
        try {
            return Date.prototype.toJSON &&
                new Date(NaN).toJSON() === null &&
                new Date(negativeDate).toJSON().indexOf(negativeYearString) !== -1 &&
                Date.prototype.toJSON.call({ // generic
                    toISOString: function () { return true; }
                });
        } catch (e) {
            return false;
        }
    }());
    if (!dateToJSONIsSupported) {
        Date.prototype.toJSON = function toJSON(key) {
            // When the toJSON method is called with argument key, the following
            // steps are taken:

            // 1.  Let O be the result of calling ToObject, giving it the this
            // value as its argument.
            // 2. Let tv be ES.ToPrimitive(O, hint Number).
            var O = $Object(this);
            var tv = ES.ToPrimitive(O);
            // 3. If tv is a Number and is not finite, return null.
            if (typeof tv === 'number' && !isFinite(tv)) {
                return null;
            }
            // 4. Let toISO be the result of calling the [[Get]] internal method of
            // O with argument "toISOString".
            var toISO = O.toISOString;
            // 5. If IsCallable(toISO) is false, throw a TypeError exception.
            if (!isCallable(toISO)) {
                throw new TypeError('toISOString property is not callable');
            }
            // 6. Return the result of calling the [[Call]] internal method of
            //  toISO with O as the this value and an empty argument list.
            return toISO.call(O);

            // NOTE 1 The argument is ignored.

            // NOTE 2 The toJSON function is intentionally generic; it does not
            // require that its this value be a Date object. Therefore, it can be
            // transferred to other kinds of objects for use as a method. However,
            // it does require that any such object have a toISOString method. An
            // object is free to use the argument key to filter its
            // stringification.
        };
    }

// ES5 15.9.4.2
// http://es5.github.com/#x15.9.4.2
// based on work shared by Daniel Friesen (dantman)
// http://gist.github.com/303249
    var supportsExtendedYears = Date.parse('+033658-09-27T01:46:40.000Z') === 1e15;
    var acceptsInvalidDates = !isNaN(Date.parse('2012-04-04T24:00:00.500Z')) || !isNaN(Date.parse('2012-11-31T23:59:59.000Z')) || !isNaN(Date.parse('2012-12-31T23:59:60.000Z'));
    var doesNotParseY2KNewYear = isNaN(Date.parse('2000-01-01T00:00:00.000Z'));
    if (doesNotParseY2KNewYear || acceptsInvalidDates || !supportsExtendedYears) {
        // XXX global assignment won't work in embeddings that use
        // an alternate object for the context.
        /* global Date: true */
        /* eslint-disable no-undef */
        var maxSafeUnsigned32Bit = Math.pow(2, 31) - 1;
        var hasSafariSignedIntBug = isActualNaN(new Date(1970, 0, 1, 0, 0, 0, maxSafeUnsigned32Bit + 1).getTime());
        /* eslint-disable no-implicit-globals */
        Date = (function (NativeDate) {
            /* eslint-enable no-implicit-globals */
            /* eslint-enable no-undef */
            // Date.length === 7
            var DateShim = function Date(Y, M, D, h, m, s, ms) {
                var length = arguments.length;
                var date;
                if (this instanceof NativeDate) {
                    var seconds = s;
                    var millis = ms;
                    if (hasSafariSignedIntBug && length >= 7 && ms > maxSafeUnsigned32Bit) {
                        // work around a Safari 8/9 bug where it treats the seconds as signed
                        var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                        var sToShift = Math.floor(msToShift / 1e3);
                        seconds += sToShift;
                        millis -= sToShift * 1e3;
                    }
                    date = length === 1 && $String(Y) === Y ? // isString(Y)
                        // We explicitly pass it through parse:
                        new NativeDate(DateShim.parse(Y)) :
                        // We have to manually make calls depending on argument
                        // length here
                            length >= 7 ? new NativeDate(Y, M, D, h, m, seconds, millis) :
                            length >= 6 ? new NativeDate(Y, M, D, h, m, seconds) :
                            length >= 5 ? new NativeDate(Y, M, D, h, m) :
                            length >= 4 ? new NativeDate(Y, M, D, h) :
                            length >= 3 ? new NativeDate(Y, M, D) :
                            length >= 2 ? new NativeDate(Y, M) :
                            length >= 1 ? new NativeDate(Y) :
                        new NativeDate();
                } else {
                    date = NativeDate.apply(this, arguments);
                }
                if (!isPrimitive(date)) {
                    // Prevent mixups with unfixed Date object
                    defineProperties(date, { constructor: DateShim }, true);
                }
                return date;
            };

            // 15.9.1.15 Date Time String Format.
            var isoDateExpression = new RegExp('^' +
                '(\\d{4}|[+-]\\d{6})' + // four-digit year capture or sign +
                // 6-digit extended year
                '(?:-(\\d{2})' + // optional month capture
                '(?:-(\\d{2})' + // optional day capture
                '(?:' + // capture hours:minutes:seconds.milliseconds
                'T(\\d{2})' + // hours capture
                ':(\\d{2})' + // minutes capture
                '(?:' + // optional :seconds.milliseconds
                ':(\\d{2})' + // seconds capture
                '(?:(\\.\\d{1,}))?' + // milliseconds capture
                ')?' +
                '(' + // capture UTC offset component
                'Z|' + // UTC capture
                '(?:' + // offset specifier +/-hours:minutes
                '([-+])' + // sign capture
                '(\\d{2})' + // hours offset capture
                ':(\\d{2})' + // minutes offset capture
                ')' +
                ')?)?)?)?' +
                '$');

            var months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];

            var dayFromMonth = function dayFromMonth(year, month) {
                var t = month > 1 ? 1 : 0;
                return (
                    months[month] +
                    Math.floor((year - 1969 + t) / 4) -
                    Math.floor((year - 1901 + t) / 100) +
                    Math.floor((year - 1601 + t) / 400) +
                    365 * (year - 1970)
                    );
            };

            var toUTC = function toUTC(t) {
                var s = 0;
                var ms = t;
                if (hasSafariSignedIntBug && ms > maxSafeUnsigned32Bit) {
                    // work around a Safari 8/9 bug where it treats the seconds as signed
                    var msToShift = Math.floor(ms / maxSafeUnsigned32Bit) * maxSafeUnsigned32Bit;
                    var sToShift = Math.floor(msToShift / 1e3);
                    s += sToShift;
                    ms -= sToShift * 1e3;
                }
                return $Number(new NativeDate(1970, 0, 1, 0, 0, s, ms));
            };

            // Copy any custom methods a 3rd party library may have added
            for (var key in NativeDate) {
                if (owns(NativeDate, key)) {
                    DateShim[key] = NativeDate[key];
                }
            }

            // Copy "native" methods explicitly; they may be non-enumerable
            defineProperties(DateShim, {
                now: NativeDate.now,
                UTC: NativeDate.UTC
            }, true);
            DateShim.prototype = NativeDate.prototype;
            defineProperties(DateShim.prototype, {
                constructor: DateShim
            }, true);

            // Upgrade Date.parse to handle simplified ISO 8601 strings
            var parseShim = function parse(string) {
                var match = isoDateExpression.exec(string);
                if (match) {
                    // parse months, days, hours, minutes, seconds, and milliseconds
                    // provide default values if necessary
                    // parse the UTC offset component
                    var year = $Number(match[1]),
                        month = $Number(match[2] || 1) - 1,
                        day = $Number(match[3] || 1) - 1,
                        hour = $Number(match[4] || 0),
                        minute = $Number(match[5] || 0),
                        second = $Number(match[6] || 0),
                        millisecond = Math.floor($Number(match[7] || 0) * 1000),
                    // When time zone is missed, local offset should be used
                    // (ES 5.1 bug)
                    // see https://bugs.ecmascript.org/show_bug.cgi?id=112
                        isLocalTime = Boolean(match[4] && !match[8]),
                        signOffset = match[9] === '-' ? 1 : -1,
                        hourOffset = $Number(match[10] || 0),
                        minuteOffset = $Number(match[11] || 0),
                        result;
                    var hasMinutesOrSecondsOrMilliseconds = minute > 0 || second > 0 || millisecond > 0;
                    if (
                        hour < (hasMinutesOrSecondsOrMilliseconds ? 24 : 25) &&
                        minute < 60 && second < 60 && millisecond < 1000 &&
                        month > -1 && month < 12 && hourOffset < 24 &&
                        minuteOffset < 60 && // detect invalid offsets
                        day > -1 &&
                        day < (dayFromMonth(year, month + 1) - dayFromMonth(year, month))
                        ) {
                        result = (
                            (dayFromMonth(year, month) + day) * 24 +
                            hour +
                            hourOffset * signOffset
                            ) * 60;
                        result = (
                            (result + minute + minuteOffset * signOffset) * 60 +
                            second
                            ) * 1000 + millisecond;
                        if (isLocalTime) {
                            result = toUTC(result);
                        }
                        if (-8.64e15 <= result && result <= 8.64e15) {
                            return result;
                        }
                    }
                    return NaN;
                }
                return NativeDate.parse.apply(this, arguments);
            };
            defineProperties(DateShim, { parse: parseShim });

            return DateShim;
        }(Date));
        /* global Date: false */
    }

// ES5 15.9.4.4
// http://es5.github.com/#x15.9.4.4
    if (!Date.now) {
        Date.now = function now() {
            return new Date().getTime();
        };
    }

//
// Number
// ======
//

// ES5.1 15.7.4.5
// http://es5.github.com/#x15.7.4.5
    var hasToFixedBugs = NumberPrototype.toFixed && (
        (0.00008).toFixed(3) !== '0.000' ||
        (0.9).toFixed(0) !== '1' ||
        (1.255).toFixed(2) !== '1.25' ||
        (1000000000000000128).toFixed(0) !== '1000000000000000128'
        );

    var toFixedHelpers = {
        base: 1e7,
        size: 6,
        data: [0, 0, 0, 0, 0, 0],
        multiply: function multiply(n, c) {
            var i = -1;
            var c2 = c;
            while (++i < toFixedHelpers.size) {
                c2 += n * toFixedHelpers.data[i];
                toFixedHelpers.data[i] = c2 % toFixedHelpers.base;
                c2 = Math.floor(c2 / toFixedHelpers.base);
            }
        },
        divide: function divide(n) {
            var i = toFixedHelpers.size;
            var c = 0;
            while (--i >= 0) {
                c += toFixedHelpers.data[i];
                toFixedHelpers.data[i] = Math.floor(c / n);
                c = (c % n) * toFixedHelpers.base;
            }
        },
        numToString: function numToString() {
            var i = toFixedHelpers.size;
            var s = '';
            while (--i >= 0) {
                if (s !== '' || i === 0 || toFixedHelpers.data[i] !== 0) {
                    var t = $String(toFixedHelpers.data[i]);
                    if (s === '') {
                        s = t;
                    } else {
                        s += strSlice('0000000', 0, 7 - t.length) + t;
                    }
                }
            }
            return s;
        },
        pow: function pow(x, n, acc) {
            return (n === 0 ? acc : (n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc)));
        },
        log: function log(x) {
            var n = 0;
            var x2 = x;
            while (x2 >= 4096) {
                n += 12;
                x2 /= 4096;
            }
            while (x2 >= 2) {
                n += 1;
                x2 /= 2;
            }
            return n;
        }
    };

    var toFixedShim = function toFixed(fractionDigits) {
        var f, x, s, m, e, z, j, k;

        // Test for NaN and round fractionDigits down
        f = $Number(fractionDigits);
        f = isActualNaN(f) ? 0 : Math.floor(f);

        if (f < 0 || f > 20) {
            throw new RangeError('Number.toFixed called with invalid number of decimals');
        }

        x = $Number(this);

        if (isActualNaN(x)) {
            return 'NaN';
        }

        // If it is too big or small, return the string value of the number
        if (x <= -1e21 || x >= 1e21) {
            return $String(x);
        }

        s = '';

        if (x < 0) {
            s = '-';
            x = -x;
        }

        m = '0';

        if (x > 1e-21) {
            // 1e-21 < x < 1e21
            // -70 < log2(x) < 70
            e = toFixedHelpers.log(x * toFixedHelpers.pow(2, 69, 1)) - 69;
            z = (e < 0 ? x * toFixedHelpers.pow(2, -e, 1) : x / toFixedHelpers.pow(2, e, 1));
            z *= 0x10000000000000; // Math.pow(2, 52);
            e = 52 - e;

            // -18 < e < 122
            // x = z / 2 ^ e
            if (e > 0) {
                toFixedHelpers.multiply(0, z);
                j = f;

                while (j >= 7) {
                    toFixedHelpers.multiply(1e7, 0);
                    j -= 7;
                }

                toFixedHelpers.multiply(toFixedHelpers.pow(10, j, 1), 0);
                j = e - 1;

                while (j >= 23) {
                    toFixedHelpers.divide(1 << 23);
                    j -= 23;
                }

                toFixedHelpers.divide(1 << j);
                toFixedHelpers.multiply(1, 1);
                toFixedHelpers.divide(2);
                m = toFixedHelpers.numToString();
            } else {
                toFixedHelpers.multiply(0, z);
                toFixedHelpers.multiply(1 << (-e), 0);
                m = toFixedHelpers.numToString() + strSlice('0.00000000000000000000', 2, 2 + f);
            }
        }

        if (f > 0) {
            k = m.length;

            if (k <= f) {
                m = s + strSlice('0.0000000000000000000', 0, f - k + 2) + m;
            } else {
                m = s + strSlice(m, 0, k - f) + '.' + strSlice(m, k - f);
            }
        } else {
            m = s + m;
        }

        return m;
    };
    defineProperties(NumberPrototype, { toFixed: toFixedShim }, hasToFixedBugs);

    var hasToPrecisionUndefinedBug = (function () {
        try {
            return 1.0.toPrecision(undefined) === '1';
        } catch (e) {
            return true;
        }
    }());
    var originalToPrecision = NumberPrototype.toPrecision;
    defineProperties(NumberPrototype, {
        toPrecision: function toPrecision(precision) {
            return typeof precision === 'undefined' ? originalToPrecision.call(this) : originalToPrecision.call(this, precision);
        }
    }, hasToPrecisionUndefinedBug);

//
// String
// ======
//

// ES5 15.5.4.14
// http://es5.github.com/#x15.5.4.14

// [bugfix, IE lt 9, firefox 4, Konqueror, Opera, obscure browsers]
// Many browsers do not split properly with regular expressions or they
// do not perform the split correctly under obscure conditions.
// See http://blog.stevenlevithan.com/archives/cross-browser-split
// I've tested in many browsers and this seems to cover the deviant ones:
//    'ab'.split(/(?:ab)*/) should be ["", ""], not [""]
//    '.'.split(/(.?)(.?)/) should be ["", ".", "", ""], not ["", ""]
//    'tesst'.split(/(s)*/) should be ["t", undefined, "e", "s", "t"], not
//       [undefined, "t", undefined, "e", ...]
//    ''.split(/.?/) should be [], not [""]
//    '.'.split(/()()/) should be ["."], not ["", "", "."]

    if (
        'ab'.split(/(?:ab)*/).length !== 2 ||
        '.'.split(/(.?)(.?)/).length !== 4 ||
        'tesst'.split(/(s)*/)[1] === 't' ||
        'test'.split(/(?:)/, -1).length !== 4 ||
        ''.split(/.?/).length ||
        '.'.split(/()()/).length > 1
        ) {
        (function () {
            var compliantExecNpcg = typeof (/()??/).exec('')[1] === 'undefined'; // NPCG: nonparticipating capturing group
            var maxSafe32BitInt = Math.pow(2, 32) - 1;

            StringPrototype.split = function (separator, limit) {
                var string = String(this);
                if (typeof separator === 'undefined' && limit === 0) {
                    return [];
                }

                // If `separator` is not a regex, use native split
                if (!isRegex(separator)) {
                    return strSplit(this, separator, limit);
                }

                var output = [];
                var flags = (separator.ignoreCase ? 'i' : '') +
                        (separator.multiline ? 'm' : '') +
                        (separator.unicode ? 'u' : '') + // in ES6
                        (separator.sticky ? 'y' : ''), // Firefox 3+ and ES6
                    lastLastIndex = 0,
                // Make `global` and avoid `lastIndex` issues by working with a copy
                    separator2, match, lastIndex, lastLength;
                var separatorCopy = new RegExp(separator.source, flags + 'g');
                if (!compliantExecNpcg) {
                    // Doesn't need flags gy, but they don't hurt
                    separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
                }
                /* Values for `limit`, per the spec:
                 * If undefined: 4294967295 // maxSafe32BitInt
                 * If 0, Infinity, or NaN: 0
                 * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
                 * If negative number: 4294967296 - Math.floor(Math.abs(limit))
                 * If other: Type-convert, then use the above rules
                 */
                var splitLimit = typeof limit === 'undefined' ? maxSafe32BitInt : ES.ToUint32(limit);
                match = separatorCopy.exec(string);
                while (match) {
                    // `separatorCopy.lastIndex` is not reliable cross-browser
                    lastIndex = match.index + match[0].length;
                    if (lastIndex > lastLastIndex) {
                        pushCall(output, strSlice(string, lastLastIndex, match.index));
                        // Fix browsers whose `exec` methods don't consistently return `undefined` for
                        // nonparticipating capturing groups
                        if (!compliantExecNpcg && match.length > 1) {
                            /* eslint-disable no-loop-func */
                            match[0].replace(separator2, function () {
                                for (var i = 1; i < arguments.length - 2; i++) {
                                    if (typeof arguments[i] === 'undefined') {
                                        match[i] = void 0;
                                    }
                                }
                            });
                            /* eslint-enable no-loop-func */
                        }
                        if (match.length > 1 && match.index < string.length) {
                            array_push.apply(output, arraySlice(match, 1));
                        }
                        lastLength = match[0].length;
                        lastLastIndex = lastIndex;
                        if (output.length >= splitLimit) {
                            break;
                        }
                    }
                    if (separatorCopy.lastIndex === match.index) {
                        separatorCopy.lastIndex++; // Avoid an infinite loop
                    }
                    match = separatorCopy.exec(string);
                }
                if (lastLastIndex === string.length) {
                    if (lastLength || !separatorCopy.test('')) {
                        pushCall(output, '');
                    }
                } else {
                    pushCall(output, strSlice(string, lastLastIndex));
                }
                return output.length > splitLimit ? arraySlice(output, 0, splitLimit) : output;
            };
        }());

// [bugfix, chrome]
// If separator is undefined, then the result array contains just one String,
// which is the this value (converted to a String). If limit is not undefined,
// then the output array is truncated so that it contains no more than limit
// elements.
// "0".split(undefined, 0) -> []
    } else if ('0'.split(void 0, 0).length) {
        StringPrototype.split = function split(separator, limit) {
            if (typeof separator === 'undefined' && limit === 0) { return []; }
            return strSplit(this, separator, limit);
        };
    }

    var str_replace = StringPrototype.replace;
    var replaceReportsGroupsCorrectly = (function () {
        var groups = [];
        'x'.replace(/x(.)?/g, function (match, group) {
            pushCall(groups, group);
        });
        return groups.length === 1 && typeof groups[0] === 'undefined';
    }());

    if (!replaceReportsGroupsCorrectly) {
        StringPrototype.replace = function replace(searchValue, replaceValue) {
            var isFn = isCallable(replaceValue);
            var hasCapturingGroups = isRegex(searchValue) && (/\)[*?]/).test(searchValue.source);
            if (!isFn || !hasCapturingGroups) {
                return str_replace.call(this, searchValue, replaceValue);
            } else {
                var wrappedReplaceValue = function (match) {
                    var length = arguments.length;
                    var originalLastIndex = searchValue.lastIndex;
                    searchValue.lastIndex = 0;
                    var args = searchValue.exec(match) || [];
                    searchValue.lastIndex = originalLastIndex;
                    pushCall(args, arguments[length - 2], arguments[length - 1]);
                    return replaceValue.apply(this, args);
                };
                return str_replace.call(this, searchValue, wrappedReplaceValue);
            }
        };
    }

// ECMA-262, 3rd B.2.3
// Not an ECMAScript standard, although ECMAScript 3rd Edition has a
// non-normative section suggesting uniform semantics and it should be
// normalized across all browsers
// [bugfix, IE lt 9] IE < 9 substr() with negative value not working in IE
    var string_substr = StringPrototype.substr;
    var hasNegativeSubstrBug = ''.substr && '0b'.substr(-1) !== 'b';
    defineProperties(StringPrototype, {
        substr: function substr(start, length) {
            var normalizedStart = start;
            if (start < 0) {
                normalizedStart = max(this.length + start, 0);
            }
            return string_substr.call(this, normalizedStart, length);
        }
    }, hasNegativeSubstrBug);

// ES5 15.5.4.20
// whitespace from: http://es5.github.io/#x15.5.4.20
    var ws = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
        '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028' +
        '\u2029\uFEFF';
    var zeroWidth = '\u200b';
    var wsRegexChars = '[' + ws + ']';
    var trimBeginRegexp = new RegExp('^' + wsRegexChars + wsRegexChars + '*');
    var trimEndRegexp = new RegExp(wsRegexChars + wsRegexChars + '*$');
    var hasTrimWhitespaceBug = StringPrototype.trim && (ws.trim() || !zeroWidth.trim());
    defineProperties(StringPrototype, {
        // http://blog.stevenlevithan.com/archives/faster-trim-javascript
        // http://perfectionkills.com/whitespace-deviations/
        trim: function trim() {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            return $String(this).replace(trimBeginRegexp, '').replace(trimEndRegexp, '');
        }
    }, hasTrimWhitespaceBug);
    var trim = call.bind(String.prototype.trim);

    var hasLastIndexBug = StringPrototype.lastIndexOf && 'abcあい'.lastIndexOf('あい', 2) !== -1;
    defineProperties(StringPrototype, {
        lastIndexOf: function lastIndexOf(searchString) {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            var S = $String(this);
            var searchStr = $String(searchString);
            var numPos = arguments.length > 1 ? $Number(arguments[1]) : NaN;
            var pos = isActualNaN(numPos) ? Infinity : ES.ToInteger(numPos);
            var start = min(max(pos, 0), S.length);
            var searchLen = searchStr.length;
            var k = start + searchLen;
            while (k > 0) {
                k = max(0, k - searchLen);
                var index = strIndexOf(strSlice(S, k, start + searchLen), searchStr);
                if (index !== -1) {
                    return k + index;
                }
            }
            return -1;
        }
    }, hasLastIndexBug);

    var originalLastIndexOf = StringPrototype.lastIndexOf;
    defineProperties(StringPrototype, {
        lastIndexOf: function lastIndexOf(searchString) {
            return originalLastIndexOf.apply(this, arguments);
        }
    }, StringPrototype.lastIndexOf.length !== 1);

// ES-5 15.1.2.2
    /* eslint-disable radix */
    if (parseInt(ws + '08') !== 8 || parseInt(ws + '0x16') !== 22) {
        /* eslint-enable radix */
        /* global parseInt: true */
        parseInt = (function (origParseInt) {
            var hexRegex = /^[\-+]?0[xX]/;
            return function parseInt(str, radix) {
                var string = trim(str);
                var defaultedRadix = $Number(radix) || (hexRegex.test(string) ? 16 : 10);
                return origParseInt(string, defaultedRadix);
            };
        }(parseInt));
    }

// https://es5.github.io/#x15.1.2.3
    if (1 / parseFloat('-0') !== -Infinity) {
        /* global parseFloat: true */
        parseFloat = (function (origParseFloat) {
            return function parseFloat(string) {
                var inputString = trim(string);
                var result = origParseFloat(inputString);
                return result === 0 && strSlice(inputString, 0, 1) === '-' ? -0 : result;
            };
        }(parseFloat));
    }

    if (String(new RangeError('test')) !== 'RangeError: test') {
        var errorToStringShim = function toString() {
            if (typeof this === 'undefined' || this === null) {
                throw new TypeError("can't convert " + this + ' to object');
            }
            var name = this.name;
            if (typeof name === 'undefined') {
                name = 'Error';
            } else if (typeof name !== 'string') {
                name = $String(name);
            }
            var msg = this.message;
            if (typeof msg === 'undefined') {
                msg = '';
            } else if (typeof msg !== 'string') {
                msg = $String(msg);
            }
            if (!name) {
                return msg;
            }
            if (!msg) {
                return name;
            }
            return name + ': ' + msg;
        };
        // can't use defineProperties here because of toString enumeration issue in IE <= 8
        Error.prototype.toString = errorToStringShim;
    }

    if (supportsDescriptors) {
        var ensureNonEnumerable = function (obj, prop) {
            if (isEnum(obj, prop)) {
                var desc = Object.getOwnPropertyDescriptor(obj, prop);
                desc.enumerable = false;
                Object.defineProperty(obj, prop, desc);
            }
        };
        ensureNonEnumerable(Error.prototype, 'message');
        if (Error.prototype.message !== '') {
            Error.prototype.message = '';
        }
        ensureNonEnumerable(Error.prototype, 'name');
    }

    if (String(/a/mig) !== '/a/gim') {
        var regexToString = function toString() {
            var str = '/' + this.source + '/';
            if (this.global) {
                str += 'g';
            }
            if (this.ignoreCase) {
                str += 'i';
            }
            if (this.multiline) {
                str += 'm';
            }
            return str;
        };
        // can't use defineProperties here because of toString enumeration issue in IE <= 8
        RegExp.prototype.toString = regexToString;
    }

}));
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
/**
 *
 *   @description: 该文件用于定义日志(工具)方法
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-07-27
 *
 *   @update-log :
 *                 1.0.1 - 义日志(工具)方法
 *                 1.0.2 - 修改了console工具的css
 *
 **/

(function (global) {

    'use strict';

    /**
     * @module base/console
     * @namespace Console
     * @property {function}  log                      - 以log形式输入日志
     * @property {function}  debug                    - 以debug形式输入日志
     * @property {function}  info                     - 以info形式输入日志
     * @property {function}  error                    - 以error形式输入日志
     * @property {function}  warn                     - 以warn形式输入日志
     *
     * @example
     *   var Console = require('base.console');
     *   Console.log('222');
     */
    var Console = {
        level: 'info',
        dateFormat: 'yyyyMMdd hh:mm:ss',
        DOM: null,
        line: '<p class="Console-line"></p>',
        tgt: '<div id="Console-log" style="opacity:0.7;position: fixed; top: 0;left:0; max-height: 105px;-webkit-overflow-scrolling:touch;overflow:auto;' +
            'line-height:1.5;z-index:999999;width:100%;font-size:11px;background:rgba(0,0,0,.8);color:#fff;bottom:0;' +
            '-webkit-user-select: initial;"></div>', //pointer-events:none;
        style: '<style>' +
            '.Console-line { margin-top:-1px;padding:.5em;border-top:1px solid rgba(255,255,255,.3);width:70% }' +
            ' .c_info .c_log { color:white; } .c_error { color:red; } .c_warn { color:yellow; } .c_debug { color:green; }' +
            ' </style>',
        inited: false
    };


    //业务对象
    var service = {};
    //内部工具类
    var util = {};

    //获取参数类型
    util.getType = function (t) {
        var _t, o = t;

        return ((_t = typeof (o)) === "object" ? o === null && "null" || Object.prototype.toString.call(o).slice(8, -1) : _t).toLowerCase();
    };

    //转换成指定模式的时间字符串
    util.DateFormat = function (date, format) {
        date=date||new Date();
        format=format || 'yyyyMMdd hh:mm:ss';
        var o = {
            "M+" : date.getMonth() + 1, // month
            "d+" : date.getDate(), // day
            "h+" : date.getHours(), // hour
            "m+" : date.getMinutes(), // minute
            "s+" : date.getSeconds(), // second
            "q+" : Math.floor((date.getMonth() + 3) / 3), // quarter
            "S" : date.getMilliseconds()
            // millisecond
        };
        try{
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
            }

            for (var k in o) {

                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k]
                        : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
        }catch(e){
            console.log(e);
        }

        return format;
    };

    //返回模板对象
    service.logObj = function (level) {
        var l = level || "INFO";
        var logobj = {
            timestamp : service.getTimestamp(),
            level : l
        };

        return logobj;
    };

    //生成输出标头
    service.applyData = function (data) {
        data.alisLevel = data.level.toUpperCase().substring(0, 1);
        var t = [/*'',data.timestamp,*/" [ ", data.level, ' ] '].join('');

        return t;
    };

    //获取当前时间戳字符串
    service.getTimestamp = function () {

        return util.DateFormat(new Date(), Console.dateFormat);
    };

    //添加html
    service.output = function (prefixObj, text1, text2) {

        if (typeof text1 !== 'undefined' && typeof text2 !== 'undefined') {
            console.log(text1, text2);

        } else if (typeof text1 !== 'undefined') {
            console.log(text1);
        }

        try {
            //如果没有创建过log容器，则初始化容器
            if (!Console.inited) {
                service.init();
            }
            var div = document.createElement('div');
            div.className = 'c_' + prefixObj.level.toLowerCase() || "c_info";
            var html = service.applyData(prefixObj) + " " + text1;

            if (typeof text2 !== 'undefined') {
                html += ', ' + text2;
            }
            div.innerHTML = html;

            if ($('.c_log').length > 0) {
                Console.DOM.insertBefore(div, $('.c_log')[0]);

            } else {
                Console.DOM.appendChild(div);
            }

        } catch (e) {
            console.log("exception :" + e);
        }
    };

    //业务初始化
    service.init = function () {

        if (!Console.inited) {
            var style = document.createElement("style");
            style.innerHTML = Console.style;
            document.body.appendChild(style);
            var div = document.createElement("div");
            div.innerHTML = Console.tgt;
            document.body.appendChild(div);
            Console.DOM = document.getElementById('Console-log');
            Console.inited = true;
        }
    };
    var leves=['LOG','DEBUG','INFO','ERROR','WARN'];
    for(var i=0;i<leves.length;i++){
        var l=leves[i];
        Console[l.toLowerCase()] = function (text1, text2) {
            var logs = service.logObj("LOG");
            service.output(logs, text1, text2);
        };

    }
    /**
     * @memberof Console
     * @summary 以log形式输入日志
     * @type {function}
     * @property text1                            - 需要打印的内容1
     * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
     */
    Console.log = function (text1, text2) {
        var logs = service.logObj("LOG");
        service.output(logs, text1, text2);
    };

    /**
     * @memberof Console
     * @summary 以log形式输入日志
     * @type {function}
     * @property text1                            - 需要打印的内容1
     * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
     */
    Console.debug = function (text1, text2) {
        var logs = service.logObj("DEBUG");
        service.output(logs, text1, text2);
    };

    /**
     * @memberof Console
     * @summary 以info形式输入日志
     * @type {function}
     * @property text1                            - 需要打印的内容1
     * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
     */
    Console.info = function (text1, text2) {
        var logs = service.logObj("INFO");
        service.output(logs, text1, text2);
    };

    /**
     * @memberof Console
     * @summary 以error形式输入日志
     * @type {function}
     * @property text1                            - 需要打印的内容1
     * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
     */
    Console.error = function (text1, text2) {
        var logs = service.logObj("ERROR");
        service.output(logs, text1, text2);
    };

    /**
     * @memberof Console
     * @summary 以warn形式输入日志
     * @type {function}
     * @property text1                            - 需要打印的内容1
     * @property text2                            - 需要打印的内容2,和内容1用逗号分隔
     */
    Console.warn = function (text1, text2) {
        var logs = service.logObj("WARN");
        service.output(logs, text1, text2);
    };

    window.Console = Console;
    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/console',function(require, exports, module) {
            module.exports = Console;
        })
    }

}(window));
/* global $:true */
/* global WebKitCSSMatrix:true */

(function($) {
     "use strict";
    ['width', 'height'].forEach(function(dimension) {
        var  Dimension = dimension.replace(/./, function(m) {
            return m[0].toUpperCase();
        });
        $.fn['outer' + Dimension] = function(margin) {
            var elem = this;
            if (elem) {
                var size = elem[dimension]();
                var sides = {
                    'width': ['left', 'right'],
                    'height': ['top', 'bottom']
                };
                sides[dimension].forEach(function(side) {
                    if (margin) size += parseInt(elem.css('margin-' + side), 10);
                });
                return size;
            } else {
                return null;
            }
        };
    });

    $.noop = function() {};
    $.fn.getQueryString=function(name) {
        var reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null) {
            return decodeURIComponent(r[2]);
        }
        return "";
    };
    //support
    $.support = (function() {
        var support = {
            touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
        return support;
    })();

    $.touchEvents = {
        start: $.support.touch ? 'touchstart' : 'mousedown',
        move: $.support.touch ? 'touchmove' : 'mousemove',
        end: $.support.touch ? 'touchend' : 'mouseup'
    };

    $.getTranslate = function (el, axis) {
      var matrix, curTransform, curStyle, transformMatrix;

      // automatic axis detection
      if (typeof axis === 'undefined') {
        axis = 'x';
      }

      curStyle = window.getComputedStyle(el, null);
      if (window.WebKitCSSMatrix) {
        // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case
        transformMatrix = new WebKitCSSMatrix(curStyle.webkitTransform === 'none' ? '' : curStyle.webkitTransform);
      }
      else {
        transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform  || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
        matrix = transformMatrix.toString().split(',');
      }

      if (axis === 'x') {
        //Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix)
          curTransform = transformMatrix.m41;
        //Crazy IE10 Matrix
        else if (matrix.length === 16)
          curTransform = parseFloat(matrix[12]);
        //Normal Browsers
        else
          curTransform = parseFloat(matrix[4]);
      }
      if (axis === 'y') {
        //Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix)
          curTransform = transformMatrix.m42;
        //Crazy IE10 Matrix
        else if (matrix.length === 16)
          curTransform = parseFloat(matrix[13]);
        //Normal Browsers
        else
          curTransform = parseFloat(matrix[5]);
      }

      return curTransform || 0;
    };
    $.requestAnimationFrame = function (callback) {
      if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
      else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
      else if (window.mozRequestAnimationFrame) return window.mozRequestAnimationFrame(callback);
      else {
        return window.setTimeout(callback, 1000 / 60);
      }
    };

    $.cancelAnimationFrame = function (id) {
      if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
      else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
      else if (window.mozCancelAnimationFrame) return window.mozCancelAnimationFrame(id);
      else {
        return window.clearTimeout(id);
      }  
    };


    $.fn.transitionEnd = function(callback) {
        var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i, dom = this;

        function fireCallBack(e) {
            /*jshint validthis:true */
            if (e.target !== this) return;
            callback.call(this, e);
            for (i = 0; i < events.length; i++) {
                dom.off(events[i], fireCallBack);
            }
        }
        if (callback) {
            for (i = 0; i < events.length; i++) {
                dom.on(events[i], fireCallBack);
            }
        }
        return this;
    };
    $.fn.dataset = function() {
        var el = this[0];
        if (el) {
            var dataset = {};
            if (el.dataset) {

                for (var dataKey in el.dataset) { // jshint ignore:line
                    dataset[dataKey] = el.dataset[dataKey];
                }
            } else {
                for (var i = 0; i < el.attributes.length; i++) {
                    var attr = el.attributes[i];
                    if (attr.name.indexOf('data-') >= 0) {
                        dataset[$.toCamelCase(attr.name.split('data-')[1])] = attr.value; //replace data
                    }
                }
            }
            for (var key in dataset) {
                if (dataset[key] === 'false') dataset[key] = false;
                else if (dataset[key] === 'true') dataset[key] = true;
                else if (parseFloat(dataset[key]) === dataset[key] * 1) dataset[key] = dataset[key] * 1;
            }
            return dataset;
        } else return undefined;
    };
    /**
     *
     * @param key
     * @param value
     * @returns {*}
     */
    $.fn.elData = function(key, value) {
        if (typeof value === 'undefined') {
            // Get value
            if (this[0] && this[0].getAttribute) {
                var dataKey = this[0].getAttribute('data-' + key);

                if (dataKey) {
                    return dataKey;
                } else if (this[0].smElementDataStorage && (key in this[0].smElementDataStorage)) {


                    return this[0].smElementDataStorage[key];

                } else {
                    return undefined;
                }
            } else return undefined;

        } else {
            // Set value
            for (var i = 0; i < this.length; i++) {
                var el = this[i];
                if (!el.smElementDataStorage) el.smElementDataStorage = {};
                el.smElementDataStorage[key] = value;
            }
            return this;
        }
    };
    /**
     *
     * @param el
     * @returns all attrs
     */
    $.fn.getDataSet=function(el){
        var dataset = {};
        try {
            if (el) {
                if(typeof(el)=='Array' && el.length>0){
                    el = el[0];
                }
                var dataJson = el.dataset || {}; //get all dataset
                var j = 0;
                if (dataJson && Object.keys(dataJson).length>0 ) {
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
                            dataset[k] = v;
                        }
                    }
                }
            }
            for (var key in dataset) {
                if (dataset[key] === 'false') dataset[key] = false;
                else if (dataset[key] === 'true') dataset[key] = true;
                else if (parseFloat(dataset[key]) === dataset[key] * 1) dataset[key] = dataset[key] * 1;
            }
        }catch(e){
            console.log(e)
        }
        return dataset;
    };

    $.fn.animationEnd = function(callback) {
        var events = ['webkitAnimationEnd', 'OAnimationEnd', 'MSAnimationEnd', 'animationend'],
            i, dom = this;

        function fireCallBack(e) {
            callback(e);
            for (i = 0; i < events.length; i++) {
                dom.off(events[i], fireCallBack);
            }
        }
        if (callback) {
            for (i = 0; i < events.length; i++) {
                dom.on(events[i], fireCallBack);
            }
        }
        return this;
    };
    $.fn.transition = function(duration) {
        if (typeof duration !== 'string') {
            duration = duration + 'ms';
        }
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransitionDuration = elStyle.MsTransitionDuration = elStyle.msTransitionDuration = elStyle.MozTransitionDuration = elStyle.OTransitionDuration = elStyle.transitionDuration = duration;
        }
        return this;
    };
    $.fn.transform = function(transform) {
        for (var i = 0; i < this.length; i++) {
            var elStyle = this[i].style;
            elStyle.webkitTransform = elStyle.MsTransform = elStyle.msTransform = elStyle.MozTransform = elStyle.OTransform = elStyle.transform = transform;
        }
        return this;
    };
    $.fn.prevAll = function (selector) {
      var prevEls = [];
      var el = this[0];
      if (!el) return $([]);
      while (el.previousElementSibling) {
        var prev = el.previousElementSibling;
        if (selector) {
          if($(prev).is(selector)) prevEls.push(prev);
        }
        else prevEls.push(prev);
        el = prev;
      }
      return $(prevEls);
    };
    $.fn.nextAll = function (selector) {
      var nextEls = [];
      var el = this[0];
      if (!el) return $([]);
      while (el.nextElementSibling) {
        var next = el.nextElementSibling;
        if (selector) {
          if($(next).is(selector)) nextEls.push(next);
        }
        else nextEls.push(next);
        el = next;
      }
      return $(nextEls);
    };

    //重置zepto的show方法，防止有些人引用的版本中 show 方法操作 opacity 属性影响动画执行
    $.fn.show = function(){
      var elementDisplay = {};
      function defaultDisplay(nodeName) {
        var element, display;
        if (!elementDisplay[nodeName]) {
          element = document.createElement(nodeName);
          document.body.appendChild(element);
          display = getComputedStyle(element, '').getPropertyValue("display");
          element.parentNode.removeChild(element);
          display === "none" && (display = "block");
          elementDisplay[nodeName] = display;
        }
        return elementDisplay[nodeName];
      }

      return this.each(function(){
        this.style.display === "none" && (this.style.display = '');
        if (getComputedStyle(this, '').getPropertyValue("display") === "none");
          this.style.display = defaultDisplay(this.nodeName);
      });
    };

    $.fn.scrollHeight = function() {
      return this[0].scrollHeight;
    };
})($);

(function (S) {

    'use strict';
    /*global process*/

    var win = window,
        doc = win.document,
        navigator = win.navigator,
        ua = navigator && navigator.userAgent || '';

    function numberify(s) {
        var c = 0;
        // convert '1.2.3.4' to 1.234
        return parseFloat(s.replace(/\./g, function () {
            return (c++ === 0) ? '.' : '';
        }));
    }

    function setTridentVersion(ua, UA) {
        var core, m;
        UA[core = 'trident'] = 0.1; // Trident detected, look for revision

        // Get the Trident's accurate version
        if ((m = ua.match(/Trident\/([\d.]*)/)) && m[1]) {
            UA[core] = numberify(m[1]);
        }

        UA.core = core;
    }

    function getIEVersion(ua) {
        var m, v;
        if ((m = ua.match(/MSIE ([^;]*)|Trident.*; rv(?:\s|:)?([0-9.]+)/)) &&
            (v = (m[1] || m[2]))) {
            return numberify(v);
        }
        return 0;
    }

    function getDescriptorFromUserAgent(ua) {
        var EMPTY = '',
            os,
            core = EMPTY,
            shell = EMPTY, m,
            IE_DETECT_RANGE = [6, 9],
            ieVersion,
            v,
            end,
            VERSION_PLACEHOLDER = '{{version}}',
            IE_DETECT_TPL = '<!--[if IE ' + VERSION_PLACEHOLDER + ']><' + 's></s><![endif]-->',
            div = doc && doc.createElement('div'),
            s = [];
        /**
         * svp UA
         * @class svp.UA
         * @singleton
         */
        var UA = {
            _ua:ua,
            /**
             * webkit version
             * @type undefined|Number
             * @member svp.UA
             */
            webkit: undefined,
            /**
             * trident version
             * @type undefined|Number
             * @member svp.UA
             */
            trident: undefined,
            /**
             * gecko version
             * @type undefined|Number
             * @member svp.UA
             */
            gecko: undefined,
            /**
             * presto version
             * @type undefined|Number
             * @member svp.UA
             */
            presto: undefined,
            /**
             * chrome version
             * @type undefined|Number
             * @member svp.UA
             */
            chrome: undefined,
            /**
             * safari version
             * @type undefined|Number
             * @member svp.UA
             */
            safari: undefined,
            /**
             * firefox version
             * @type undefined|Number
             * @member svp.UA
             */
            firefox: undefined,
            /**
             * ie version
             * @type undefined|Number
             * @member svp.UA
             */
            ie: undefined,
            /**
             * ie document mode
             * @type undefined|Number
             * @member svp.UA
             */
            ieMode: undefined,
            /**
             * opera version
             * @type undefined|Number
             * @member svp.UA
             */
            opera: undefined,
            /**
             * mobile browser. apple, android.
             * @type String
             * @member svp.UA
             */
            mobile: undefined,
            /**
             * browser render engine name. webkit, trident
             * @type String
             * @member svp.UA
             */
            core: undefined,
            /**
             * browser shell name. ie, chrome, firefox
             * @type String
             * @member svp.UA
             */
            shell: undefined,

            /**
             * PhantomJS version number
             * @type undefined|Number
             * @member svp.UA
             */
            phantomjs: undefined,

            /**
             * operating system. android, ios, linux, windows
             * @type string
             * @member svp.UA
             */
            os: undefined,

            /**
             * ipad ios version
             * @type Number
             * @member svp.UA
             */
            ipad: undefined,
            /**
             * iphone ios version
             * @type Number
             * @member svp.UA
             */
            iphone: undefined,
            /**
             * ipod ios
             * @type Number
             * @member svp.UA
             */
            ipod: undefined,
            /**
             * ios version
             * @type Number
             * @member svp.UA
             */
            ios: undefined,

            /**
             * android version
             * @type Number
             * @member svp.UA
             */
            android: undefined,

            /**
             * nodejs version
             * @type Number
             * @member svp.UA
             */
            nodejs: undefined
        };

        // ejecta
        if (div && div.getElementsByTagName) {
            // try to use IE-Conditional-Comment detect IE more accurately
            // IE10 doesn't support this method, @ref: http://blogs.msdn.com/b/ie/archive/2011/07/06/html5-parsing-in-ie10.aspx
            div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, '');
            s = div.getElementsByTagName('s');
        }

        if (s.length > 0) {

            setTridentVersion(ua, UA);

            // Detect the accurate version
            // 注意：
            //  UA.shell = ie, 表示外壳是 ie
            //  但 UA.ie = 7, 并不代表外壳是 ie7, 还有可能是 ie8 的兼容模式
            //  对于 ie8 的兼容模式，还要通过 documentMode 去判断。但此处不能让 UA.ie = 8, 否则
            //  很多脚本判断会失误。因为 ie8 的兼容模式表现行为和 ie7 相同，而不是和 ie8 相同
            for (v = IE_DETECT_RANGE[0], end = IE_DETECT_RANGE[1]; v <= end; v++) {
                div.innerHTML = IE_DETECT_TPL.replace(VERSION_PLACEHOLDER, v);
                if (s.length > 0) {
                    UA[shell = 'ie'] = v;
                    break;
                }
            }

            // https://github.com/svpteam/svp/issues/321
            // win8 embed app
            if (!UA.ie && (ieVersion = getIEVersion(ua))) {
                UA[shell = 'ie'] = ieVersion;
            }

        } else {
            // WebKit
            if ((m = ua.match(/AppleWebKit\/([\d.]*)/)) && m[1]) {
                UA[core = 'webkit'] = numberify(m[1]);

                if ((m = ua.match(/OPR\/(\d+\.\d+)/)) && m[1]) {
                    UA[shell = 'opera'] = numberify(m[1]);
                }
                // Chrome
                else if ((m = ua.match(/Chrome\/([\d.]*)/)) && m[1]) {
                    UA[shell = 'chrome'] = numberify(m[1]);
                }
                // Safari
                else if ((m = ua.match(/\/([\d.]*) Safari/)) && m[1]) {
                    UA[shell = 'safari'] = numberify(m[1]);
                }

                // Apple Mobile
                if (/ Mobile\//.test(ua) && ua.match(/iPad|iPod|iPhone/)) {
                    UA.mobile = 'apple'; // iPad, iPhone or iPod Touch

                    m = ua.match(/OS ([^\s]*)/);
                    if (m && m[1]) {
                        UA.ios = numberify(m[1].replace('_', '.'));
                    }
                    os = 'ios';
                    m = ua.match(/iPad|iPod|iPhone/);
                    if (m && m[0]) {
                        UA[m[0].toLowerCase()] = UA.ios;
                    }
                } else if (/ Android/i.test(ua)) {
                    if (/Mobile/.test(ua)) {
                        os = UA.mobile = 'android';
                    }
                    m = ua.match(/Android ([^\s]*);/);
                    if (m && m[1]) {
                        UA.android = numberify(m[1]);
                    }
                }
                // Other WebKit Mobile Browsers
                else if ((m = ua.match(/NokiaN[^\/]*|Android \d\.\d|webOS\/\d\.\d/))) {
                    UA.mobile = m[0].toLowerCase(); // Nokia N-series, Android, webOS, ex: NokiaN95
                }

                if ((m = ua.match(/PhantomJS\/([^\s]*)/)) && m[1]) {
                    UA.phantomjs = numberify(m[1]);
                }
            }
            // NOT WebKit
            else {
                // Presto
                // ref: http://www.useragentstring.com/pages/useragentstring.php
                if ((m = ua.match(/Presto\/([\d.]*)/)) && m[1]) {
                    UA[core = 'presto'] = numberify(m[1]);

                    // Opera
                    if ((m = ua.match(/Opera\/([\d.]*)/)) && m[1]) {
                        UA[shell = 'opera'] = numberify(m[1]); // Opera detected, look for revision

                        if ((m = ua.match(/Opera\/.* Version\/([\d.]*)/)) && m[1]) {
                            UA[shell] = numberify(m[1]);
                        }

                        // Opera Mini
                        if ((m = ua.match(/Opera Mini[^;]*/)) && m) {
                            UA.mobile = m[0].toLowerCase(); // ex: Opera Mini/2.0.4509/1316
                        }
                        // Opera Mobile
                        // ex: Opera/9.80 (Windows NT 6.1; Opera Mobi/49; U; en) Presto/2.4.18 Version/10.00
                        // issue: 由于 Opera Mobile 有 Version/ 字段，可能会与 Opera 混淆，同时对于 Opera Mobile 的版本号也比较混乱
                        else if ((m = ua.match(/Opera Mobi[^;]*/)) && m) {
                            UA.mobile = m[0];
                        }
                    }

                    // NOT WebKit or Presto
                } else {
                    // MSIE
                    // 由于最开始已经使用了 IE 条件注释判断，因此落到这里的唯一可能性只有 IE10+
                    // and analysis tools in nodejs
                    if ((ieVersion = getIEVersion(ua))) {
                        UA[shell = 'ie'] = ieVersion;
                        setTridentVersion(ua, UA);
                        // NOT WebKit, Presto or IE
                    } else {
                        // Gecko
                        if ((m = ua.match(/Gecko/))) {
                            UA[core = 'gecko'] = 0.1; // Gecko detected, look for revision
                            if ((m = ua.match(/rv:([\d.]*)/)) && m[1]) {
                                UA[core] = numberify(m[1]);
                                if (/Mobile|Tablet/.test(ua)) {
                                    UA.mobile = 'firefox';
                                }
                            }
                            // Firefox
                            if ((m = ua.match(/Firefox\/([\d.]*)/)) && m[1]) {
                                UA[shell = 'firefox'] = numberify(m[1]);
                            }
                        }
                    }
                }
            }
        }

        if (!os) {
            if ((/windows|win32/i).test(ua)) {
                os = 'windows';
            } else if ((/macintosh|mac_powerpc/i).test(ua)) {
                os = 'macintosh';
            } else if ((/linux/i).test(ua)) {
                os = 'linux';
            } else if ((/rhino/i).test(ua)) {
                os = 'rhino';
            }
        }

        UA.os = os;
        UA.core = UA.core || core;
        UA.shell = shell;
        UA.ieMode = UA.ie && doc.documentMode || UA.ie;

        return UA;
    }

    var UA = svp.UA = getDescriptorFromUserAgent(ua);

    // nodejs
    if (typeof process === 'object') {
        var versions, nodeVersion;

        if ((versions = process.versions) && (nodeVersion = versions.node)) {
            UA.os = process.platform;
            UA.nodejs = numberify(nodeVersion);
        }
    }

    // use by analysis tools in nodejs
    UA.getDescriptorFromUserAgent = getDescriptorFromUserAgent;
    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/ua',function(require, exports, module) {
            module.exports = UA;
        })
    }

})(svp);


/*===========================
Device/OS Detection
===========================*/
/* global $:true */
;(function ($) {
    "use strict";
    var device = {};
    var ua = navigator.userAgent;

    var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
    var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
    var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
    var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

    device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;
    
    // Android
    if (android) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
    }
    if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
    }
    // iOS
    if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
    }
    if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
    }
    if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
    }
    // iOS 8+ changed UA
    if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
            device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
    }

    // Webview
    device.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i);
        
    // Minimal UI
    if (device.os && device.os === 'ios') {
        var osVersionArr = device.osVersion.split('.');
        device.minimalUi = !device.webView &&
                            (ipod || iphone) &&
                            (osVersionArr[0] * 1 === 7 ? osVersionArr[1] * 1 >= 1 : osVersionArr[0] * 1 > 7) &&
                            $('meta[name="viewport"]').length > 0 && $('meta[name="viewport"]').attr('content').indexOf('minimal-ui') >= 0;
    }

    // Check for status bar and fullscreen app mode
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    device.statusBar = false;
    if (device.webView && (windowWidth * windowHeight === screen.width * screen.height)) {
        device.statusBar = true;
    }
    else {
        device.statusBar = false;
    }

    // Classes
    var classNames = [];

    // Pixel Ratio
    device.pixelRatio = window.devicePixelRatio || 1;
    classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
    if (device.pixelRatio >= 2) {
        classNames.push('retina');
    }

    // OS classes
    if (device.os) {
        classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
        if (device.os === 'ios') {
            var major = parseInt(device.osVersion.split('.')[0], 10);
            for (var i = major - 1; i >= 6; i--) {
                classNames.push('ios-gt-' + i);
            }
        }
        
    }
    // Status bar classes
    if (device.statusBar) {
        classNames.push('with-statusbar-overlay');
    }
    else {
        $('html').removeClass('with-statusbar-overlay');
    }

    // Add html classes
    if (classNames.length > 0) $('html').addClass(classNames.join(' '));

    $.device = device;

    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/device',function(require, exports, module) {
            module.exports = $.device;
        })
    }
})($);

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
/**
 *
 *   @description: 该文件用于定义特殊名单列表
 *
 * */

(function (global) {
    'use strict';
    /**
     * @module base.cookie
     * @namespace Cookie
     * @property {boolean} isEnabled                    - 是否支持Cookie
     * @property {function} set                         - 设置Cookie
     * @property {function} get                         - 读取指定的Cookie
     * @property {function} del                         - 删除指定的Cookie
     * @property {function} test                        - 测试浏览器是否支持Cookie
     * @property {function} serialize                   - 将对象转换成字符串
     * @property {function} deserialize                 - 将字符串转换成对象
     * @property {function} setSession                  - 设置sessionStorage
     * @property {function} getSession                  - 获取sessionStorage
     */
    var Cookie = {

        /**
         * @memberof Cookie
         * @summary 是否支持Cookie
         * @type {boolean}
         */
        isEnabled: false,

        /**
         * @memberof Cookie
         * @summary 设置Cookie
         * @type {function}
         * @param {String} name 要设置的Cookie名称
         * @param {String} value 要设置的Cookie值
         * @param {Int} expire 过期时间，单位是小时
         * @param {String} domain 域，默认为本域
         */
        set: function (name, value, expire, domain) {
            var expires = '';

            if (0 !== expire) {
                var t = new Date();
                t.setTime(t.getTime() + (expire || 24) * 3600000);
                expires = ';expires=' + t.toGMTString();
            }
            var s = encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + ';path=/' + (domain ? (';domain=' + domain) : '');
            document.cookie = s;

            return true;
        },

        /**
         * @memberof Cookie
         * @summary 读取指定的Cookie
         * @type {function}
         * @param {String} name 要获取的Cookie名称
         * @return {String} 对应的Cookie值，如果不存在，返回{null}
         */
        get: function (name) {
            var arrCookie = document.cookie.split(';'),
                arrS;
            for (var i = 0; i < arrCookie.length; i++) {
                var item = arrCookie[i];
                var index = item.indexOf('=');
                var cName = item.substr(0, index);
                var cValue = item.substr(index + 1);
                if (cName.trim() === name) {
                    return decodeURIComponent(cValue);
                }
            }
            return '';
        },

        /**
         * @memberof Cookie
         * @summary 删除指定的Cookie
         * @type {function}
         * @param {String} name 要获取的Cookie名称
         * @param {String} domain 域，默认为本域
         * @param {String} path 路径
         */
        del: function (name, domain, path) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            document.cookie = name + '=; expires=' + exp.toGMTString() + ';' + (path ? ('path=' + path + '; ') : 'path=/; ') + (domain ? ('domain=' + domain + ';') : ('domain=;'));
        },

        /**
         * @memberof Cookie
         * @summary 测试浏览器是否支持Cookie, 如果浏览器支持Cookie,Cookie.isEnabled的值为TRUE,不支持Cookie.isEnabled的值为FALSE
         * @type {function}
         * @return {boolean}
         */
        test: function () {
            var testKey = '_c_t_';
            this.set(testKey, '1');
            this.isEnabled = ('1' === this.get(testKey));
            this.del(testKey);

            return this.isEnabled;
        },

        /**
         * @memberof Cookie
         * @summary 将对象转换成字符串
         * @type {function}
         * @param {object} value                            - 数据对象
         * @return {string}
         */
        serialize: function (value) {

            return JSON.stringify(value);
        },

        /**
         * @memberof Cookie
         * @summary 将字符串转换成对象
         * @type {function}
         * @param {string} value                            - 数据字符串
         * @return {object|undefined}                       - 返回对象，出错时返回undefined
         */
        deserialize: function (value) {

            if (typeof value !== 'string') {

                return value;
            }

            try {

                return JSON.parse(value);

            } catch (e) {

                return value || {};
            }
        },

        /**
         * @memberof Cookie
         * @summary 设置sessionStorage
         * @type {function}
         * @param {string} name                             - 参数名称
         * @param {string} value                            - 参数值
         */
        setSession: function (name, value) {

            try {

                if (!!window.sessionStorage) {
                    window.sessionStorage.setItem(name, this.serialize(value));
                }

            } catch (e) {
                console.log('not support session', e);
                this.set(name, this.serialize(value), 24);
            }
        },

        /**
         * @memberof Cookie
         * @summary 获取sessionStorage
         * @type {function}
         * @param {string} name                             - 参数名称
         * @return {string}
         */
        getSession: function (name) {
            var sRet = '';

            try {

                if (!!window.sessionStorage) {
                    sRet = this.deserialize(window.sessionStorage.getItem(name));
                }

            } catch (e) {
                console.log('not support session', e);
                sRet = this.deserialize(this.get(name));
            }

            return sRet;
        },

        //substr domin last 2 chars
        gMD : function (d) {
            var u;
            
            if (d === u || d === null) {

                return null;
            }
            var i = d.length,
                s;
            
            if (d.charAt(i - 3) === '.') {
                s = d.lastIndexOf('.', d.lastIndexOf('.', i -= (d.indexOf('.com.') > 0) ? 8 : 4));
            
            } else {
                s = d.lastIndexOf('.', d.lastIndexOf('.') - 1);
            }
            s = (s === -1) ? 0 : ++s;

            return d.substring(s);
        },
        randomUid: function () {
             return new Date().getTime();
        },
        _init: function () {
            var domain = document.domain || '127.0.0.1';
            if(this.get('_UID_')) {
                Cookie.set('_UID_', this.randomUid(), 30*86400, domain); //month
            }
        }
    };
    Cookie._init();

    window.Cookie = Cookie;
    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/cookie',function(require, exports, module) {
            module.exports = Cookie;
        })
    }

}(window));
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

/**
 *
 *   @description: 该文件用于定义localStorage工具类
 *
 *   @version    : 1.0.1
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-03-25
 *
 *   @update-log :
 *                 1.0.1 - localStorage工具类
 *
 **/
(function (global) {
	  
  'use strict';
  
  /**
   * @module base.store
   * @namespace store
   * @property {function}  set                      - 设置存储项的键和相应的值
   * @property {function}  get                      - 根据键读取相应的键值
   * @property {function}  remove                   - 清除指定键值对
   * @property {function}  clearAll                 - 清除所有键值对
   * @property {function}  getAll                   - 返回由所有键值对组成的对象
   * @property {function}  forEach                  - 遍历所有键值对，以每个键和键值为参数执行传入的callback函数
   */
   
  var store = {},
      win = window,
      doc = document,
      localStorageName = 'localStorage',
      scriptTag = 'script',
      storage;

  try {
    storage = win[localStorageName];
  
  } catch (e) {}

  var noop = function () {};

  store.disabled = false;

  store.set = noop;

  store.get = noop;

  store.remove = noop;

  store.clear = noop;

  store.transact = function (key, defaultVal, transactionFn) {
    var val = store.get(key);
    
    if (transactionFn === null) {
      transactionFn = defaultVal;
      defaultVal = null;
    }

    if (typeof val === 'undefined') {
      val = defaultVal || {};
    }
    transactionFn(val);
    store.set(key, val);
  };

  store.getAll = function () {};

  store.forEach = function () {};

  store.serialize = function (value) {
    
    return JSON.stringify(value);
  };

  store.deserialize = function (value) {
    
    if (typeof value !== 'string') {
      return undefined;
    }

    try {

      return JSON.parse(value);

    } catch (e) {
      
      return value || undefined;
    }
  };

  // Functions to encapsulate questionable FireFox 3.6.13 behavior
  // when about.config::dom.storage.enabled === false
  // See https://github.com/marcuswestin/store.js/issues#issue/13
  var isLocalStorageNameSupported = function () {
    try {

      return (localStorageName in win && win[localStorageName]);
    
    } catch (err) {
      
      return false;
    }
  };

  if (isLocalStorageNameSupported()) {
    storage = win[localStorageName];

    /**
     * @memberof store
     * @summary 设置存储项的键和相应的值
     * @type {function}
     * @param {string} key                        - 键
     * @param {string} val                        - 值
     * @return {string}           				  - 返回设置的键值
     */
    store.set = function (key, val) {
      
      if (val === undefined) {
        
        return store.remove(key);
      }
      storage.setItem(key, store.serialize(val));
      
      return val;
    };

    /**
     * @memberof store
     * @summary 根据键读取相应的键值
     * @type {function}
     * @param {string} key                        - 键
     * @return {object|array|undefined}           - 返回键对应的键值，可能是已被解析过的对象、字符串或undefined
     */
    store.get = function (key) {

      return store.deserialize(storage.getItem(key));
    };

   /**
     * @memberof store
     * @summary 清除指定键值对
     * @type {function}
     * @param {string} key                        - 键
     */
    store.remove = function (key) {
      storage.removeItem(key);
    };

   	/**
     * @memberof store
     * @summary 清除所有键值对
     * @type {function}
     */
    store.clearAll = function () {
      storage.clear();
    };

   /**
   * @namespace store
   * @property {function} forEach                 - 遍历所有键值对，以每个键和键值为参数执行传入的callback函数
   * @param {string} callback                     - 将要以每个键和键值为参数执行的函数
   */
    store.forEach = function (callback) {
      
      for (var i = 0; i < storage.length; i++) {
        var key = storage.key(i);
        callback(key, store.get(key));
      }
    };
  
  } else if (doc.documentElement.addBehavior) {
    var storageOwner,
      storageContainer;

    try {
      storageContainer = new ActiveXObject('htmlfile');
      storageContainer.open();

      var writeStr = '<' + scriptTag + '>document.w=window</' + scriptTag + '>';
      writeStr += '<iframe src="/favicon.ico"></iframe>';
     
      storageContainer.write(writeStr);
      storageContainer.close();
      storageOwner = storageContainer.w.frames[0].document;
      storage = storageOwner.createElement('div');
    
    } catch (e) {
      // somehow ActiveXObject instantiation failed (perhaps some special
      // security settings or otherwse), fall back to per-path storage
      storage = doc.createElement('div');
      storageOwner = doc.body;
    }

    var withIEStorage = function (storeFunction) {
      
      var rst = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(storage);
        // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
        // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
        storageOwner.appendChild(storage);
        storage.addBehavior('#default#userData');
        storage.load(localStorageName);
        var result = storeFunction.apply(store, args);
        storageOwner.removeChild(storage);
        return result;
      };

      return rst;
    };

    // In IE7, keys cannot start with a digit or contain certain chars.
    // See https://github.com/marcuswestin/store.js/issues/40
    // See https://github.com/marcuswestin/store.js/issues/83
    var forbiddenCharsRegex = new RegExp("[!\"#$%&'()*+,/\\\\:;<=>?@[\\]^`{|}~]", "g");
    
    var ieKeyFix = function (key) {
      
      return key.replace(/^d/, '___$&').replace(forbiddenCharsRegex, '___');
    };

    store.set = withIEStorage(function (storage, key, val) {
      key = ieKeyFix(key);
      
      if (val === undefined) {
        
        return store.remove(key);
      }
      storage.setAttribute(key, store.serialize(val));
      storage.save(localStorageName);
      
      return val;
    });

    store.get = withIEStorage(function (storage, key) {
      key = ieKeyFix(key);

      return store.deserialize(storage.getAttribute(key));
    });

    store.remove = withIEStorage(function (storage, key) {
      key = ieKeyFix(key);
      storage.removeAttribute(key);
      storage.save(localStorageName);
    });

    store.clear = withIEStorage(function (storage) {
      var attributes = storage.XMLDocument.documentElement.attributes;
      storage.load(localStorageName);

      for (var i = 0, l = attributes.length; i < l; i++) {
        var attr = attributes[i];
        storage.removeAttribute(attr.name);
      }
      storage.save(localStorageName);
    });

    store.forEach = withIEStorage(function (storage, callback) {
      var attributes = storage.XMLDocument.documentElement.attributes;
      
      for (var i = 0, l = attributes.length; i < l; i++) {
        var attr = attributes[i];
        callback(attr.name, store.deserialize(storage.getAttribute(attr.name)));
      }
    });
  }

	 /**
	* @memberof store
	* @summary 读取所有的键值对
	* @type {function}
	* @return {object}                           - 返回由所有键值对组成的对象
	*/
	store.getAll = function () {
	  var ret = {};
	  
	  store.forEach(function (key, val) {
	    ret[key] = val;
	  });

	  return ret;
	};

  try {
    var testKey = '__storejs__';
    store.set(testKey, testKey);

    if (store.get(testKey) !== testKey) {
      store.disabled = true;
    }
    store.remove(testKey);

  } catch (e) {
    store.disabled = true;
  }
  store.enabled = !store.disabled;

/*  if (typeof module !== 'undefined' && module.exports && this.module !== module) {
      module.exports = store;

    } else if (typeof define === 'function' && define.amd) {
      define(store);
    }*/

  //兼容老版本
  store.getStorage = function () {
    try {
      /* 在Android 4.0下，如果webview没有打开localStorage支持，在读取localStorage对象的时候会导致js运行出错，所以要放在try{}catch{}中 */
      storage = win[localStorageName];
    
    } catch (e) {
      console.log('localStorage is not supported');
    }
    
    return storage;
  };

  /**
  * 清除本地存贮数据
  * @param {String} prefix 可选，如果包含此参数，则只删除包含此前缀的项，否则清除全部缓存
  */
  store.clear = function (prefix) {
    var storage = store.getStorage();

    if (storage) {
      
      if (prefix) {
        
        for (var key in storage) {
          
          if (0 === key.indexOf(prefix)) {
            storage.removeItem(key);
          }
        }

      } else {
        storage.clear();
      }
    }
  };
  
  window.Store = store;

    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/localStorage',function(require, exports, module) {
            module.exports = store;
        })
    }
}(window));
/**
 * 参考iscroll lite (5.1.3)改的,别升级;代码改动过
 * zhouguoqing 20160512
 */

!(function ($) {

var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };


/*
 * 工具类
 */
var utils = (function () {

	var me = {};

	var _elementStyle = document.createElement('div').style;

	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}
		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}


	me.getTime = Date.now || function getTime () { return new Date().getTime(); };


	me.extend = function (target, obj) {
		for ( var i in obj ) {
			target[i] = obj[i];
		}
	};


	me.addEvent = function (el, type, fn, capture) {
		el.addEventListener(type, fn, !!capture);	
	};


	me.removeEvent = function (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	};


	me.prefixPointerEvent = function (pointerEvent) {
		return window.MSPointerEvent ? 
			'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10):
			pointerEvent;
	};


	/**
     * 根据一定时间内的滑动距离计算出最终停止距离和时间。
     * @param current：当前滑动位置
     * @param start：touchStart 时候记录的开始位置，但是在touchmove时候可能被重写
     * @param time：touchstart 到手指离开时候经历的时间，同样可能被touchmove重写
     * @param lowerMargin：可移动的最大距离，这个一般为计算得出 this.wrapperHeight - this.scrollerHeight
     * @param wrapperSize：如果有边界距离的话就是可拖动，不然碰到0的时候便停止
     * @param deceleration：匀减速
     * @returns {{destination: number, duration: number}}
     */
	me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration;

		deceleration = deceleration === undefined ? 0.0006 : deceleration;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
			distance = Math.abs(current) + destination;
			duration = distance / speed;
		}

		return {
			destination: Math.round(destination),
			duration: duration
		};
	};

	var _transform = _prefixStyle('transform');

	me.extend(me, {
		hasTransform: _transform !== false,
		hasPerspective: _prefixStyle('perspective') in _elementStyle,
		hasTouch: 'ontouchstart' in window,
		hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
		hasTransition: _prefixStyle('transition') in _elementStyle
	});

	// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

	me.extend(me.style = {}, {
		transform: _transform,
		transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
		transitionDuration: _prefixStyle('transitionDuration'),
		transitionDelay: _prefixStyle('transitionDelay'),
		transformOrigin: _prefixStyle('transformOrigin'),
		transitionProperty: _prefixStyle('transitionProperty')
	});


	me.offset = function (el) {
		var left = -el.offsetLeft,
			top = -el.offsetTop;

		while (el = el.offsetParent) {
			left -= el.offsetLeft;
			top -= el.offsetTop;
		}
		return {
			left: left,
			top: top
		};
	};


	/* 
	 * 配合 config 里面的 preventDefaultException 属性
	 * 不对匹配到的 element 使用 e.preventDefault()
	 * 默认阻止所有事件的冒泡，包括 click 或 tap
	 */
	me.preventDefaultException = function (el, exceptions) {
		for ( var i in exceptions ) {
			if ( exceptions[i].test(el[i]) ) {
				return true;
			}
		}
		return false;
	};


	me.extend(me.eventType = {}, {
		touchstart: 1,
		touchmove: 1,
		touchend: 1,

		mousedown: 2,
		mousemove: 2,
		mouseup: 2,

		pointerdown: 3,
		pointermove: 3,
		pointerup: 3,

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	});


	me.extend(me.ease = {}, {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
			}
		}
	});

	me.tap = function (e, eventName) {
		var ev = document.createEvent('Event');
		ev.initEvent(eventName, true, true);
		ev.pageX = e.pageX;
		ev.pageY = e.pageY;
		e.target.dispatchEvent(ev);
	};

	me.click = function (e) {
		var target = e.target,
			ev;
		if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);

			ev._constructed = true;
			target.dispatchEvent(ev);
		}
	};

	return me;
})();



/*
 * iScroll 构造函数
 * this.options.role = ''|tab|slider
 */
function Scroll(el, options) {

	this.wrapper = typeof el == 'string' ? $(el)[0] : el;

	this.options = {
		startX: 0,					// 初始化 X 坐标
		startY: 0,					// 初始化 Y 坐标
		scrollY: true,				// 竖向滚动
		scrollX: false,				// 默认非水平
		directionLockThreshold: 5,	// 确定滚动方向的阈值
		momentum: true,				// 是否开启惯性滚动

		duration: 300,				// transition 过渡时间

		bounce: true,				// 是否有反弹动画
		bounceTime: 600,			// 反弹动画时间
		bounceEasing: '',			// 反弹动画类型：'circular'(default), 'quadratic', 'back', 'bounce', 'elastic'

		preventDefault: true,		// 是否阻止默认滚动事件（和冒泡有区别）
		eventPassthrough: true,		// 穿透，是否触发原生滑动（取值 true、false、vertical、horizental）

		freeScroll: false,			// 任意方向的滚动。若 scrollX 和 scrollY 同时开启，则相当于 freeScroll

	    bindToWrapper : true,		// 事件是否绑定到 wrapper 元素上，否则大部分绑定到 window（若存在嵌套，则绑定在元素上最好）
    	resizePolling : 60,			// resize 时候隔 60ms 就执行 refresh 方法重新获取位置信息(事件节流)
    	
    	disableMouse : false,		// 是否禁用鼠标
	    disableTouch : false,		// 是否禁用touch事件
	    disablePointer : false,		// 是否禁用win系统的pointer事件

		tap: true,					// 是否模拟 tap 事件
		click: false,				// 是否模拟点击事件（false 则使用原生click事件）

		preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ }, // 当遇到正则内的元素则不阻止冒泡

		HWCompositing: true, 		// Hardware acceleration
		useTransition: true,		// Transition || requestAnimationFrame
		useTransform: true			// Translate || Left/Top
	};


	for ( var i in options ) {
		this.options[i] = options[i];
	}


	// scroller
	// ==================================

	if (!this.options.role && this.options.scrollX === false) {
		this.options.eventPassthrough = 'horizontal';	// 竖直滚动的 scroller 不拦截横向原生滚动
	}

	// slide
	// ==================================

	if (this.options.role === 'slider') {

		this.options.scrollX = true;
		this.options.scrollY = false;
		this.options.momentum = false;

		this.scroller = $('.ui-slider-content',this.wrapper)[0];
		$(this.scroller.children[0]).addClass('current');

		this.currentPage = 0;
		this.count = this.scroller.children.length;

		this.scroller.style.width = this.count+"00%";

		this.itemWidth = this.scroller.children[0].clientWidth;
		this.scrollWidth = this.itemWidth * this.count;

		

		if (this.options.indicator) {
			var temp = '<ul class="ui-slider-indicators">';

			for (var i=1; i<=this.count; i++) {
				if (i===1) {
					temp += '<li class="current">'+i+'</li>';
				}
				else {
					temp += '<li>'+i+'</li>';
				}
			}
			temp += '</ul>';
			$(this.wrapper).append(temp);
			this.indicator = $('.ui-slider-indicators',this.wrapper)[0];
		}
	}


	// tab
	// ==================================

	else if (this.options.role === 'tab') {

		this.options.scrollX = true;
		this.options.scrollY = false;
		this.options.momentum = false;

		this.scroller = $('.ui-tab-content',this.wrapper)[0];
		this.nav = $('.ui-tab-nav',this.wrapper)[0];

		$(this.scroller.children[0]).addClass('current');
		$(this.nav.children[0]).addClass('current');

		this.currentPage = 0;
		this.count = this.scroller.children.length;

		this.scroller.style.width = this.count+"00%";

		this.itemWidth = this.scroller.children[0].clientWidth;
		this.scrollWidth = this.itemWidth * this.count;


	}
	else {
        this.currentPage = 0;
		this.scroller = this.wrapper.children[0];
	}
	this.scrollerStyle = this.scroller.style;


	this.translateZ = utils.hasPerspective && this.options.HWCompositing ? ' translateZ(0)' : '';
	this.options.useTransition = utils.hasTransition && this.options.useTransition;
	this.options.useTransform = utils.hasTransform && this.options.useTransform;
	this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
	this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;
	// If you want eventPassthrough I have to lock one of the axes
	this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;
	this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
	// With eventPassthrough we also need lockDirection mechanism
	this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
	this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;
	this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;
	this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

	if (this.options.tap === true) {
		this.options.tap = 'tap';
	}
	if (this.options.useTransform === false) {
		this.scroller.style.position = 'relative';
	}

	// Some defaults
	this.x = 0;
	this.y = 0;
	this.directionX = 0;
	this.directionY = 0;
	this._events = {};

	this._init();	// 绑定各种事件
	this.refresh();

	this.scrollTo(this.options.startX, this.options.startY);
	this.enable();

	// 自动播放
	if (this.options.autoplay) {
		var context = this;
		this.options.interval = this.options.interval || 2000;
		this.options.flag = setTimeout(function(){
			context._autoplay.apply(context)
		}, context.options.interval);
	}
}

    /**
     *
     * @type {{  _init: _init, destroy: destroy, _transitionEnd: _transitionEnd,
     * _start: _start, _move: _move, _end: _end, _resize: _resize,
     * resetPosition: resetPosition, disable: disable, enable: enable,
     * refresh: refresh, on: on, off: off, _execEvent: _execEvent,
     * scrollBy: scrollBy, scrollTo: scrollTo, scrollToElement: scrollToElement,
      * _transitionTime: _transitionTime, _transitionTimingFunction: _transitionTimingFunction,
       * _translate: _translate, _initEvents: _initEvents, getComputedPosition: getComputedPosition,
       * _animate: _animate, handleEvent: handleEvent }}
     */

Scroll.prototype = {
    //se iScroll  '5.1.3',
    version: '5.1.3',
	_init: function () {
		this._initEvents();
	},

	_initEvents: function (remove) {
		var eventType = remove ? utils.removeEvent : utils.addEvent,
			target = this.options.bindToWrapper ? this.wrapper : window;

		/*
		 * 给 addEventListener 传递 this
		 * 程序会自动找到 handleEvent 方法作为回调函数
		 */
		eventType(window, 'orientationchange', this);
		eventType(window, 'resize', this);

		if ( this.options.click ) {
			eventType(this.wrapper, 'click', this, true);
		}

		if ( !this.options.disableMouse ) {
			eventType(this.wrapper, 'mousedown', this);
			eventType(target, 'mousemove', this);
			eventType(target, 'mousecancel', this);
			eventType(target, 'mouseup', this);
		}

		if ( utils.hasPointer && !this.options.disablePointer ) {
			eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
			eventType(target, utils.prefixPointerEvent('pointermove'), this);
			eventType(target, utils.prefixPointerEvent('pointercancel'), this);
			eventType(target, utils.prefixPointerEvent('pointerup'), this);
		}

		if ( utils.hasTouch && !this.options.disableTouch ) {
			eventType(this.wrapper, 'touchstart', this);
			eventType(target, 'touchmove', this);
			eventType(target, 'touchcancel', this);
			eventType(target, 'touchend', this);
		}

		eventType(this.scroller, 'transitionend', this);
		eventType(this.scroller, 'webkitTransitionEnd', this);
		eventType(this.scroller, 'oTransitionEnd', this);
		eventType(this.scroller, 'MSTransitionEnd', this);

		// tab
		// =============================
		if (this.options.role === 'tab') {
			eventType(this.nav, 'touchend', this);
			eventType(this.nav, 'mouseup', this);
			eventType(this.nav, 'pointerup', this);
		}
	},

	
	refresh: function () {
		var rf = this.wrapper.offsetHeight;	// Force reflow

		// http://jsfiddle.net/y8Y32/25/
		// clientWidth = content + padding
		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;


		// 添加 wrapper 的 padding 值到 scroller 身上，更符合使用预期
		var matrix = window.getComputedStyle(this.wrapper, null); 
		var pt = matrix['padding-top'].replace(/[^-\d.]/g, ''),
			pb = matrix['padding-bottom'].replace(/[^-\d.]/g, ''),
			pl = matrix['padding-left'].replace(/[^-\d.]/g, ''),
			pr = matrix['padding-right'].replace(/[^-\d.]/g, '');

		var matrix2 = window.getComputedStyle(this.scroller, null);
		var	mt2 = matrix2['margin-top'].replace(/[^-\d.]/g, ''),
			mb2 = matrix2['margin-bottom'].replace(/[^-\d.]/g, ''),
			ml2 = matrix2['margin-left'].replace(/[^-\d.]/g, ''),
			mr2 = matrix2['margin-right'].replace(/[^-\d.]/g, '');
        try{
            pl=parseInt(pl), pr=parseInt(pr), ml2=parseInt(ml2), mr2=parseInt(mr2);
            pt=parseInt(pt), pb=parseInt(pb), mt2=parseInt(mt2), mb2=parseInt(mb2);
        }catch(e){
            console.log(e);
        }

		// offsetWidth = content + padding + border
		this.scrollerWidth	= this.scroller.offsetWidth +pl+pr+ml2+mr2;
		this.scrollerHeight	= this.scroller.offsetHeight+pt+pb+mt2+mb2;


		// slide
		// ==================================
		if (this.options.role === 'slider' || this.options.role === 'tab') {
			this.itemWidth = this.scroller.children[0].clientWidth;
            this.scrollWidth = this.itemWidth * this.count;
			this.scrollerWidth = this.scrollWidth;
		}

		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

		if ( !this.hasHorizontalScroll ) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if ( !this.hasVerticalScroll ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;

		this.wrapperOffset = utils.offset(this.wrapper);
        if(this.options.role !== 'slider' && this.options.role !== 'tab') {
            this._execEvent('refresh');
        }
        this.resetPosition();
	},
	
	
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'pointerdown':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'pointermove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'pointerup':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'pointercancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
			case 'orientationchange':
			case 'resize':
				this._resize();
				break;
			case 'transitionend':
			case 'webkitTransitionEnd':
			case 'oTransitionEnd':
			case 'MSTransitionEnd':
				this._transitionEnd(e);
				break;
			case 'wheel':
			case 'DOMMouseScroll':
			case 'mousewheel':
				this._wheel(e);
				break;
			case 'keydown':
				this._key(e);
				break;
			case 'click':
				if ( !e._constructed ) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	},

	_start: function (e) {
        // 如果是鼠标点击，则只响应鼠标左键
		if ( utils.eventType[e.type] != 1 ) {
			if ( e.button !== 0 ) {
				return;
			}
		}

		if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
			return;
		}

		// 如果 preventDefault === true 且 不是落后的安卓版本 且 不是需要过滤的 target 就阻止默认的行为
		if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.touches ? e.touches[0] : e,	// 检验是触摸事件对象还是鼠标事件对象
			pos;

		this.initiated	= utils.eventType[e.type];	// 初始化事件类型（1：触摸，2：鼠标，3：pointer）
		this.moved		= false;
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;

		this._transitionTime();
		this.startTime = utils.getTime();

		// 定住正在滑动的 scroller，slider/tab 不这么做
		if ( this.options.useTransition && this.isInTransition &&
            this.options.role !== 'slider' && this.options.role !== 'tab') {
			this.isInTransition = false;
			pos = this.getComputedPosition();
			this._translate(Math.round(pos.x), Math.round(pos.y));

            if(this.options.role !== 'slider' && this.options.role !== 'tab') {
                this._execEvent('scrollEnd');
            }

		}
		// 场景：（没有使用 Transition 属性）
		else if ( !this.options.useTransition && this.isAnimating ) {
			this.isAnimating = false;
            if(this.options.role !== 'slider' && this.options.role !== 'tab') {
                this._execEvent('scrollEnd');
            }
		}

		this.startX    = this.x;
		this.startY    = this.y;
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = point.pageX;
		this.pointY    = point.pageY;


		// throttle
		// ======================
		if (this.options.autoplay) {
			var context = this;

			clearTimeout(this.options.flag);
			this.options.flag = setTimeout(function() {
				context._autoplay.apply(context);
			}, context.options.interval);
		}

		event.stopPropagation();

        if(this.options.role !== 'slider' && this.options.role !== 'tab') {
            this._execEvent('beforeScrollStart');
        }

    },



	_move: function (e) {
        // 如果事件类型和 touchstart 初始化的事件类型不一致，退出
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}
		if ( this.options.preventDefault ) {	// 这么做才能确保 Android 下 touchend 能被正常触发（需测试）
			e.preventDefault();
		}
		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,
			deltaY		= point.pageY - this.pointY,
			timestamp	= utils.getTime(),
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;
		this.pointY		= point.pageY;

		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);
		

		// 如果在很长的时间内只移动了少于 10 像素的距离，那么不会触发惯性滚动
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}

		// 屏蔽滚动方向的另外一个方向（可配置）
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}
		if ( this.directionLocked == 'h' ) {
			// slider/tab 外层高度自适应
			if (this.options.role === 'tab') {
				$(this.scroller).children('li').height('auto');	
			}
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;
				return;
			}
			deltaY = 0;	// 不断重置垂直偏移量为 0
		}
		else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
				this.initiated = false;
				return;
			}
			deltaX = 0;	// 不断重置水平偏移量为 0
		}

		deltaX = this.hasHorizontalScroll ? deltaX : 0;
		deltaY = this.hasVerticalScroll ? deltaY : 0;
		
		newX = this.x + deltaX;
		newY = this.y + deltaY;

		// Slow down if outside of the boundaries
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

        if(this.options.role !== 'slider' && this.options.role !== 'tab') {
            if (!this.moved) {
                this._execEvent('scrollStart');
            }
        }

		this.moved = true;	// 滚动开始
		this._translate(newX, newY);

		if ( timestamp - this.startTime > 300 ) {	// 每 300 毫秒重置一次初始值
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}


    },



	_end: function (e) {

		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.changedTouches ? e.changedTouches[0] : e,	// 移开屏幕的那个触摸点，只会包含在 changedTouches 列表中，而不会包含在 touches 或 targetTouches 列表中
			momentumX,
			momentumY,
			duration = utils.getTime() - this.startTime,
			newX = Math.round(this.x),
			newY = Math.round(this.y),
			distanceX = Math.abs(newX - this.startX),
			distanceY = Math.abs(newY - this.startY),
			time = 0,
			easing = '';

		this.isInTransition = 0;
		this.initiated = 0;
		this.endTime = utils.getTime();
	

		if ( this.resetPosition(this.options.bounceTime) ) {	// reset if we are outside of the boundaries
			if (this.options.role === 'tab') {
				$(this.scroller.children[this.currentPage]).siblings('li').height(0);	
			}
			return;
		}

		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		if (!this.moved) {	// we scrolled less than 10 pixels
			if (this.options.tap && utils.eventType[e.type] === 1) {
				utils.tap(e, this.options.tap);
			}
			if ( this.options.click) {
				utils.click(e);
			}

            if(this.options.role !== 'slider' && this.options.role !== 'tab') {
                //初始化滚动后又取消
                this._execEvent('scrollCancel');
                return;

            }
		}
        if(this.options.role !== 'slider' && this.options.role !== 'tab') {
            //轻击屏幕左、右
            if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
                this._execEvent('flick');
                return;
            }
        }

		// 300ms 内的滑动要启动惯性滚动
		if ( this.options.momentum && duration < 300 ) {
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}

		if ( newX != this.x || newY != this.y ) {
			// change easing function when scroller goes out of the boundaries
			if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
				easing = utils.ease.quadratic;
			}
			this.scrollTo(newX, newY, time, easing);
			return;
		}


		// tab
		// ==========================
		if (this.options.role === 'tab' && $(event.target).closest('ul').hasClass('ui-tab-nav')) {
			$(this.nav).children().removeClass('current');
			$(event.target).addClass('current');
			var tempCurrentPage = this.currentPage;
			this.currentPage = $(event.target).index();

			$(this.scroller).children().height('auto');	// tab 外层高度自适应
			this._execEvent('beforeScrollStart', tempCurrentPage, this.currentPage);
		}



		// slider & tab
		// ==============================
		if (this.options.role === 'slider' || this.options.role === 'tab') {

			if (distanceX < 30) {
				this.scrollTo(-this.itemWidth*this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
			}
			else if (newX-this.startX<0) {	// 向前,滚动前
				this._execEvent('beforeScrollStart', this.currentPage, this.currentPage+1);
				this.scrollTo(-this.itemWidth*++this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
			}
			else if (newX-this.startX>=0) {	// 向后
				this._execEvent('beforeScrollStart', this.currentPage, this.currentPage-1);
				this.scrollTo(-this.itemWidth*--this.currentPage, 0, this.options.bounceTime, this.options.bounceEasing);
			}

			// tab 外层高度自适应
			if (this.options.role === 'tab') {
				$(this.scroller.children[this.currentPage]).siblings('li').height(0);
			}

			if (this.indicator && distanceX >= 30) {
				$(this.indicator).children().removeClass('current');
				$(this.indicator.children[this.currentPage]).addClass('current');
			}
			else if (this.nav && distanceX >= 30) {
				$(this.nav).children().removeClass('current');
				$(this.nav.children[this.currentPage]).addClass('current');
			}

			$(this.scroller).children().removeClass('current');
			$(this.scroller.children[this.currentPage]).addClass('current');
		}else{
            this._execEvent('scrollEnd');
        }
	},


	_resize: function () {
		var that = this;
		clearTimeout(this.resizeTimeout);
		this.resizeTimeout = setTimeout(function () {
			that.refresh();
		}, this.options.resizePolling);
	},


	_transitionEnd: function (e) {
		if ( e.target != this.scroller || !this.isInTransition ) {
			return;
		}
		this._transitionTime();

		if ( !this.resetPosition(this.options.bounceTime) ) {
			this.isInTransition = false;
			this._execEvent('scrollEnd', this.currentPage);
		}
	},


	destroy: function () {
		this._initEvents(true);		// 去除事件绑定
        if(this.options.role !== 'slider' && this.options.role !== 'tab') {
            this._execEvent('destroy');
        }
	},


	resetPosition: function (time) {
		var x = this.x,
			y = this.y;

		time = time || 0;

		if ( !this.hasHorizontalScroll || this.x > 0 ) {
			x = 0;
		} else if ( this.x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( !this.hasVerticalScroll || this.y > 0 ) {
			y = 0;
		} else if ( this.y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		if ( x == this.x && y == this.y ) {
			return false;
		}
		this.scrollTo(x, y, time, this.options.bounceEasing);
		return true;
	},



	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},



	on: function (type, fn) {
		if ( !this._events[type] ) {
			this._events[type] = [];
		}
		this._events[type].push(fn);
	},
	off: function (type, fn) {
		if ( !this._events[type] ) {
			return;
		}

		var index = this._events[type].indexOf(fn);

		if ( index > -1 ) {
			this._events[type].splice(index, 1);
		}
	},


	_execEvent: function (type) {
		if ( !this._events[type] ) {
			return;
		}
		var i = 0,
			l = this._events[type].length;

		if ( !l ) {
			return;
		}
		for ( ; i < l; i++ ) {
			this._events[type][i].apply(this, [].slice.call(arguments, 1));
		}
	},
    /**
     * 滚动到相对于当前位置的某处其余同上
     * @param x
     * @param y
     * @param time
     * @param easing
     */
    scrollBy: function(x, y, time, easing) {
        x = this.x + x;
        y = this.y + y;
        time = time || 0;

        this.scrollTo(x, y, time, easing);
    },

    /**
     * 滚动
     * @param x
     * @param y
     * @param time
     * @param easing
     */
	scrollTo: function (x, y, time, easing) {
		easing = easing || utils.ease.circular;

		this.isInTransition = this.options.useTransition && time > 0;

		if ( !time || (this.options.useTransition && easing.style) ) {

			if (this.options.role === 'slider' || this.options.role === 'tab') {
                // 不添加判断会影响 left/top 的过渡
				time = this.options.duration;
				this.scrollerStyle[utils.style.transitionProperty] = utils.style.transform;	
			}

            this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},

    /**
     * 滚动到某个元素。 el 为必须的参数 offsetX/offsetY ：相对于 el 元素的位移。设为 true 即为屏幕中心
     * @param el
     * @param time
     * @param offsetX
     * @param offsetY
     * @param easing
     */
	scrollToElement: function (el, time, offsetX, offsetY, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if ( !el ) {
			return;
		}
		var pos = utils.offset(el);
		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		// 若 offsetX/Y 都是 true，则会滚动到元素在屏幕中间的位置
		if ( offsetX === true ) {
			offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		}
		if ( offsetY === true ) {
			offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		}
		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;
		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		this.scrollTo(pos.left, pos.top, time, easing);
	},


	_transitionTime: function (time) {
		time = time || 0;
		this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
		}
	},


    _transitionTimingFunction: function(easing) {
        this.scrollerStyle[utils.style.transitionTimingFunction] = easing;

        // INSERT POINT: _transitionTimingFunction

    },
	_translate: function (x, y) {
		if ( this.options.useTransform ) {
			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}
		this.x = x;
		this.y = y;
	},


	getComputedPosition: function () {
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if ( this.options.useTransform ) {
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}

		return { x: x, y: y };
	},

	
	_animate: function (destX, destY, duration, easingFn) {
	// 当浏览器不支持 transition 时提供的退化方案 requestAnimationFrame
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = utils.getTime(),
			destTime = startTime + duration;

		function step () {
			var now = utils.getTime(),
				newX, newY,
				easing;

			if ( now >= destTime ) {
				that.isAnimating = false;
				that._translate(destX, destY);

				if ( !that.resetPosition(that.options.bounceTime) ) {
					that._execEvent('scrollEnd', this.currentPage);
				}
				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if ( that.isAnimating ) {
				rAF(step);
			}
		}
		this.isAnimating = true;
		step();
	},


	_autoplay: function() {
		var self = this,
			curPage = self.currentPage;
		
		self.currentPage = self.currentPage >= self.count-1 ? 0 : ++self.currentPage;
		self._execEvent('beforeScrollStart', curPage, self.currentPage);	// 对于自动播放的 slider/tab，这个时机就是 beforeScrollStart

		// tab 外层高度自适应
		if (this.options.role === 'tab') {
			$(this.scroller).children().height('auto');
			document.body.scrollTop = 0;
		}
		self.scrollTo(-self.itemWidth*self.currentPage, 0, self.options.bounceTime, self.options.bounceEasing);

		if (self.indicator) {
			$(self.indicator).children().removeClass('current');
			$(self.indicator.children[self.currentPage]).addClass('current');
			$(self.scroller).children().removeClass('current');
			$(self.scroller.children[self.currentPage]).addClass('current');
		}
		else if (self.nav) {
			$(self.nav).children().removeClass('current');
			$(self.nav.children[self.currentPage]).addClass('current');
			$(self.scroller).children().removeClass('current');
			$(self.scroller.children[self.currentPage]).addClass('current');
		}

		self.options.flag = setTimeout(function() {
			self._autoplay.apply(self);
		}, self.options.interval);
	}


};

    Scroll.utils = utils;
    if (typeof iScroll === 'undefined') {
        window.iScroll = Scroll; //iScroll lite
    }

    window.Scroll = Scroll; //iScroll lite
    window.svp.Scroll = Scroll;

    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/scroll',function(require, exports, module) {
            module.exports = Scroll;
        })
    }

    if (typeof $.fn.Scroll === "undefined") {
    // 给$.fn上挂iScroll方法
        var slice = [].slice,
            record = (function () {
                var data = {},
                    id = 0,
                    ikey = '__sid';    // internal key.
                return function (obj, val) {
                    var key = obj[ ikey ] || (obj[ ikey ] = ++id);
                    val !== undefined && (data[ key ] = val);
                    val === null && delete data[ key ];
                    return data[ key ];
                };
            })();
        var $iScroll = function (el, options) {
            var args = [].slice.call(arguments, 0),
                ins = new Scroll(el, options);
            record(el, ins);
            return ins;
        };
        $iScroll.prototype = Scroll.prototype;

        $.fn.Scroll = function (opts) {
            var args = slice.call(arguments, 1),
                method = typeof opts === 'string' && opts,
                ret,
                obj;

            $.each(this, function (i, el) {
                // 从缓存中取，没有则创建一个
                obj = record(el) || $iScroll(el, $.isPlainObject(opts) ? opts : undefined);

                // 取实例
                if (method === 'this') {
                    ret = obj;
                    return false;
                } else if (method) {

                    // 当取的方法不存在时，抛出错误信息
                    if (!$.isFunction(obj[ method ])) {
                        throw new Error('iScroll没有此方法：' + method);
                    }

                    ret = obj[ method ].apply(obj, args);
                    // 断定它是getter性质的方法，所以需要断开each循环，把结果返回
                    if (ret !== undefined && ret !== obj) {
                        return false;
                    }
                    // ret为obj时为无效值，为了不影响后面的返回
                    ret = undefined;
                }
            });
            return ret !== undefined ? ret : this;
        };
    }

})(window.Zepto || window.jQuery);

!function($){

	// 默认模板
	var _loadingTpl='<div class="ui-loading-block show">'+
		    '<div class="ui-loading-cnt">'+
		      '<i class="ui-loading-bright"></i>'+
		      '<p><%=content%></p>'+
		   '</div>'+
		 '</div>';
	
	// 默认参数
	var defaults={
		content:'加载中...'
	}
	// 构造函数
	var Loading   = function (el,option,isFromTpl) {
		var self=this;
		this.element=$(el);
		this._isFromTpl=isFromTpl;
		this.option=$.extend(defaults,option);
		this.show();
	}
	Loading.prototype={
		show:function(){
			var e=$.Event('loading:show');
			this.element.trigger(e);
			this.element.show();
			
		},
		hide :function () {
			var e=$.Event('loading:hide');
			this.element.trigger(e);
			this.element.remove();
		}
	}
	function Plugin(option) {

		return $.adaptObject(this, defaults, option,_loadingTpl,Loading,"loading");
	}
	$.fn.loading=$.loading= Plugin;

    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/loading',function(require, exports, module) {
            module.exports = $.loading;
        })
    }
}(window.Zepto||window.jQuery);

	


/* ========================================================================
 * zepto-jquery.js
 * ======================================================================== */
!function ($) {
    "use strict";
    if (typeof window.jQuery === 'undefined') {
        //throw new Error('Bootstrap\'s JavaScript requires jQuery')
        window.Zepto.event =window.Zepto.event ||{};
        window.Zepto.event.special = window.Zepto.event.special|| {};
        window.Zepto.support = window.Zepto.support|| {};
        window.Zepto.fn.jquery     = '1.11.3';
        window.jQuery        = window.Zepto;
    }

}(window.Zepto || window.jQuery );

/* ========================================================================
 * transition.js
 * 过渡效果

 * ======================================================================== */
!function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one($.support.transition.end||'bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return;

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }

  })

}(window.Zepto || window.jQuery );

;(function($, window, undefined) {
    
    var win = $(window),
        doc = $(document),
        count = 1,
        isLock = false;

    var Dialog = function(options) {
        this.settings = $.extend({}, Dialog.defaults, options);
        this.init();
        
    };
    
    Dialog.prototype = {
        
        /**
         * 初始化
         */
        init : function() {
            this.create();
            if (this.settings.lock) {
                this.lock();
            }
            if (!isNaN(this.settings.time)&&this.settings.time!=null) {
                this.time();
            }
        },
        
        /**
         * 创建
         * 二维码dialog冲突，所以用rDialog
         */
        create : function() {
            var ts= new Date().getTime();
            var divHeader = (this.settings.title==null)?'':'<div class="rDialog-header-'+ this.settings.title +'"></div>';
            // HTML模板
            var templates = '<div class="rDialog-wrap" data-ts="' +ts+'">' +
                                divHeader +
                                '<div class="rDialog-content">'+ this.settings.content +'</div>' +
                                '<div class="rDialog-footer"></div>' +
                            '</div>';
            
            // 追回到body
            this.dialog = $('<div>').addClass('rDialog').css({ zIndex : this.settings.zIndex + (count++) }).html(templates).prependTo('body');
            
            // 设置ok按钮
            if ($.isFunction(this.settings.ok)) {
                this.ok();
            }
            
            // 设置cancel按钮
            if ($.isFunction(this.settings.cancel)) {
               this.cancel(); 
            }
            
            // 设置大小
            this.size();
            
            // 设置位置
            this.position();
            
        },
        
        /**
         * ok
         */
        ok : function() {
            var _this = this,
                footer = this.dialog.find('.rDialog-footer');
            
            $('<a>', {
                href : 'javascript:;',
                text : this.settings.okText
            }).on("click", function() {
                    var okCallback = _this.settings.ok();
                    if (okCallback == undefined || okCallback) {
                        _this.close();
                    }

            }).addClass('rDialog-ok').prependTo(footer);
            
        },
        
        /**
         * cancel
         */
        cancel : function() {
            
            var _this = this,
                footer = this.dialog.find('.rDialog-footer');
            
            $('<a>', {
                href : 'javascript:;',
                text : this.settings.cancelText
            }).on("click",function() {
                    var cancelCallback = _this.settings.cancel();
                    if (cancelCallback == undefined || cancelCallback) {
                        _this.close();
                    }
            }).addClass('rDialog-cancel').appendTo(footer);
            
        },
        
        /**
         * 设置大小
         */
        size : function() {
            
            var content = this.dialog.find('.rDialog-content'),
            	wrap = this.dialog.find('.rDialog-wrap');
            
            content.css({ 
                width : this.settings.width,
                height : this.settings.height
            });
            //wrap.width(content.width());
        },
        
        /**
         * 设置位置
         */
        position : function() {
            
            var _this = this,
                winWidth = win.width(),
                winHeight = win.height(),
                scrollTop = 0;
            
            this.dialog.css({ 
                left : (winWidth - _this.dialog.width()) / 2,
                top : (winHeight - _this.dialog.height()) / 2 + scrollTop
            });

        },
        
        /**
         * mask设置锁屏
         */
        lock : function() {
            if (isLock) return;
            this.lock = $('<div>').css({ zIndex : this.settings.zIndex }).addClass('rDialog-mask');
            this.lock.appendTo('body');
            
            isLock = true;

        },
        
        /**
         * 关闭锁屏
         */
        unLock : function() {
    		if (this.settings.lock) {
    			if (isLock) {
	                this.lock.remove();
	                isLock = false;
                }
            }
        },
        
        /**
         * 关闭方法
         */
        close : function() {
            this.dialog.remove();
            this.unLock();
        },
        
        /**
         * 定时关闭
         */
        time : function() {
            
            var _this = this;
            
            this.closeTimer = setTimeout(function() {
                _this.close();
            }, this.settings.time);

        }
        
    }
    
    /**
     * 默认配置
     */
    Dialog.defaults = {
        
        // 内容
        content: '加载中...',
        
        // 标题
        title: 'load',
        
        // 宽度
        width: 'auto',
        
        // 高度
        height: 'auto',
        
        // 确定按钮回调函数
        ok: null,
        
        // 取消按钮回调函数
        cancel: null,
        
        // 确定按钮文字
        okText: '确定',
        
        // 取消按钮文字
        cancelText: '取消',
        
        // 自动关闭时间(毫秒)
        time: null,
        
        // 是否锁屏
        lock: true,

        // z-index值
        zIndex: 9999
        
    }
    
    var rDialog = function(options) {
        return new Dialog(options);
    }
    
    window.rDialog = $.rDialog = rDialog;
    
})(window.jQuery || window.Zepto, window);

/*
 * button.js v3.1.1
 */


!function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }

    if (changed) this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target);
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn');
    $btn.button('toggle');
    e.preventDefault()
  })

}(window.jQuery || window.Zepto, window);
/*
 *   carousel.js
 */


!function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    if ($next.hasClass('active')) return this.sliding = false

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid.bs.carousel', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid.bs.carousel') }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid.bs.carousel')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel');

      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(window.jQuery || window.Zepto, window);

/*
 * collapse.js v3.1.1
 */


!function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null;

    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var actives = this.$parent && this.$parent.find('> .panel > .in')

    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      actives.collapse('hide')
      hasData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')
      [dimension](0)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')
        [dimension]('auto')
      this.transitioning = 0
      this.$element.trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
      [dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element
      [dimension](this.$element[dimension]())
      [0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one($.support.transition.end, $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  var old = $.fn.collapse
  $.fn.collapse = function (option) {

    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle=collapse]', function (e) {
    var $this   = $(this), href
    var target  = $this.attr('data-target')
        || e.preventDefault()
        || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
    var $target = $(target)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()
    var parent  = $this.attr('data-parent')
    var $parent = parent && $(parent)

    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle=collapse][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }

    $target.collapse(option)
  })

}(window.jQuery || window.Zepto, window);

/*
 *  dropdown.js v3.1.1
 */


!function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle=dropdown]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role=menu]' + desc + ', [role=listbox]' + desc)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index = 0

    $items.eq(index).focus()
  }

  function clearMenus(e) {
    $(backdrop).remove()
    $(toggle).each(function () {
      var $parent = getParent($(this))
      var relatedTarget = { relatedTarget: this }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu], [role=listbox]', Dropdown.prototype.keydown)

}(window.jQuery || window.Zepto, window);

!function($){

	// 默认模板
	var _tipsTpl='<div class="ui-poptips ui-poptips-<%=type%>">'+
					'<div class="ui-poptips-cnt">'+
    				'<i></i><%=content%>'+
					'</div>'+
				'</div>';
	
	// 默认参数
	var defaults={
		content:'',
		stayTime:1000,
		type:'info',
		callback:function(){}
	}
	// 构造函数
	var Tips   = function (el,option,isFromTpl) {
		var self=this;
		this.element=$(el);
		this._isFromTpl=isFromTpl;
		this.elementHeight=$(el).height();

		this.option=$.extend(defaults,option);
		$(el).css({
			"-webkit-transform":"translateY(-"+this.elementHeight+"px)"
		});
		setTimeout(function(){
			$(el).css({
				"-webkit-transition":"all .5s"
			});
			self.show();
		},20);
		
	}
	Tips.prototype={
		show:function(){
			var self=this;
			// self.option.callback("show");
			self.element.trigger($.Event("tips:show"));
			this.element.css({
				"-webkit-transform":"translateY(0px)"
			});
			if(self.option.stayTime>0){
				setTimeout(function(){
					self.hide();
				},self.option.stayTime)
			}
		},
		hide :function () {
			var self=this;
			self.element.trigger($.Event("tips:hide"));
			this.element.css({
				"-webkit-transform":"translateY(-"+this.elementHeight+"px)"
			});
			setTimeout(function(){
				self._isFromTpl&&self.element.remove();
			},500)
				
			
		}
	}
	function Plugin(option) {

		return $.adaptObject(this, defaults, option,_tipsTpl,Tips,"tips");
	}

	$.fn.tips=$.tips = Plugin;
    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/tips',function(require, exports, module) {
            module.exports = $.tips;
        })
    }

}(window.Zepto||window.jQuery);
	


/*
 *   scrollspy.js
 *   nav导航条滚动监听插件是用来根据滚动条所处的位置来自动更新导航项的
  */


!function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    var href
    var process  = $.proxy(this.process, this)

    this.$element       = $(element).is('body') ? $(window) : $(element)
    this.$body          = $('body')
    this.$scrollElement = this.$element.on('scroll.bs.scroll-spy.data-api', process)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target
      || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
      || '') + ' .nav li > a'
    this.offsets        = $([])
    this.targets        = $([])
    this.activeTarget   = null

    this.refresh()
    this.process()
  }

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.refresh = function () {
    var offsetMethod = this.$element[0] == window ? 'offset' : 'position'

    this.offsets = $([])
    this.targets = $([])

    var self     = this
    var $targets = this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[ $href[offsetMethod]().top + (!$.isWindow(self.$scrollElement.get(0)) && self.$scrollElement.scrollTop()), href ]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
    var maxScroll    = scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets.last()[0]) && this.activate(i)
    }

    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
        && this.activate( targets[i] )
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')

    var selector = this.selector +
        '[data-target="' + target + '"],' +
        this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  var old = $.fn.scrollspy

  $.fn.scrollspy = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.scrollspy.Constructor = ScrollSpy;


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old;
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this);
      $spy.scrollspy($spy.data())
    })
  })

}(window.jQuery || window.Zepto, window);

/*
 * tab.js v3.1.1
 */
!function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old;
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault();
    $(this).tab('show')
  })

}(window.jQuery || window.Zepto, window);

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

/**
 * Cover动画组件，提供cover显示隐藏、定位、自定义形状和背景等功能特性。
 * 调用方式
 // 绑定cover到.cover
 $(".cover").cover(option);
 // 直接绑定到body上，与$("body").cover(option)等效
 $.cover(option);
 配置信息可以通过js传参，也可以通过元素的data-*的方式。
 配置信息也可以被trigger的data-*来重置。
 具体配置信息如下：
 name    type    default description
 trigger element null     cover触发显示的元素。
 dismiss null    null     cover触发隐藏的元素。
 background  string  随机  cover的背景色，可通过trigger的data-background配置重置。下同
 duration   int  1000       cover的动画耗时
 startPos  string  "source" cover动画开始时的位置，默认为source（trigger的中心位置）。可选参数：source|top|center|bottom
 offset  Array  [0,0]      cover在startPos的基础上的偏移量。
 expandAxis  string  'x'   cover扩展方向，可选 x|y|xy
 isFloat BOOL  true        触发元素是否保持在cover上方
 zIndex  int 999           cover的z-index
 callback functon function(){}  事件回调，有两个参数，第一个参数为事件类型，第二个参数为当前cover对象。
 */
!function($){

	function randomColor(){
		return '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6);
	}
	function randomSkew(){
		return [Math.random()*20-10,Math.random()*20-10];
	}
	function isRelative(obj){
		var position=obj.css('position');
		
		if(position==='relative'||position==='fixed'||position==='absolute'){
			return true;
		}
		return false;
	}
	// 取消默认事件
	function preventEvent(evt){
		evt.preventDefault();
	}

	// 默认参数
	var defaults={
	  	// element内的触发元素
	  	trigger:null,
	  	// 关闭cover的触发元素
	  	dismiss:null,
	  	// 动画时间
	  	duration:1000,
	    // cover开始的位置，可选 top|center|bottom|source
	    startPos: 'source',
	  	// cover开始位置的偏移量
	  	offset:[0,0],
	    // cover扩展方向，可选 x|y|xy
	    expandAxis: 'y',

	    // 触发元素是否保持在cover上方
	    isFloat:true,
	    // cover的z-index
	    zIndex:999,
	    callback:function(){}
	}
	// 构造函数
	var Cover   = function (el,option) {
		this.element=$(el);
		this.trigger=$(option.trigger);
		this.dismiss=$(option.dismiss);
		this.option=option;
		this.initMask();
	    // 渲染DOM
	    this.render();
	    // 默认未显示
	    this._isShown=false;
	   	// 默认没触发关闭 
	    this._isDismiss=false;    
	    // 事件绑定
	    this._bindTrigger();

	    if(!this.position) {
	  		this.position={};
		  	this.position.screenWidth   =document.documentElement.clientWidth,
		  	this.position.screenHeight  =document.documentElement.clientHeight;
	  	}
	}
	Cover.prototype={
		initMask:function(){
		  	// 定义初始mask
		    this._mask=$('<div></div>');
		    // 基础样式
		    this._mask.css({
		  		position:'absolute',
		  		top:0,
		  		left:0,
		  		width:100,
		  		height:100,
		  		'z-index':-1,
		  		'-webkit-transform':'scale(0)'
		  	});
	  	},
	  	render: function () {
		  	// 初始化时先将mask插入页面
		  	this._mask.appendTo(this.element);

		  	// 设置根元素为相对定位，用于定位子级元素
		  	if(!isRelative(this.element)){
		  		this.element.css({
		  			'position':'relative',
		  			'overflow':'hidden'
		  		});
		  	}
		 },

		setConfig:function(option){
			
	  		if(!this._isShown){
	  			option=$.extend(option,this.currentTrigger.data());
	  			this.currentOption=option;
	  		}
	  		return this;
		},

	  	// 显示cover
	  	show: function (el) {
		  	var self=this,
		  		option=this.currentOption;
		  	
		  	if(!this._isShown&&(this.currentTrigger||el)){
		  		if(el){
		  			this.currentTrigger=el;
		  		}
		  		option.callback("show",self);
		  		this._preventDefault();
		  		self._isDismiss=false;
		  		this._isShown=true;
		  		var fromSkew=randomSkew(),
		  			ratio=2;
		  		
			  	if(option.isFloat){
			  		// 浮动trigger元素
			  		this._floatTrigger();
			  		this.currentTrigger.css({
			  			'zIndex':option.zIndex+1
			  		})
			  	}

			  	// mask属性
			  	var maskPos=this._getMaskPos(option.startPos,option.expandAxis),
			  		maskScale=option.expandAxis=='x'?'scale(0,1)':
			  				  (option.expandAxis=='y'?'scale(1,0)':'scale(0,0)');

			  	// 设置mask属性
			  	this._mask.css({
			  		left:maskPos[0]+option.offset[0],
			  		top:maskPos[1]+option.offset[1],
			  		background:option.background?option.background:randomColor(),
			  		'z-index':option.zIndex,
			  		'-webkit-transform':maskScale+' '+'skew('+fromSkew[0]+'deg,'+fromSkew[1]+'deg)'
			  	});

			  	// mask动画
			  	this._aniMask(option.duration,option.offset,ratio);
			  	
		  	}
		    return this;
	 	},

	  
	  	// 隐藏cover
	  	hide: function (config) {
	  		var self=this;
	  		self.option.callback("hide",self);
		  	if(this._isShown){
			  	this._isDismiss=true;
			    this._mask.css({
			    	'-webkit-transform':this._originTransform
			    });
		    }
		    
	  	},
	  	// hide动画完成后调用，可以使用before/after在动画后进行操作，并进行了一些重置
	  	hidden:function(){
		  	// 重置样式和参数
		  	this._isShown=false;
		  	this._isDismiss=false;
		  	this._mask.css({
		  		'-webkit-transition':'none'
		  	});
		  	this._relaseDefault();
		  	this.currentTrigger.css(this._triggerOriginCss);
	  	},

	  	// 绑定事件
	 	_bindTrigger: function () {
		  	var self=this;
		  	// 触发器事件
		    this.trigger.on("tap",function(){
		    	if(!self._isShown){
		    		self.currentTrigger=$(this);
		    	}
		    	self.setConfig($.extend({},$(this).data(),self.option)).show($(this));
		    	return false;
		    });

		    // 关闭事件绑定
		    this.dismiss.on("tap",function(){
		    	self.dismiss=$(this);
		    	self.hide();
		    	return false;
		    });

		    // 动画结束后回调
		    this._mask[0].addEventListener("webkitTransitionEnd",function(){
		    	// _isShown代表cover已打开，_isDismiss代表触发关闭
		    	if(self._isShown&&!self._isDismiss){
		    		self.option.callback("shown",self);
		    	}else{
		    		self.hidden();
		    		self.option.callback("hidden",self);
		    	}
		    },false);
	    
	  	},

	  // 打开时取消默认事件
	  _preventDefault: function () {

	  	document.addEventListener('mousewheel',preventEvent,false); 
	  	document.body.addEventListener('touchmove',preventEvent,false); 
	  	document.documentElement.addEventListener('touchmove',preventEvent,false); 
	    
	  },

	  // 关闭时恢复默认事件
	  _relaseDefault:function(){
	  	document.removeEventListener('mousewheel',preventEvent,false); 
	  	document.body.removeEventListener('touchmove',preventEvent,false); 
	  	document.documentElement.removeEventListener('touchmove',preventEvent,false); 
	   
	  },

	  // 设置非定位元素为相对路径，并保留初始样式
	  _floatTrigger:function(){
	  	// 保留初始样式，方便reset

	  	this._triggerOriginCss={
	  		'position':this.currentTrigger.css('position'),
	  		'z-index':this.currentTrigger.css('z-index')
	  	}
	  	
	  	// 如果不是定位元素，设置为相对定位
	  	if(!isRelative(this.currentTrigger)){
	  		this.currentTrigger.css({
	  			'position':'relative'
	  		});
	  	}
	  },

	  // 计算mask位置
	  _getMaskPos:function(pos,axis){
	  	
	  	if(!this.position) {
	  		this.position={};
		  	this.position.screenWidth   =document.documentElement.clientWidth,
		  	this.position.screenHeight  =document.documentElement.clientHeight;
	  	}
	  	// 根据axis设置宽高
	  	
	  	if(axis=='x'){
		  	this._mask.css({
		  		height:this.position.screenHeight
		  	});
	  	}else if(axis=='y'){
	  		this._mask.css({
		  		width:this.position.screenWidth
		  	});
	  	}

	  	// 暴露定位信息
	  	this.position.scrollTop      =document.body.scrollTop,
	  	this.position.scrollLeft     =document.body.scrollLeft,
	  	this.position.offsetTop      =this.element.offset().top,
	  	this.position.offsetLeft     =this.element.offset().left,
	  	this.position.triggerLeft    =this.currentTrigger.offset().left,
	  	this.position.triggerTop     =this.currentTrigger.offset().top,
	  	this.position.triggerHeight  =this.currentTrigger.height(),
	  	this.position.triggerWidth   =this.currentTrigger.width();
	  	var maskWidth=parseInt(this._mask.css("width")),
	  		maskHeight=parseInt(this._mask.css("height"));

	  	// x方向居中，需要偏移可设置offset参数
	  	var x=this.position.scrollLeft-this.position.offsetLeft+this.position.screenWidth/2-maskWidth/2,
	  		y=0;
	  	if(pos=='top'){

	  		y=this.position.scrollTop-this.position.offsetTop-maskHeight/2;
	  	}else if(pos=='bottom'){
	  		y=this.position.scrollTop-this.position.offsetTop+this.position.screenHeight-maskHeight/2;
	  	}else if(pos=='center'){

	  		y=this.position.scrollTop-this.position.offsetTop+this.position.screenHeight/2-maskHeight/2;
	  	}else{
	  		x=this.position.triggerLeft-this.position.offsetLeft+this.position.triggerWidth/2-maskWidth/2;
	  		y=this.position.triggerTop-this.position.offsetTop+this.position.triggerHeight/2-maskHeight/2;
	  	}
	  	return [x,y];
	  	
	  },

	  // mask动画
	  _aniMask:function(duration,offset,ratio){
	  	var self=this;
	  	this._originTransform=this._mask.css("-webkit-transform");

	  	// 计算缩放比例
	  	var scaleX=Math.ceil(this.position.screenWidth/parseInt(this._mask.css("width")))*ratio,
	  		scaleY=Math.ceil(this.position.screenHeight/parseInt(this._mask.css("height")))*ratio;
	  	
	  	setTimeout(function(){
	  		self._mask.css({
		  		'-webkit-transition':'all '+duration+"ms",
		  		'-webkit-transform':'scale('+scaleX+','+scaleY+') '+'skew(0deg,0deg)'
	  		})
	  	},200);
	  }
	}
	
	function Plugin(option) {
		var $this= this;
		if(!$.isArray($this)||!$(this).length){
			$this=$("body");
		}
		return $this.each(function () {
			var el = $(this);
			// 读取对象缓存
			var data  = el.data('ui.cover');
			if (!data) el.data('ui.cover',
				(data = new Cover(this,$.extend({}, defaults,  typeof option == 'object' && option,el.data()))
			));
			if (typeof option == 'string') data[option].call($this);
		})
	}
	$.fn.cover = $.cover = Plugin;

    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/cover',function(require, exports, module) {
            module.exports = $.cover;
        })
    }

}(window.Zepto||window.jQuery);

	



/**
 * parallax 分屏滚动动画（即一屏一屏翻阅）
 */

!function($) {

    var startPos,           // 开始触摸点(X/Y坐标)
        endPos,             // 结束触摸点(X/Y坐标)
        stage,              // 用于标识 onStart/onMove/onEnd 流程的第几阶段，解决 onEnd 重复调用
        offset,             // 偏移距离
        direction,			// 翻页方向

        curPage, 			// page 当前页
        pageCount,          // page 数量
        pageWidth,          // page 宽度
        pageHeight,         // page 高度

        $pages,             // page 外部 wrapper
        $pageArr,           // page 列表
        $animateDom,		// 所有设置 [data-animate] 的动画元素

        options={

            direction: 'vertical',  // 滚动方向, "horizontal/vertical"
            swipeAnim: 'default',   // 滚动动画，"default/cover"
            drag: true,             // 是否有拖拽效果
            loading: false,         // 是否需要加载页
            indicator: false,       // 是否要有指示导航
            arrow: false,           // 是否要有箭头
            onchange: function(){}, // 回调函数
            orientationchange: function(){}	// 屏幕翻转

        },            // 最终配置项

        touchDown = false,  // 手指已按下 (取消触摸移动时 transition 过渡)
        movePrevent = true; // 阻止滑动 (动画过程中手指按下不可阻止)



    // 定义实例方法 (jQuery Object Methods)
    // ==============================

    $.fn.parallax = function(opts) {
        options = $.extend({}, $.fn.parallax.defaults, opts);

        return this.each(function() {
            $pages = $(this);
            $pageArr = $pages.find('.page');

            init();
        })
    }


    // 定义配置选项
    // ==============================

    $.fn.parallax.defaults = {

        direction: 'vertical',  // 滚动方向, "horizontal/vertical"
        swipeAnim: 'default',   // 滚动动画，"default/cover"
        drag: true,             // 是否有拖拽效果
        loading: false,         // 是否需要加载页
        indicator: false,       // 是否要有指示导航
        arrow: false,           // 是否要有箭头
        onchange: function(){}, // 回调函数
        orientationchange: function(){}	// 屏幕翻转

    };



    function init() {
    	
    	// 优先显示加载图
    	if (options.loading) {
			$('.wrapper').append('<div class="parallax-loading"><i class="ui-loading ui-loading-white"></i></div>');
        } else {
        	// 允许触摸滑动
            movePrevent = false;
        }

		curPage 	= 0;
		direction	= 'stay';
        pageCount   = $pageArr.length;           	// 获取 page 数量
        pageWidth   = document.documentElement.clientWidth;     // 获取手机屏幕宽度
        pageHeight  = document.documentElement.clientHeight;    // 获取手机屏幕高度
        $animateDom = $('[data-animation]');	 	// 获取动画元素节点

        for (var i=0; i<pageCount; i++) {          // 批量添加 data-id
            $($pageArr[i]).attr('data-id', i+1);
        }

        $pages.addClass(options.direction)		// 添加 direction 类
            	.addClass(options.swipeAnim);  	// 添加 swipeAnim 类

        $pageArr.css({                    		// 初始化 page 宽高
            'width': pageWidth + 'px',
            'height': pageHeight + 'px'
        });

        options.direction === 'horizontal' ?     // 设置 wrapper 宽高
            $pages.css('width', pageWidth * $pageArr.length) :
            $pages.css('height', pageHeight * $pageArr.length);


        if (options.swipeAnim === 'cover') {		// 重置 page 的宽高(因为这两个效果与 default 实现方式截然不同)
            $pages.css({
                'width': pageWidth,
                'height': pageHeight
            });
            $pageArr[0].style.display = 'block'; // 不能通过 css 来定义，不然在 Android 和 iOS 下会有 bug
        }


		if (!options.loading) {
            $($pageArr[curPage]).addClass('current');
            options.onchange(curPage, $pageArr[curPage], direction);
            animShow();
        }

    }



    // 手指第一次按下时调用
    // 提供的接口：
    //  1. 初始位置 startPos
    // ==============================

    function onStart(e) {

        if (movePrevent === true) {
            event.preventDefault();
            return false;
        }
        
        touchDown = true;	// 手指已按下

        options.direction === 'horizontal' ? startPos = e.pageX : startPos = e.pageY;

        if (options.swipeAnim === 'default') {
            $pages.addClass('drag');    // 阻止过渡效果

            offset = $pages.css("-webkit-transform")
                        .replace("matrix(", "")
                        .replace(")", "")
                        .split(",");

            options.direction === 'horizontal' ?
                offset = parseInt(offset[4]) :
                offset = parseInt(offset[5]);
        }

        if ((options.swipeAnim === 'cover' && options.drag)) {
            $pageArr.addClass('drag');
        }

        stage = 1;
    }


    // 移动过程中调用（手指没有放开）
    // 提供的接口：
    //  1. 实时变化的 endPos
    //  2. 添加方向类 forward/backward
    // ==============================

    function onMove(e) {

        if(movePrevent === true || touchDown === false){
            event.preventDefault();
            return false;
        }
        event.preventDefault();
        options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;

        addDirecClass();    // 添加方向类

        if (options.drag && !isHeadOrTail()) { // 拖拽时调用
            dragToMove();
        }
        stage = 2;
    }




    // 手指放开后调用
    // 提供的接口：
    //  1. 获得最后的坐标信息 endPos
    //
    // 执行的操作：
    //  1、将页面归位（前后一页或者原位）
    //  2、为 indicator 添加 current 类
    // ==============================

    function onEnd(e) {

        if (movePrevent === true || stage !== 2){
            // event.preventDefault();
            // return false;
        } else {
            touchDown = false;
            options.direction === 'horizontal' ? endPos = e.pageX : endPos = e.pageY;


            if (options.swipeAnim === 'default' && !isHeadOrTail()) {
                $pages.removeClass('drag');

                if (Math.abs(endPos-startPos) <= 50) {
                    animatePage(curPage);
                    direction = 'stay';
                }
                else if (endPos >= startPos) {
                    animatePage(curPage-1);
                    direction = 'backward';
                }
                else if (endPos < startPos) {
                    animatePage(curPage+1);
                    direction = 'forward';
                }
            }



            else if (options.swipeAnim === 'cover' && !isHeadOrTail()){

                if (Math.abs(endPos-startPos) <= 50 && endPos >= startPos && options.drag) {
                    animatePage(curPage, 'keep-backward');
                    direction = 'stay';
                }
                else if (Math.abs(endPos-startPos) <= 50 && endPos < startPos && options.drag) {
                    animatePage(curPage, 'keep-forward');
                    direction = 'stay';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos >= startPos && options.drag) {
                    animatePage(curPage-1, 'backward');
                    direction = 'backward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos < startPos && options.drag) {
                    animatePage(curPage+1, 'forward')
                    direction = 'forward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos >= startPos && !options.drag) {
                    animatePage(curPage-1, 'backward');
                    direction = 'backward';
                }
                else if (Math.abs(endPos-startPos) > 50 && endPos < startPos && !options.drag) {
                    animatePage(curPage+1, 'forward')
                    direction = 'forward';
                }
            }


			if (options.indicator) {
                $($('.parallax-h-indicator ul li, .parallax-v-indicator ul li').removeClass('current').get(curPage)).addClass('current');
            }
            stage = 3;
        }
        
    }



    // 拖拽时调用
    // ==============================

    function dragToMove() {

        if (options.swipeAnim === 'default') {

            var temp = offset + endPos - startPos;

            options.direction === 'horizontal' ?
                $pages.css("-webkit-transform", "matrix(1, 0, 0, 1, " + temp + ", 0)") :
                $pages.css("-webkit-transform", "matrix(1, 0, 0, 1, 0, " + temp + ")");
        }



        else if (options.swipeAnim === 'cover') {

            var temp      =  endPos - startPos,
                $prevPage = $($pageArr[curPage-1]),
                $nextPage = $($pageArr[curPage+1]);

            $($pageArr).css({'z-index': 0});

            if (options.direction === 'horizontal' && endPos >= startPos) {
                $prevPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateX('+(temp-pageWidth) +'px)'
                })
            }
            else if (options.direction === 'horizontal' && endPos < startPos) {
                $nextPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateX('+(pageWidth+temp) +'px)'
                })
            }
            else if (options.direction === 'vertical' && endPos >= startPos) {
                $prevPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateY('+ (temp-pageHeight) +'px)'
                })
            }
            else if (options.direction === 'vertical' && endPos < startPos) {
                $nextPage.css({
                    'z-index': 2,
                    'display': 'block',
                    '-webkit-transform': 'translateY('+ (pageHeight+temp) +'px)'
                })
            }
        }
     
    }




    // 拖拽结束后调用
    // ==============================

    function animatePage(newPage, action) {

        curPage = newPage;

        if (options.swipeAnim === 'default') {

            var newOffset = 0;
            options.direction === 'horizontal' ?
                newOffset = newPage * (-pageWidth) :
                newOffset = newPage * (-pageHeight);

            options.direction === 'horizontal' ?
                $pages.css({'-webkit-transform': 'matrix(1, 0, 0, 1, ' + newOffset + ', 0)'}) :
                $pages.css({'-webkit-transform': 'matrix(1, 0, 0, 1, 0, ' + newOffset + ')'});

        }



        else if (options.swipeAnim === 'cover') {

            if (action === 'keep-backward' && options.drag) {
                $pageArr.removeClass('drag');
                options.direction === 'horizontal' ?
                $($pageArr[curPage-1]).css({'-webkit-transform': 'translateX(-100%)'}) :
                $($pageArr[curPage-1]).css({'-webkit-transform': 'translateY(-100%)'})
            }
            else if (action === 'keep-forward' && options.drag) {
                $pageArr.removeClass('drag');
                options.direction === 'horizontal' ?
                $($pageArr[curPage+1]).css({'-webkit-transform': 'translateX(100%)'}) :
                $($pageArr[curPage+1]).css({'-webkit-transform': 'translateY(100%)'})
            }
            else if (action === 'forward' && options.drag) {
                $pageArr.removeClass('drag');
                $($pageArr[curPage-1]).addClass('back'); // 纯粹为了在动画结束后隐藏，不涉及 CSS 中定义的动画
                $pageArr[curPage].style.webkitTransform = 'translate(0, 0)';
            }
            else if (action === 'backward' && options.drag) {
                $pageArr.removeClass('drag');
                $($pageArr[curPage+1]).addClass('back');
                $pageArr[curPage].style.webkitTransform = 'translate(0, 0)';
            }
            else if (action === 'forward' && !options.drag) {
                $pages.addClass('animate');
                $($pageArr[curPage-1]).addClass('back');
                $($pageArr[curPage]).addClass('front').show();
            }
            else if (action === 'backward' && !options.drag) {
                $pages.addClass('animate');
                $($pageArr[curPage+1]).addClass('back');
                $($pageArr[curPage]).addClass('front').show();
            }

        }

        movePrevent = true;         // 动画过程中不可移动
        setTimeout(function() {
            movePrevent = false;
        }, 300);
    }





    // 添加 forward / backward 状态类
    // ==============================

    function addDirecClass() {
        if(options.direction === 'horizontal'){
            if (endPos >= startPos) {
                $pages.removeClass('forward').addClass('backward');
            } else if (endPos < startPos) {
                $pages.removeClass('backward').addClass('forward');
            }
        } else {
            if (endPos >= startPos) {
                $pages.removeClass('forward').addClass('backward');
            } else if (endPos < startPos) {
                $pages.removeClass('backward').addClass('forward');
            }
        }
    }





    // 在第一页向前翻和末页前后翻都不允许
    // ==============================

    function isHeadOrTail() {
        if (options.direction === 'horizontal') {
            if ((endPos >= startPos && curPage === 0) ||
                (endPos <= startPos && curPage === pageCount-1)) {
                return true;
            }
        } else if ((endPos >= startPos && curPage === 0) ||
                (endPos <= startPos && curPage === pageCount-1)) {
            return true;
        }
        return false;
    }





    // 当前页动画显示
    // ==============================

    function animShow() {
        
        $animateDom.css({
        	'-webkit-animation': 'none',
        	'display': 'none'	// 解决部分 Android 机型 DOM 不自动重绘的 bug
        	});

        
        $('.current [data-animation]').each(function(index, element){
            var $element    = $(element),
                $animation  = $element.attr('data-animation'),
                $duration   = $element.attr('data-duration') || 500,
                $timfunc    = $element.attr('data-timing-function') || 'ease',
                $delay      = $element.attr('data-delay') ?  $element.attr('data-delay') : 0;


			if ($animation === 'followSlide') {
				
				if (options.direction === 'horizontal' && direction === 'forward') {
					$animation = 'followSlideToLeft';
				}
				else if (options.direction === 'horizontal' && direction === 'backward') {
					$animation = 'followSlideToRight';
				}
				else if (options.direction === 'vertical' && direction === 'forward') {
					$animation = 'followSlideToTop';
				}
				else if (options.direction === 'vertical' && direction === 'backward') {
					$animation = 'followSlideToBottom';
				}
				
			}

            $element.css({
//              '-webkit-animation': $animation +' '+ $duration + 'ms ' + $timfunc + ' '+ $delay + 'ms both',
				
				'display': 'block',
				
				// 为了兼容不支持贝塞尔曲线的动画，需要拆开写
				// 严格模式下不允许出现两个同名属性，所以不得已去掉 'use strict'
				'-webkit-animation-name': $animation,
				'-webkit-animation-duration': $duration + 'ms',
				'-webkit-animation-timing-function': 'ease',
				'-webkit-animation-timing-function': $timfunc,
				'-webkit-animation-delay': $delay + 'ms',
				'-webkit-animation-fill-mode': 'both'
            })
        });
    }



    // 事件代理绑定
    // ==============================

    $(document)
        .on('touchstart', '.page', function(e) {
            onStart(e.changedTouches[0]);
        })
        .on('touchmove', '.page', function(e) {
            onMove(e.changedTouches[0]);
        })
        .on('touchend', '.page', function(e) {
            onEnd(e.changedTouches[0]);
        })
        .on('webkitAnimationEnd webkitTransitionEnd', '.pages', function() {

			if (direction !== 'stay') {
				setTimeout(function() {
	                $(".back").hide().removeClass("back");
	                $(".front").show().removeClass("front");
	                $pages.removeClass('forward backward animate');
	            }, 10);
	
	            $($pageArr.removeClass('current').get(curPage)).addClass('current');
	            options.onchange(curPage, $pageArr[curPage], direction);  // 执行回调函数
	            animShow();
			}
            
        });

	
	$('.page *').on('webkitAnimationEnd', function() {
        event.stopPropagation();    // 事件代理无法阻止冒泡，所以要绑定取消
    })



    // 页面（含资源）加载完成
    // ==============================

    $(window).on("load", function() {

        if (options.loading) {
            $(".parallax-loading").remove();
            movePrevent = false;
            $($pageArr[curPage]).addClass('current');
            options.onchange(curPage, $pageArr[curPage], direction);
            animShow();
        }

        if (options.indicator) {
            movePrevent = false;
			
			var temp = options.direction === 'horizontal' ? 'parallax-h-indicator' : 'parallax-v-indicator'; 

            $('.wrapper').append('<div class='+temp+'></div>');
            var lists = '<ul>';
            for (var i=1; i<=pageCount; i++) {
                if (i===1) {
                    lists += '<li class="current"></li>'
                } else {
                    lists += '<li></li>'
                }
            }
            lists += '</ul>';
            $('.'+temp).append(lists);
        }

        if (options.arrow) {
            $pageArr.append('<span class="parallax-arrow"></span>');
            $($pageArr[pageCount-1]).find('.parallax-arrow').remove();
        }
    });
    
    
    
    
    // 翻转屏幕提示
    // ============================== 
    
    window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function() {
    	if (window.orientation === 180 || window.orientation === 0) {  
			options.orientationchange('portrait');
		}  
		if (window.orientation === 90 || window.orientation === -90 ){  
			options.orientationchange('landscape') 
		} 	
    }, false);



}(window.Zepto ||window.jQuery);



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



/**
 *
 *   @description: 该文件用于base64加密解码、md5相关类
 *
 *   @version    : 1.0.2
 *
 *   @create-date: 2015-03-25
 *
 *   @update-date: 2015-03-25
 *
 *   @update-log :
 *                 1.0.1 - base64加密解码、md5相关类
 *
 */
(function (global) {

    'use strict';


    /**
     * @module base.codec
     * @namespace BaseCodec
     * @property {string}   version                     - 文件版本号
     * @property {string}   base64encodechars           - base64加密key
     * @property {array}    base64decodechars           - base64解密数组
     * @property {function} encode                      - base64加密
     * @property {function} decode                      - base64解密
     * @property {function} utf16to8                    - utf16转换为utf8
     * @property {function} utf8to16                    - utf8转换为utf16
     * @property {function} utf8Encode                  - utf8编码
     * @property {function} binl2rstr                   - 把uinicode值转换为字符串
     * @property {function} rstr2binl                   - 把字符串值转换为unicode数组
     * @property {function} str2rstr_utf8               - 先用encodeURIComponent编码，再用unescape解码
     * @property {function} stringToHex                 - 将一个字符串转换为16进制
     * @property {function} hexToString                 - 将一个16进制字符串转换为普通字符串
     * @property {function} decodeUtf8to16Data64        - 将一个字符串用base64解密，并转换为utf16
     * @property {function} encodeUtf16to8Data64        - 将一个字符串转换为utf8，并用base64加密
     * @property {function} md5                         - md5加密
     *
     * @example
     *   var codec = require('base/codec');
     *   codec.md5('fjewaoicpwajg');
     */
 
    var version = '1.0.2';
    var base64encodechars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var base64decodechars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);

    var base64encode = function (str) {
        var out, i, len;
        var c1, c2, c3;
        len = str.length;
        i = 0;
        out = '';
        
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            
            if (i == len) {
                out += base64encodechars.charAt(c1 >> 2);
                out += base64encodechars.charAt((c1 & 0x3) << 4);
                out += '==';
                
                break;
            }
            c2 = str.charCodeAt(i++);
            
            if (i == len) {
                out += base64encodechars.charAt(c1 >> 2);
                out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
                out += base64encodechars.charAt((c2 & 0xf) << 2);
                out += '=';
                
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64encodechars.charAt(c1 >> 2);
            out += base64encodechars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xf0) >> 4));
            out += base64encodechars.charAt(((c2 & 0xf) << 2) | ((c3 & 0xc0) >> 6));
            out += base64encodechars.charAt(c3 & 0x3f);
        }

        return out;
    };

    var base64decode = function (str) {
        var c1, c2, c3, c4;
        var i, len, out;
        len = str.length;
        i = 0;
        out = '';
        
        while (i < len) {

            do {
                c1 = base64decodechars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c1 == -1);
            
            if (c1 == -1)
                
                break;

            do {
                c2 = base64decodechars[str.charCodeAt(i++) & 0xff];
            } while (i < len && c2 == -1);
            
            if (c2 == -1) {
                
                break;
            }
            out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));

            do {
                c3 = str.charCodeAt(i++) & 0xff;
                
                if (c3 == 61) {
                    
                    return out;
                }
                c3 = base64decodechars[c3];
            
            } while (i < len && c3 == -1);
            
            if (c3 == -1) {

                break;
            }
            out += String.fromCharCode(((c2 & 0xf) << 4) | ((c3 & 0x3c) >> 2));

            do {
                c4 = str.charCodeAt(i++) & 0xff;
                
                if (c4 == 61) {
                    
                    return out;
                }
                c4 = base64decodechars[c4];
            
            } while (i < len && c4 == -1);
            
            if (c4 == -1) {
                
                break;
            }
            out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
        }

        return out;
    };

    var utf16to8 = function (str) {
        var out, i, len, c;
        out = '';
        len = str.length;
        
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            
            if ((c >= 0x0001) && (c <= 0x007f)) {
                out += str.charAt(i);
            
            } else if (c > 0x07ff) {
                out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
            
            } else {
                out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
            }
        }
        
        return out;
    };

    var utf8to16 = function (str) {
        var out, i, len, c;
        var char2, char3;
        out = "";
        len = str.length;
        i = 0;
        
        while (i < len) {
            c = str.charCodeAt(i++);
            
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += str.charAt(i - 1);
                    
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x1f) << 6) | (char2 & 0x3f));
                    
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = str.charCodeAt(i++);
                    char3 = str.charCodeAt(i++);
                    out += String.fromCharCode(((c & 0x0f) << 12) |
                        ((char2 & 0x3f) << 6) |
                        ((char3 & 0x3f) << 0));
                    
                    break;
            }
        }
        
        return out;
    };

    // private method for UTF-8 encoding  
    var utf8Encode = function (string) {
        //string = string.replace(/\r\n/g,"\n");  
        var utftext = "";
        
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            
            if (c < 128) {
                utftext += String.fromCharCode(c);
            
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        
        return utftext;
    };

    // private method for UTF-8 decoding  
    var utf8Decode = function (utftext) {
        var string = '';
        var i = 0;
        var c = 0,c1 = 0, c2  = 0;
        
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            var c3;
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        
        return string;
    };
    
    /**
    *解码
    */
    var decodeUtf8to16Data64 = function (sEncoded) {
        var Data2 = utf8to16(base64decode(sEncoded));
        
        return Data2;
    };

    /**
    *编码
    */
    var encodeUtf16to8Data64 = function (sDecoded) {
        var Data2 = base64encode(utf16to8(sDecoded));
        
        return Data2;
    };


    var stringToHex = function (s) {
        var r = "0x";
        var hexes = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
        
        for (var i = 0; i < s.length; i++) {
            r += hexes[s.charCodeAt(i) >> 4] + hexes[s.charCodeAt(i) & 0xf];
        }

        return r;
    };

    var hexToString = function (h) {
        var r = "";
        
        for (var i = (h.substr(0, 2) == "0x") ? 2 : 0; i < h.length; i += 2) {
            r += String.fromCharCode(parseInt(h.substr(i, 2), 16));
        }
        
        return r;
    };

    /*
     *  MD5 
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    var safe_add = function (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        
        return (msw << 16) | (lsw & 0xFFFF);
    };

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    var bit_rol = function (num, cnt) {
        
        return (num << cnt) | (num >>> (32 - cnt));
    };

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    var md5_cmn = function (q, a, b, x, s, t) {
        
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    };

    var md5_ff = function (a, b, c, d, x, s, t) {
        
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    };

    var md5_gg = function (a, b, c, d, x, s, t) {
        
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    };

    var md5_hh = function (a, b, c, d, x, s, t) {
        
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    };

    var md5_ii = function (a, b, c, d, x, s, t) {
        
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    };

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    var binl_md5 = function (x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a = 1732584193,
            b = -271733879,
            c = -1732584194,
            d = 271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i], 7, -680876936);
            d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
            b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
            d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
            c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
            d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

            a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
            d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
            b = md5_gg(b, c, d, a, x[i], 20, -373897302);
            a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
            d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
            c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
            a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
            d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
            c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
            d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
            d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
            c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
            d = md5_hh(d, a, b, c, x[i], 11, -358537222);
            c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
            a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
            b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i], 6, -198630844);
            d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
            d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
            a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
            b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        
        return [a, b, c, d];
    };

    /*
     * Convert an array of little-endian words to a string
     */
    var binl2rstr = function (input) {
        var i,
            output = '';
        
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        
        return output;
    };

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    var rstr2binl = function (input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        
        return output;
    };

    /*
     * Calculate the MD5 of a raw string
     */
    var rstr_md5 = function (s) {
        
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    };

    /*
     * Calculate the HMAC-MD5, of a key and some data (raw strings)
     */
    var rstr_hmac_md5 = function (key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    };

    /*
     * Convert a raw string to a hex string
     */
    var rstr2hex = function (input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        
        return output;
    };

    /*
     * Encode a string as utf-8
     */
    var str2rstr_utf8 = function (input) {
        
        return unescape(encodeURIComponent(input));
    };

    /*
     * Take string arguments and return either raw or hex encoded strings
     */
    var raw_md5 = function (s) {
        
        return rstr_md5(str2rstr_utf8(s));
    };

    var hex_md5 = function (s) {
        
        return rstr2hex(raw_md5(s));
    };

    var raw_hmac_md5 = function (k, d) {
        
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    };

    var hex_hmac_md5 = function (k, d) {
        
        return rstr2hex(raw_hmac_md5(k, d));
    };

    var md5 = function (string, key, raw) {
        
        if (!key) {
            
            if (!raw) {
                
                return hex_md5(string);
            }
            
            return raw_md5(string);
        }
        
        if (!raw) {
            
            return hex_hmac_md5(key, string);
        }
        
        return raw_hmac_md5(key, string);
    };

    var Codec = {
        /**
         * @memberof BaseCodec
         * @summary 文件版本号
         * @type {string}
         */
        version: version,

        /**
         * @memberof BaseCodec
         * @summary base64加密key
         * @type {string}
         */
        base64encodechars: base64encodechars,

        /**
         * @memberof BaseCodec
         * @summary base64解密数组
         * @type {array}
         */
        base64decodechars: base64decodechars,

        /**
         * @memberof BaseCodec
         * @summary base64加密
         * @type {function}
         * @param  {string}  str                            - 要编码的字符串
         * @return {string}                                 - 编码后的字符串
         */
        encode: base64encode,

        /**
         * @memberof BaseCodec
         * @summary base64解密
         * @type {function}
         * @param  {string}  str                            - 要解码的字符串
         * @return {string}                                 - 解码后的字符串
         */
        decode: base64decode,

        /**
         * @memberof BaseCodec
         * @summary utf16转换为utf8
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        utf16to8: utf16to8,

        /**
         * @memberof BaseCodec
         * @summary utf8转换为utf16
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        utf8to16: utf8to16,

        /**
         * @memberof BaseCodec
         * @summary utf8编码
         * @type {function}
         * @param  {string}  str                            - 要编码的字符串
         * @return {string}                                 - 编码后的字符串
         */
        utf8Encode: utf8Encode,

        /**
         * @memberof BaseCodec
         * @summary utf8解码
         * @type {function}
         * @param  {string}  str                            - 要解码的字符串
         * @return {string}                                 - 解码后的字符串
         */
        utf8Decode: utf8Decode,

        /**
         * @memberof BaseCodec
         * @summary 把uinicode值转换为字符串
         * @type {function}
         * @param  {array}  arr                             - 要转换的unicode值数组
         * @return {string}                                 - 转换后的字符串
         */
        binl2rstr: binl2rstr,

        /**
         * @memberof BaseCodec
         * @summary 把字符串值转换为unicode数组
         * @type {function}
         * @param  {array}  arr                             - 要转换的字符串数组
         * @return {array}                                  - 转换后的字符串数组
         */
        rstr2binl: rstr2binl,

        /**
         * @memberof BaseCodec
         * @summary 先用encodeURIComponent编码，再用unescape解码
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        str2rstr_utf8: str2rstr_utf8,

        /**
         * @memberof BaseCodec
         * @summary 将一个字符串转换为16进制
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        stringToHex: stringToHex,

        /**
         * @memberof BaseCodec
         * @summary 将一个16进制字符串转换为普通字符串
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        hexToString: hexToString,

        /**
         * @memberof BaseCodec
         * @summary 将一个字符串用base64解密，并转换为utf16
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        decodeUtf8to16Data64: decodeUtf8to16Data64,

        /**
         * @memberof BaseCodec
         * @summary 将一个字符串转换为utf8，并用base64加密
         * @type {function}
         * @param  {string}  str                            - 要转换的字符串
         * @return {string}                                 - 转换后的字符串
         */
        encodeUtf16to8Data64: encodeUtf16to8Data64,

        /**
         * @memberof BaseCodec
         * @summary md5加密
         * @type {function}
         * @param  {string}  str                            - 要进行md5加密的字符串
         * @param  {string}  key                            - (可选参数) 指定秘钥
         * @param  {string}  raw                            - (可选参数) 16进制
         * @return {string}                                 - 加密后的字符串
         */
        md5: md5
    };
    window.Codec=Codec;
    /*
     * 兼容 RequireJS 和 Sea.js
     */
    if (typeof define === "function") {
        define('base/codec',function(require, exports, module) {
            module.exports = Codec;
        })
    }

}(window));
/*
 * qrcode,QRCode
 * Version: 3.0.5
 ---
 ## 采用默认方式画二维码"
引入本js, ./qrcode.js
 ````html
 <div id="qrcodeDefault"></div>
 ````

 ````javascript

 var qrnode = new QRCode({
     text: 'http://www.alipay.com/'
 });
 document.getElementById('qrcodeDefault').appendChild(qrnode);
 ````

 ## 调用table画二维码

 ````html
 <div id="qrcodeTable"></div>
 ````

 ````javascript

 var qrnode = new QRCode({
 render: 'table',
 correctLevel: 0,
 pdground: '#00aaee',
 text: 'http://www.alipay.com/',
 size: 100,
 image : 'https://t.alipayobjects.com/images/rmsweb/T1ZsxhXdxbXXXXXXXX.png'
 });
 document.getElementById('qrcodeTable').appendChild(qrnode);
 ````

 ## 调用canvas画二维码

 ````html
 <div id="qrcodeCanvas"></div>
 ````

 ````javascript
 var qrnode = new QRCode({
 render: 'canvas',
 correctLevel: 0,
 text: 'http://www.alipay.com/',
 size: 300,
 background: '#eeeeee',
 foreground: '#667766',
 pdground: '#00aaee',
 image : 'https://t.alipayobjects.com/images/rmsweb/T1ZsxhXdxbXXXXXXXX.png',
 imageSize : 100
 });
 document.getElementById('qrcodeCanvas').appendChild(qrnode);
 ````

 ## 调用svg画二维码

 ````html
 <div id="qrcodeSVG"></div>
 ````

 ````javascript
 var qrnode = new QRCode({
 correctLevel: 0,
 render: 'svg',
 text: 'http://www.alipay.com/',
 size: 200,
 pdground: '#00aaee',
 image : 'https://t.alipayobjects.com/images/rmsweb/T1ZsxhXdxbXXXXXXXX.png',
 imageSize:30
 });
 document.getElementById('qrcodeSVG').appendChild(qrnode);
 ````

 */
 

(function(global){
  'use strict';
  function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
      if (!source) continue;
      for (var property in source) {
        object[property] = source[property];
      }
    }

    return object;
  }

  /**
   * module.exports = QRCodeAlg;
   */

  /**
   * 获取单个字符的utf8编码
   * unicode BMP平面约65535个字符
   * @param {num} code
   * return {array}
   */
  function unicodeFormat8(code) {
    var c0,c1,c2;
    // 1 byte
    if (code < 128) {
      return [code];
      // 2 bytes
    } else if (code < 2048) {
      c0 = 192 + (code >> 6);
      c1 = 128 + (code & 63);
      return [c0, c1];
      // 3 bytes
    } else {
      c0 = 224 + (code >> 12);
      c1 = 128 + (code >> 6 & 63);
      c2 = 128 + (code & 63);
      return [c0, c1, c2];
    }
  }

  /**
   * 获取字符串的utf8编码字节串
   * @param {string} string
   * @return {array}
   */
  function getUTF8Bytes(string) {
    var utf8codes = [];
    for (var i = 0; i < string.length; i++) {
      var code = string.charCodeAt(i);
      var utf8 = unicodeFormat8(code);
      for (var j = 0; j < utf8.length; j++) {
        utf8codes.push(utf8[j]);
      }
    }
    return utf8codes;
  }

  /**
   * 二维码算法实现
   * @param {string} data 要编码的信息字符串
   * @param {num} errorCorrectLevel 纠错等级
   */
  function QRCodeAlg(data, errorCorrectLevel) {
    this.typeNumber = -1; //版本
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null; //二维矩阵，存放最终结果
    this.moduleCount = 0; //矩阵大小
    this.dataCache = null; //数据缓存
    this.rsBlocks = null; //版本数据信息
    this.totalDataCount = -1; //可使用的数据量
    this.data = data;
    this.utf8bytes = getUTF8Bytes(data);
    this.make();
  }

  QRCodeAlg.prototype = {
    constructor: QRCodeAlg,
    /**
     * 获取二维码矩阵大小
     * @return {num} 矩阵大小
     */
    getModuleCount: function getModuleCount() {
      return this.moduleCount;
    },
    /**
     * 编码
     */
    make: function make() {
      this.getRightType();
      this.dataCache = this.createData();
      this.createQrcode();
    },
    /**
     * 设置二位矩阵功能图形
     * @param  {bool} test 表示是否在寻找最好掩膜阶段
     * @param  {num} maskPattern 掩膜的版本
     */
    makeImpl: function makeImpl(maskPattern) {

      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = new Array(this.moduleCount);

      for (var row = 0; row < this.moduleCount; row++) {

        this.modules[row] = new Array(this.moduleCount);
      }
      this.setupPositionProbePattern(0, 0);
      this.setupPositionProbePattern(this.moduleCount - 7, 0);
      this.setupPositionProbePattern(0, this.moduleCount - 7);
      this.setupPositionAdjustPattern();
      this.setupTimingPattern();
      this.setupTypeInfo(true, maskPattern);

      if (this.typeNumber >= 7) {
        this.setupTypeNumber(true);
      }
      this.mapData(this.dataCache, maskPattern);
    },
    /**
     * 设置二维码的位置探测图形
     * @param  {num} row 探测图形的中心横坐标
     * @param  {num} col 探测图形的中心纵坐标
     */
    setupPositionProbePattern: function setupPositionProbePattern(row, col) {

      for (var r = -1; r <= 7; r++) {

        if (row + r <= -1 || this.moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c++) {

          if (col + c <= -1 || this.moduleCount <= col + c) continue;

          if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
            this.modules[row + r][col + c] = true;
          } else {
            this.modules[row + r][col + c] = false;
          }
        }
      }
    },
    /**
     * 创建二维码
     * @return {[type]} [description]
     */
    createQrcode: function createQrcode() {

      var minLostPoint = 0;
      var pattern = 0;
      var bestModules = null;

      for (var i = 0; i < 8; i++) {

        this.makeImpl(i);

        var lostPoint = QRUtil.getLostPoint(this);
        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
          bestModules = this.modules;
        }
      }
      this.modules = bestModules;
      this.setupTypeInfo(false, pattern);

      if (this.typeNumber >= 7) {
        this.setupTypeNumber(false);
      }
    },
    /**
     * 设置定位图形
     * @return {[type]} [description]
     */
    setupTimingPattern: function setupTimingPattern() {

      for (var r = 8; r < this.moduleCount - 8; r++) {
        if (this.modules[r][6] != null) {
          continue;
        }
        this.modules[r][6] = r % 2 == 0;

        if (this.modules[6][r] != null) {
          continue;
        }
        this.modules[6][r] = r % 2 == 0;
      }
    },
    /**
     * 设置矫正图形
     * @return {[type]} [description]
     */
    setupPositionAdjustPattern: function setupPositionAdjustPattern() {

      var pos = QRUtil.getPatternPosition(this.typeNumber);

      for (var i = 0; i < pos.length; i++) {

        for (var j = 0; j < pos.length; j++) {

          var row = pos[i];
          var col = pos[j];

          if (this.modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r++) {

            for (var c = -2; c <= 2; c++) {

              if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                this.modules[row + r][col + c] = true;
              } else {
                this.modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    },
    /**
     * 设置版本信息（7以上版本才有）
     * @param  {bool} test 是否处于判断最佳掩膜阶段
     * @return {[type]}      [description]
     */
    setupTypeNumber: function setupTypeNumber(test) {

      var bits = QRUtil.getBCHTypeNumber(this.typeNumber);

      for (var i = 0; i < 18; i++) {
        var mod = !test && (bits >> i & 1) == 1;
        this.modules[Math.floor(i / 3)][i % 3 + this.moduleCount - 8 - 3] = mod;
        this.modules[i % 3 + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    },
    /**
     * 设置格式信息（纠错等级和掩膜版本）
     * @param  {bool} test
     * @param  {num} maskPattern 掩膜版本
     * @return {}
     */
    setupTypeInfo: function setupTypeInfo(test, maskPattern) {

      var data = QRErrorCorrectLevel[this.errorCorrectLevel] << 3 | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i++) {

        var mod = !test && (bits >> i & 1) == 1;

        if (i < 6) {
          this.modules[i][8] = mod;
        } else if (i < 8) {
          this.modules[i + 1][8] = mod;
        } else {
          this.modules[this.moduleCount - 15 + i][8] = mod;
        }

        // horizontal
        var mod = !test && (bits >> i & 1) == 1;

        if (i < 8) {
          this.modules[8][this.moduleCount - i - 1] = mod;
        } else if (i < 9) {
          this.modules[8][15 - i - 1 + 1] = mod;
        } else {
          this.modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      this.modules[this.moduleCount - 8][8] = !test;
    },
    /**
     * 数据编码
     * @return {[type]} [description]
     */
    createData: function createData() {
      var buffer = new QRBitBuffer();
      var lengthBits = this.typeNumber > 9 ? 16 : 8;
      buffer.put(4, 4); //添加模式
      buffer.put(this.utf8bytes.length, lengthBits);
      for (var i = 0, l = this.utf8bytes.length; i < l; i++) {
        buffer.put(this.utf8bytes[i], 8);
      }
      if (buffer.length + 4 <= this.totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.length % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.length >= this.totalDataCount * 8) {
          break;
        }
        buffer.put(QRCodeAlg.PAD0, 8);

        if (buffer.length >= this.totalDataCount * 8) {
          break;
        }
        buffer.put(QRCodeAlg.PAD1, 8);
      }
      return this.createBytes(buffer);
    },
    /**
     * 纠错码编码
     * @param  {buffer} buffer 数据编码
     * @return {[type]}
     */
    createBytes: function createBytes(buffer) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var length = this.rsBlock.length / 3;

      var rsBlocks = new Array();

      for (var i = 0; i < length; i++) {

        var count = this.rsBlock[i * 3 + 0];
        var totalCount = this.rsBlock[i * 3 + 1];
        var dataCount = this.rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j++) {
          rsBlocks.push([dataCount, totalCount]);
        }
      }

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r++) {

        var dcCount = rsBlocks[r][0];
        var ecCount = rsBlocks[r][1] - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i++) {
          dcdata[r][i] = 0xff & buffer.buffer[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i++) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
        }
      }

      var data = new Array(this.totalDataCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i++) {
        for (var r = 0; r < rsBlocks.length; r++) {
          if (i < dcdata[r].length) {
            data[index++] = dcdata[r][i];
          }
        }
      }

      for (var i = 0; i < maxEcCount; i++) {
        for (var r = 0; r < rsBlocks.length; r++) {
          if (i < ecdata[r].length) {
            data[index++] = ecdata[r][i];
          }
        }
      }

      return data;
    },
    /**
     * 布置模块，构建最终信息
     * @param  {} data
     * @param  {} maskPattern
     * @return {}
     */
    mapData: function mapData(data, maskPattern) {

      var inc = -1;
      var row = this.moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;

      for (var col = this.moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col--;

        while (true) {

          for (var c = 0; c < 2; c++) {

            if (this.modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) == 1;
              }

              var mask = QRUtil.getMask(maskPattern, row, col - c);

              if (mask) {
                dark = !dark;
              }

              this.modules[row][col - c] = dark;
              bitIndex--;

              if (bitIndex == -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || this.moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }

  };
  /**
   * 填充字段
   */
  QRCodeAlg.PAD0 = 0xEC;
  QRCodeAlg.PAD1 = 0x11;

//---------------------------------------------------------------------
// 纠错等级对应的编码
//---------------------------------------------------------------------

  var QRErrorCorrectLevel = [1, 0, 3, 2];

//---------------------------------------------------------------------
// 掩膜版本
//---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };

//---------------------------------------------------------------------
// 工具类
//---------------------------------------------------------------------

  var QRUtil = {

    /*
     每个版本矫正图形的位置
     */
    PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],

    G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0,
    G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0,
    G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1,

    /*
     BCH编码格式信息
     */
    getBCHTypeInfo: function getBCHTypeInfo(data) {
      var d = data << 10;
      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
        d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
      }
      return (data << 10 | d) ^ QRUtil.G15_MASK;
    },
    /*
     BCH编码版本信息
     */
    getBCHTypeNumber: function getBCHTypeNumber(data) {
      var d = data << 12;
      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
        d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
      }
      return data << 12 | d;
    },
    /*
     获取BCH位信息
     */
    getBCHDigit: function getBCHDigit(data) {

      var digit = 0;

      while (data != 0) {
        digit++;
        data >>>= 1;
      }

      return digit;
    },
    /*
     获取版本对应的矫正图形位置
     */
    getPatternPosition: function getPatternPosition(typeNumber) {
      return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    },
    /*
     掩膜算法
     */
    getMask: function getMask(maskPattern, i, j) {

      switch (maskPattern) {

        case QRMaskPattern.PATTERN000:
          return (i + j) % 2 == 0;
        case QRMaskPattern.PATTERN001:
          return i % 2 == 0;
        case QRMaskPattern.PATTERN010:
          return j % 3 == 0;
        case QRMaskPattern.PATTERN011:
          return (i + j) % 3 == 0;
        case QRMaskPattern.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
        case QRMaskPattern.PATTERN101:
          return i * j % 2 + i * j % 3 == 0;
        case QRMaskPattern.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 == 0;
        case QRMaskPattern.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 == 0;

        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    },
    /*
     获取RS的纠错多项式
     */
    getErrorCorrectPolynomial: function getErrorCorrectPolynomial(errorCorrectLength) {

      var a = new QRPolynomial([1], 0);

      for (var i = 0; i < errorCorrectLength; i++) {
        a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
      }

      return a;
    },
    /*
     获取评价
     */
    getLostPoint: function getLostPoint(qrCode) {

      var moduleCount = qrCode.getModuleCount(),
          lostPoint = 0,
          darkCount = 0;

      for (var row = 0; row < moduleCount; row++) {

        var sameCount = 0;
        var head = qrCode.modules[row][0];

        for (var col = 0; col < moduleCount; col++) {

          var current = qrCode.modules[row][col];

          //level 3 评价
          if (col < moduleCount - 6) {
            if (current && !qrCode.modules[row][col + 1] && qrCode.modules[row][col + 2] && qrCode.modules[row][col + 3] && qrCode.modules[row][col + 4] && !qrCode.modules[row][col + 5] && qrCode.modules[row][col + 6]) {
              if (col < moduleCount - 10) {
                if (qrCode.modules[row][col + 7] && qrCode.modules[row][col + 8] && qrCode.modules[row][col + 9] && qrCode.modules[row][col + 10]) {
                  lostPoint += 40;
                }
              } else if (col > 3) {
                if (qrCode.modules[row][col - 1] && qrCode.modules[row][col - 2] && qrCode.modules[row][col - 3] && qrCode.modules[row][col - 4]) {
                  lostPoint += 40;
                }
              }
            }
          }

          //level 2 评价
          if (row < moduleCount - 1 && col < moduleCount - 1) {
            var count = 0;
            if (current) count++;
            if (qrCode.modules[row + 1][col]) count++;
            if (qrCode.modules[row][col + 1]) count++;
            if (qrCode.modules[row + 1][col + 1]) count++;
            if (count == 0 || count == 4) {
              lostPoint += 3;
            }
          }

          //level 1 评价
          if (head ^ current) {
            sameCount++;
          } else {
            head = current;
            if (sameCount >= 5) {
              lostPoint += 3 + sameCount - 5;
            }
            sameCount = 1;
          }

          //level 4 评价
          if (current) {
            darkCount++;
          }
        }
      }

      for (var col = 0; col < moduleCount; col++) {

        var sameCount = 0;
        var head = qrCode.modules[0][col];

        for (var row = 0; row < moduleCount; row++) {

          var current = qrCode.modules[row][col];

          //level 3 评价
          if (row < moduleCount - 6) {
            if (current && !qrCode.modules[row + 1][col] && qrCode.modules[row + 2][col] && qrCode.modules[row + 3][col] && qrCode.modules[row + 4][col] && !qrCode.modules[row + 5][col] && qrCode.modules[row + 6][col]) {
              if (row < moduleCount - 10) {
                if (qrCode.modules[row + 7][col] && qrCode.modules[row + 8][col] && qrCode.modules[row + 9][col] && qrCode.modules[row + 10][col]) {
                  lostPoint += 40;
                }
              } else if (row > 3) {
                if (qrCode.modules[row - 1][col] && qrCode.modules[row - 2][col] && qrCode.modules[row - 3][col] && qrCode.modules[row - 4][col]) {
                  lostPoint += 40;
                }
              }
            }
          }

          //level 1 评价
          if (head ^ current) {
            sameCount++;
          } else {
            head = current;
            if (sameCount >= 5) {
              lostPoint += 3 + sameCount - 5;
            }
            sameCount = 1;
          }
        }
      }

      // LEVEL4

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    }

  };

//---------------------------------------------------------------------
// QRMath使用的数学工具
//---------------------------------------------------------------------

  var QRMath = {
    /*
     将n转化为a^m
     */
    glog: function glog(n) {

      if (n < 1) {
        throw new Error("glog(" + n + ")");
      }

      return QRMath.LOG_TABLE[n];
    },
    /*
     将a^m转化为n
     */
    gexp: function gexp(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return QRMath.EXP_TABLE[n];
    },

    EXP_TABLE: new Array(256),

    LOG_TABLE: new Array(256)

  };

  for (var i = 0; i < 8; i++) {
    QRMath.EXP_TABLE[i] = 1 << i;
  }
  for (var i = 8; i < 256; i++) {
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
  }
  for (var i = 0; i < 255; i++) {
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
  }

//---------------------------------------------------------------------
// QRPolynomial 多项式
//---------------------------------------------------------------------
  /**
   * 多项式类
   * @param {Array} num   系数
   * @param {num} shift a^shift
   */
  function QRPolynomial(num, shift) {

    if (num.length == undefined) {
      throw new Error(num.length + "/" + shift);
    }

    var offset = 0;

    while (offset < num.length && num[offset] == 0) {
      offset++;
    }

    this.num = new Array(num.length - offset + shift);
    for (var i = 0; i < num.length - offset; i++) {
      this.num[i] = num[i + offset];
    }
  }

  QRPolynomial.prototype = {

    get: function get(index) {
      return this.num[index];
    },

    getLength: function getLength() {
      return this.num.length;
    },
    /**
     * 多项式乘法
     * @param  {QRPolynomial} e 被乘多项式
     * @return {[type]}   [description]
     */
    multiply: function multiply(e) {

      var num = new Array(this.getLength() + e.getLength() - 1);

      for (var i = 0; i < this.getLength(); i++) {
        for (var j = 0; j < e.getLength(); j++) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
        }
      }

      return new QRPolynomial(num, 0);
    },
    /**
     * 多项式模运算
     * @param  {QRPolynomial} e 模多项式
     * @return {}
     */
    mod: function mod(e) {
      var tl = this.getLength(),
          el = e.getLength();
      if (tl - el < 0) {
        return this;
      }
      var num = new Array(tl);
      for (var i = 0; i < tl; i++) {
        num[i] = this.get(i);
      }
      while (num.length >= el) {
        var ratio = QRMath.glog(num[0]) - QRMath.glog(e.get(0));

        for (var i = 0; i < e.getLength(); i++) {
          num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
        }
        while (num[0] == 0) {
          num.shift();
        }
      }
      return new QRPolynomial(num, 0);
    }
  };

//---------------------------------------------------------------------
// RS_BLOCK_TABLE
//---------------------------------------------------------------------
  /*
   二维码各个版本信息[块数, 每块中的数据块数, 每块中的信息块数]
   */
  var RS_BLOCK_TABLE = [

// L
// M
// Q
// H

// 1
    [1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9],

// 2
    [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16],

// 3
    [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13],

// 4
    [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9],

// 5
    [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12],

// 6
    [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15],

// 7
    [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14],

// 8
    [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15],

// 9
    [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13],

// 10
    [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16],

// 11
    [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13],

// 12
    [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15],

// 13
    [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12],

// 14
    [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13],

// 15
    [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12],

// 16
    [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16],

// 17
    [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15],

// 18
    [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15],

// 19
    [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14],

// 20
    [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16],

// 21
    [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17],

// 22
    [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13],

// 23
    [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16],

// 24
    [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17],

// 25
    [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16],

// 26
    [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17],

// 27
    [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16],

// 28
    [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16],

// 29
    [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16],

// 30
    [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16],

// 31
    [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16],

// 32
    [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16],

// 33
    [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16],

// 34
    [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17],

// 35
    [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16],

// 36
    [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16],

// 37
    [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16],

// 38
    [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16],

// 39
    [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16],

// 40
    [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];

  /**
   * 根据数据获取对应版本
   * @return {[type]} [description]
   */
  QRCodeAlg.prototype.getRightType = function () {
    for (var typeNumber = 1; typeNumber < 41; typeNumber++) {
      var rsBlock = RS_BLOCK_TABLE[(typeNumber - 1) * 4 + this.errorCorrectLevel];
      if (rsBlock == undefined) {
        throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + this.errorCorrectLevel);
      }
      var length = rsBlock.length / 3;
      var totalDataCount = 0;
      for (var i = 0; i < length; i++) {
        var count = rsBlock[i * 3 + 0];
        var dataCount = rsBlock[i * 3 + 2];
        totalDataCount += dataCount * count;
      }

      var lengthBytes = typeNumber > 9 ? 2 : 1;
      if (this.utf8bytes.length + lengthBytes < totalDataCount || typeNumber == 40) {
        this.typeNumber = typeNumber;
        this.rsBlock = rsBlock;
        this.totalDataCount = totalDataCount;
        break;
      }
    }
  };

//---------------------------------------------------------------------
// QRBitBuffer
//---------------------------------------------------------------------

  function QRBitBuffer() {
    this.buffer = new Array();
    this.length = 0;
  }

  QRBitBuffer.prototype = {

    get: function get(index) {
      var bufIndex = Math.floor(index / 8);
      return this.buffer[bufIndex] >>> 7 - index % 8 & 1;
    },

    put: function put(num, length) {
      for (var i = 0; i < length; i++) {
        this.putBit(num >>> length - i - 1 & 1);
      }
    },

    putBit: function putBit(bit) {

      var bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) {
        this.buffer.push(0);
      }

      if (bit) {
        this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
      }

      this.length++;
    }
  };

  var qrcodeAlgObjCache = [];

  /**
   * 计算矩阵点的前景色
   * @param {Obj} config
   * @param {Number} config.row 点x坐标
   * @param {Number} config.col 点y坐标
   * @param {Number} config.count 矩阵大小
   * @param {Number} config.options 组件的options
   * @return {String}
   */
  var getForeGround = function getForeGround(config) {
    var options = config.options;
    if (options.pdground && (config.row > 1 && config.row < 5 && config.col > 1 && config.col < 5 || config.row > config.count - 6 && config.row < config.count - 2 && config.col > 1 && config.col < 5 || config.row > 1 && config.row < 5 && config.col > config.count - 6 && config.col < config.count - 2)) {
      return options.pdground;
    }
    return options.foreground;
  };
  /**
   * 点是否在Position Detection
   * @param  {row} 矩阵行
   * @param  {col} 矩阵列
   * @param  {count} 矩阵大小
   * @return {Boolean}
   */
  var inPositionDetection = function inPositionDetection(row, col, count) {
    if (row < 7 && col < 7 || row > count - 8 && col < 7 || row < 7 && col > count - 8) {
      return true;
    }
    return false;
  };

  /**
   * 二维码构造函数，主要用于绘制
   * @param  {参数列表} opt 传递参数
   * @return {}
   */
  var qrcode = function qrcode(opt) {
    if (typeof opt === 'string') {
      // 只编码ASCII字符串
      opt = {
        text: opt
      };
    }
    //设置默认参数
    this.options = extend({}, {
      text: '',
      render: '',
      size: 256,
      correctLevel: 3,
      background: '#ffffff',
      foreground: '#000000',
      image: '',
      imageSize: 30
    }, opt);

    //使用QRCodeAlg创建二维码结构
    var qrCodeAlg = null;
    for (var i = 0, l = qrcodeAlgObjCache.length; i < l; i++) {
      if (qrcodeAlgObjCache[i].text == this.options.text && qrcodeAlgObjCache[i].text.correctLevel == this.options.correctLevel) {
        qrCodeAlg = qrcodeAlgObjCache[i].obj;
        break;
      }
    }

    if (i == l) {
      qrCodeAlg = new QRCodeAlg(this.options.text, this.options.correctLevel);
      qrcodeAlgObjCache.push({ text: this.options.text, correctLevel: this.options.correctLevel, obj: qrCodeAlg });
    }

    if (this.options.render) {
      switch (this.options.render) {
        case 'canvas':
          return this.createCanvas(qrCodeAlg);
        case 'table':
          return this.createTable(qrCodeAlg);
        case 'svg':
          return this.createSVG(qrCodeAlg);
        default:
          return this.createDefault(qrCodeAlg);
      }
    }
    return this.createDefault(qrCodeAlg);
  };

  extend(qrcode.prototype, {
    // default create  canvas -> svg -> table
    createDefault: function createDefault(qrCodeAlg) {
      var canvas = document.createElement('canvas');
      if (canvas.getContext) {
        return this.createCanvas(qrCodeAlg);
      }
      var SVG_NS = 'http://www.w3.org/2000/svg';
      if (!!document.createElementNS && !!document.createElementNS(SVG_NS, 'svg').createSVGRect) {
        return this.createSVG(qrCodeAlg);
      }
      return this.createTable(qrCodeAlg);
    },
    // canvas create
    createCanvas: function createCanvas(qrCodeAlg) {
      var options = this.options;
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var count = qrCodeAlg.getModuleCount();
      // preload img
      var loadImage = function loadImage(url, callback) {
        var img = new Image();
        img.src = url;
        img.onload = function () {
          callback(this);
          img.onload = null;
        };
      };

      //计算每个点的长宽
      var tileW = (options.size / count).toPrecision(4);
      var tileH = (options.size / count).toPrecision(4);

      canvas.width = options.size;
      canvas.height = options.size;

      //绘制
      for (var row = 0; row < count; row++) {
        for (var col = 0; col < count; col++) {
          var w = Math.ceil((col + 1) * tileW) - Math.floor(col * tileW);
          var h = Math.ceil((row + 1) * tileW) - Math.floor(row * tileW);
          var foreground = getForeGround({
            row: row,
            col: col,
            count: count,
            options: options
          });
          ctx.fillStyle = qrCodeAlg.modules[row][col] ? foreground : options.background;
          ctx.fillRect(Math.round(col * tileW), Math.round(row * tileH), w, h);
        }
      }
      if (options.image) {
        loadImage(options.image, function (img) {
          var x = ((options.size - options.imageSize) / 2).toFixed(2);
          var y = ((options.size - options.imageSize) / 2).toFixed(2);
          ctx.drawImage(img, x, y, options.imageSize, options.imageSize);
        });
      }
      return canvas;
    },
    // table create
    createTable: function createTable(qrCodeAlg) {
      var options = this.options;
      var count = qrCodeAlg.getModuleCount();

      // 计算每个节点的长宽；取整，防止点之间出现分离
      var tileW = Math.floor(options.size / count);
      var tileH = Math.floor(options.size / count);
      if (tileW <= 0) {
        tileW = count < 80 ? 2 : 1;
      }
      if (tileH <= 0) {
        tileH = count < 80 ? 2 : 1;
      }

      //创建table节点
      //重算码大小
      var s = [];
      s.push('<table style="border:0px; margin:0px; padding:0px; border-collapse:collapse; background-color:' + options.background + ';">');

      // 绘制二维码
      for (var row = 0; row < count; row++) {
        s.push('<tr style="border:0px; margin:0px; padding:0px; height:' + tileH + 'px">');
        for (var col = 0; col < count; col++) {
          var foreground = getForeGround({
            row: row,
            col: col,
            count: count,
            options: options
          });
          if (qrCodeAlg.modules[row][col]) {
            s.push('<td style="border:0px; margin:0px; padding:0px; width:' + tileW + 'px; background-color:' + foreground + '"></td>');
          } else {
            s.push('<td style="border:0px; margin:0px; padding:0px; width:' + tileW + 'px; background-color:' + options.background + '"></td>');
          }
        }
        s.push('</tr>');
      }
      s.push('</table>');

      if (options.image) {
        // 计算表格的总大小
        var width = tileW * count;
        var height = tileH * count;
        var x = ((width - options.imageSize) / 2).toFixed(2);
        var y = ((height - options.imageSize) / 2).toFixed(2);
        s.unshift('<div style=\'position:relative; \n                        width:' + width + 'px; \n                        height:' + height + 'px;\'>');
        s.push('<img src=\'' + options.image + '\' \n                        width=\'' + options.imageSize + '\' \n                        height=\'' + options.imageSize + '\' \n                        style=\'position:absolute;left:' + x + 'px; top:' + y + 'px;\'>');
        s.push('</div>');
      }

      var span = document.createElement('span');
      span.innerHTML = s.join('');

      return span.firstChild;
    },
    // create svg
    createSVG: function createSVG(qrCodeAlg) {
      var options = this.options;
      var count = qrCodeAlg.getModuleCount();
      var scale = count / options.size;

      // create svg
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', options.size);
      svg.setAttribute('height', options.size);
      svg.setAttribute('viewBox', '0 0 ' + count + ' ' + count);

      for (var row = 0; row < count; row++) {
        for (var col = 0; col < count; col++) {
          var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          var foreground = getForeGround({
            row: row,
            col: col,
            count: count,
            options: options
          });
          rect.setAttribute('x', col);
          rect.setAttribute('y', row);
          rect.setAttribute('width', 1);
          rect.setAttribute('height', 1);
          rect.setAttribute('stroke-width', 0);
          if (qrCodeAlg.modules[row][col]) {
            rect.setAttribute('fill', foreground);
          } else {
            rect.setAttribute('fill', options.background);
          }
          svg.appendChild(rect);
        }
      }

      // create image
      if (options.image) {
        var img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', options.image);
        img.setAttribute('x', ((count - options.imageSize * scale) / 2).toFixed(2));
        img.setAttribute('y', ((count - options.imageSize * scale) / 2).toFixed(2));
        img.setAttribute('width', options.imageSize * scale);
        img.setAttribute('height', options.imageSize * scale);
        svg.appendChild(img);
      }

      return svg;
    }
  });

    window.QRCode = qrcode;

    if (typeof define === "function") {
        define('base/qrcode',function(require, exports, module) {
            module.exports  = qrcode;
        })
    }

})(window);
