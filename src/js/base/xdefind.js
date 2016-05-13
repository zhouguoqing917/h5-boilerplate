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

    /**
     * 没有seajs的时候生效
     */
    if (!global.seajs && typeof global.define !== 'function' && typeof global.require !== 'function') {
        //没有模块化，就初始化一个最简单的模块
        function isType(type) {
            return function (obj) {
                return {}.toString.call(obj) == "[object " + type + "]"
            }
        }

        var isFunction = isType("Function");
        var cachedMods = {};

        function Module() {
        };
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
            var meta = {
                id: id,
                deps: deps,
                factory: factory
            };

            Module.save(meta);
        };

        Module.save = function (meta) {
            var mod = Module.get(meta.id);
            mod.id = meta.id;
            mod.dependencies = meta.deps;
            mod.factory = meta.factory;
        };
        Module.get = function (id) {
            return cachedMods[id] || (cachedMods[id] = new Module());
        };
        global.require = function (id) {
            var mod = Module.get(id);
            if (!mod.execed) {
                mod.exec()
            }
            return mod.exports;
        }

    }

})(this);
