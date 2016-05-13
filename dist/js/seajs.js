/**!
 * Sea.js 2.2.4 优化版
 */
window.svp = window.svp || {};
(function(global) {
    if (global.seajs) {
        return;
    }
    var seajs = global.seajs = {
        version: "2.2.4"
    };
    var data = seajs.data = {};
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
    var isUndefined = isType("Undefined");

    var _cid = 0;
    function cid() {
        return _cid++
    }

    /**
     * util-events.js - The minimal events support
     */

    var events = data.events = {};

// Bind event
    seajs.on = function(name, callback) {
        var list = events[name] || (events[name] = []);
        list.push(callback);
        return seajs;
    };

// Remove event. If `callback` is undefined, remove all callbacks for the
// event. If `event` and `callback` are both undefined, remove all callbacks
// for all events
    seajs.off = function(name, callback) {
        // Remove *all* events
        if (!(name || callback)) {
            events = data.events = {};
            return seajs;
        }

        var list = events[name];
        if (list) {
            if (callback) {
                for (var i = list.length - 1; i >= 0; i--) {
                    if (list[i] === callback) {
                        list.splice(i, 1)
                    }
                }
            }
            else {
                delete events[name]
            }
        }

        return seajs
    };

// Emit event, firing all bound callbacks. Callbacks receive the same
// arguments as `emit` does, apart from the event name
    var emit = seajs.emit = function(name, data) {
        var list = events[name], fn;

        if (list) {
            // Copy callback lists to prevent modification
            list = list.slice();

            // Execute event callbacks
            while ((fn = list.shift())) {
                fn(data)
            }
        }

        return seajs
    };


    /**
     * util-path.js - The utilities for operating path such as id, uri
     */

    var DIRNAME_RE = /[^?#]*\//;

    var DOT_RE = /\/\.\//g;
    var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//;
    var DOUBLE_SLASH_RE = /([^:/])\/\//g;

    function dirname(path) {
        return path.match(DIRNAME_RE)[0]
    }

// Canonicalize a path
// realpath("http://test.com/a//./b/../c") ==> "http://test.com/a/c"
    function realpath(path) {
        // /a/b/./c/./d ==> /a/b/c/d
        path = path.replace(DOT_RE, "/");

        // a/b/c/../../d  ==>  a/b/../d  ==>  a/d
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, "/")
        }

        // a//b/c  ==>  a/b/c
        path = path.replace(DOUBLE_SLASH_RE, "$1/");

        return path
    }

// Normalize an id
// normalize("path/to/a") ==> "path/to/a.js"
// NOTICE: substring is faster than negative slice and RegExp
    function normalize(path) {
        var last = path.length - 1;
        var lastC = path.charAt(last);

        // If the uri ends with `#`, just return it without '#'
        if (lastC === "#") {
            return path.substring(0, last)
        }

        return (path.substring(last - 2) === ".js" ||
            path.indexOf("?") > 0 ||
            path.substring(last - 3) === ".css" ||
            lastC === "/") ? path : path + ".js"
    }


    var PATHS_RE = /^([^/:]+)(\/.+)$/;
    var VARS_RE = /{([^{]+)}/g;

    function parseAlias(id) {
        var alias = data.alias;
        return alias && isString(alias[id]) ? alias[id] : id
    }

    function parsePaths(id) {
        var paths = data.paths;
        var m;

        if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
            id = paths[m[1]] + m[2]
        }

        return id;
    }

    function parseVars(id) {
        var vars = data.vars;

        if (vars && id.indexOf("{") > -1) {
            id = id.replace(VARS_RE, function(m, key) {
                return isString(vars[key]) ? vars[key] : m
            })
        }

        return id
    }

    function parseMap(uri) {
        var map = data.map;
        var ret = uri;

        if (map) {
            for (var i = 0, len = map.length; i < len; i++) {
                var rule = map[i];

                ret = isFunction(rule) ? (rule(uri) || uri) :  uri.replace(rule[0], rule[1]);
                // Only apply the first matched rule
                if (ret !== uri) break
            }
        }

        return ret
    }


    var ABSOLUTE_RE = /^\/\/.|:\//;
    var ROOT_DIR_RE = /^.*?\/\/.*?\//;

    function addBase(id, refUri) {
        var ret;
        var first = id.charAt(0);

        // Absolute
        if (ABSOLUTE_RE.test(id)) {
            ret = id
        }
        // Relative
        else if (first === ".") {
            ret = realpath((refUri ? dirname(refUri) : data.cwd) + id)
        }
        // Root
        else if (first === "/") {
            var m = data.cwd.match(ROOT_DIR_RE);
            ret = m ? m[0] + id.substring(1) : id
        }
        // Top-level
        else {
            ret = data.base + id
        }

        // Add default protocol when uri begins with "//"
        if (ret.indexOf("//") === 0) {
            ret = location.protocol + ret
        }

        return ret;
    }

    function id2Uri(id, refUri) {
        if (!id) return "";

        id = parseAlias(id);
        id = parsePaths(id);
        id = parseVars(id);
        id = normalize(id);

        var uri = addBase(id, refUri);
        uri = parseMap(uri);

        return uri
    }


    var doc = document;
    var cwd = dirname(doc.URL);
    var scripts = doc.scripts;

// Recommend to add `seajsnode` id for the `sea.js` script element
    var loaderScript = doc.getElementById("seajsnode") ||
        scripts[scripts.length - 1];

// When `sea.js` is inline, set loaderDir to current working directory
    var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd);

    function getScriptAbsoluteSrc(node) {
        return node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute("src", 4)
    }


// For Developers
    seajs.resolve = id2Uri;


    /**
     * util-request.js - The utilities for requesting script and style files
     * ref: tests/research/load-js-css/test.html
     */

    var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
    var baseElement = head.getElementsByTagName("base")[0];

    var IS_CSS_RE = /\.css(?:\?|$)/i;
    var currentlyAddingScript;
    var interactiveScript;

// `onload` event is not supported in WebKit < 535.23 and Firefox < 9.0
// ref:
//  - https://bugs.webkit.org/show_activity.cgi?id=38995
//  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
//  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
    var isOldWebKit = +navigator.userAgent
        .replace(/.*(?:AppleWebKit|AndroidWebKit)\/(\d+).*/, "$1") < 536;


    function request(url, callback, charset, crossorigin) {
        var isCSS = IS_CSS_RE.test(url);
        var node = doc.createElement(isCSS ? "link" : "script");

        if (charset) {
            node.charset = charset
        }

        // crossorigin default value is `false`.
        if (!isUndefined(crossorigin)) {
            node.setAttribute("crossorigin", crossorigin)
        }


        addOnload(node, callback, isCSS, url);

        if (isCSS) {
            node.rel = "stylesheet";
            node.href = url;
        }
        else {
            node.async = true;
            node.src = url;
        }
        //currentlyAddingScript = node;
        // ref: #185 & http://dev.jquery.com/ticket/2709
        baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node);
        currentlyAddingScript = null;
    }

    function addOnload(node, callback, isCSS, url) {
        var supportOnload = "onload" in node;

        // for Old WebKit and Old Firefox
        if (isCSS && (isOldWebKit || !supportOnload)) {
            setTimeout(function() {
                pollCss(node, callback)
            }, 1) ;// Begin after node insertion
            return
        }

        if (supportOnload) {
            node.onload = onload;
            node.onerror = function() {
                emit("error", { uri: url, node: node });
                onload()
            }
        }
        else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    onload()
                }
            }
        }

        function onload() {
            // Ensure only run once and handle memory leak in IE
            node.onload = node.onerror = node.onreadystatechange = null;

            // Remove the script to reduce memory leak
            if (!isCSS && !data.debug) {
                head.removeChild(node)
            }

            // Dereference the node
            node = null;

            callback()
        }
    }

    function pollCss(node, callback) {
        var  sheet = node && node.sheet;
        var isLoaded;

        // for WebKit < 536
        if (isOldWebKit) {
            if (sheet) {
                isLoaded = true
            }
        }
        // for Firefox < 9.0
        else if (sheet) {
            try {
                if (sheet.cssRules) {
                    isLoaded = true
                }
            } catch (ex) {
                // The value of `ex.name` is changed from "NS_ERROR_DOM_SECURITY_ERR"
                // to "SecurityError" since Firefox 13.0. But Firefox is less than 9.0
                // in here, So it is ok to just rely on "NS_ERROR_DOM_SECURITY_ERR"
                if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
                    isLoaded = true;
                }
            }
        }

        setTimeout(function() {
            if (isLoaded) {
                // Place callback here to give time for style rendering
                callback()
            }
            else {
                pollCss(node, callback)
            }
        }, 20)
    }

    function getCurrentScript() {
        if (currentlyAddingScript) {
            return currentlyAddingScript
        }

        // For IE6-9 browsers, the script onload event may not fire right
        // after the script is evaluated. Kris Zyp found that it
        // could query the script nodes and the one that is in "interactive"
        // mode indicates the current script
        // ref: http://goo.gl/JHfFW
        if (interactiveScript && interactiveScript.readyState === "interactive") {
            return interactiveScript
        }

        var scripts = head.getElementsByTagName("script");

        for (var i = scripts.length - 1; i >= 0; i--) {
            var script = scripts[i];
            if (script.readyState === "interactive") {
                interactiveScript = script;
                return interactiveScript;
            }
        }
    }


// For Developers
    seajs.request = request;

    /**
     * util-deps.js - The parser for dependencies
     * ref: tests/research/parse-dependencies/test.html
     */

    var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g;
    var SLASH_RE = /\\\\/g;

    function parseDependencies(code) {
        var ret = [];

        code.replace(SLASH_RE, "")
            .replace(REQUIRE_RE, function(m, m1, m2) {
                if (m2) {
                    ret.push(m2)
                }
            });

        return ret
    }


    /**
     * module.js - The core of module loader
     */

    var cachedMods = seajs.cache = {};
    var anonymousMeta;

    var fetchingList = {};
    var fetchedList = {};
    var callbackList = {};

    var STATUS = Module.STATUS = {
        // 1 - The `module.uri` is being fetched
        FETCHING: 1,
        // 2 - The meta data has been saved to cachedMods
        SAVED: 2,
        // 3 - The `module.dependencies` are being loaded
        LOADING: 3,
        // 4 - The module are ready to execute
        LOADED: 4,
        // 5 - The module is being executed
        EXECUTING: 5,
        // 6 - The `module.exports` is available
        EXECUTED: 6
    };


    function Module(uri, deps) {
        this.uri = uri;
        this.dependencies = deps || [];
        this.exports = null;
        this.status = 0;

        // Who depends on me
        this._waitings = {};

        // The number of unloaded dependencies
        this._remain = 0;
    }

// Resolve module.dependencies
    Module.prototype.resolve = function() {
        var mod = this;
        var ids = mod.dependencies;
        var uris = [];

        for (var i = 0, len = ids.length; i < len; i++) {
            uris[i] = Module.resolve(ids[i], mod.uri)
        }
        return uris
    };

// Load module.dependencies and fire onload when all done
    Module.prototype.load = function() {
        var mod = this;

        // If the module is being loaded, just wait it onload call
        if (mod.status >= STATUS.LOADING) {
            return
        }

        mod.status = STATUS.LOADING;

        // Emit `load` event for plugins such as combo plugin
        var uris = mod.resolve();
        emit("load", uris);

        var len = mod._remain = uris.length;
        var m;

        // Initialize modules and register waitings
        for (var i = 0; i < len; i++) {
            m = Module.get(uris[i]);

            if (m.status < STATUS.LOADED) {
                // Maybe duplicate: When module has dupliate dependency, it should be it's count, not 1
                m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1
            }
            else {
                mod._remain--
            }
        }

        if (mod._remain === 0) {
            mod.onload();
            return;
        }

        // Begin parallel loading
        var requestCache = {};

        for (i = 0; i < len; i++) {
            m = cachedMods[uris[i]];

            if (m.status < STATUS.FETCHING) {
                m.fetch(requestCache)
            }
            else if (m.status === STATUS.SAVED) {
                m.load()
            }
        }

        // Send all requests at last to avoid cache bug in IE6-9. Issues#808
        for (var requestUri in requestCache) {
            if (requestCache.hasOwnProperty(requestUri)) {
                requestCache[requestUri]()
            }
        }
    };

// Call this method when module is loaded
    Module.prototype.onload = function() {
        var mod = this;
        mod.status = STATUS.LOADED;

        if (mod.callback) {
            mod.callback()
        }

        // Notify waiting modules to fire onload
        var waitings = mod._waitings;
        var uri, m;

        for (uri in waitings) {
            if (waitings.hasOwnProperty(uri)) {
                m = cachedMods[uri];
                m._remain -= waitings[uri];
                if (m._remain === 0) {
                    m.onload();
                }
            }
        }

        // Reduce memory taken
        delete mod._waitings;
        delete mod._remain;
    };

// Fetch a module
    Module.prototype.fetch = function(requestCache) {
        var mod = this;
        var uri = mod.uri;

        mod.status = STATUS.FETCHING;

        // Emit `fetch` event for plugins such as combo plugin
        var emitData = { uri: uri };
        emit("fetch", emitData);
        var requestUri = emitData.requestUri || uri;

        // Empty uri or a non-CMD module
        if (!requestUri || fetchedList[requestUri]) {
            mod.load();
            return;
        }

        if (fetchingList[requestUri]) {
            callbackList[requestUri].push(mod);
            return;
        }

        fetchingList[requestUri] = true;
        callbackList[requestUri] = [mod];

        // Emit `request` event for plugins such as text plugin
        emit("request", emitData = {
            uri: uri,
            requestUri: requestUri,
            onRequest: onRequest,
            charset: isFunction(data.charset) ? data.charset(requestUri): data.charset,
            crossorigin: isFunction(data.crossorigin) ? data.crossorigin(requestUri) : data.crossorigin
        });

        if (!emitData.requested) {
            requestCache ?
                requestCache[emitData.requestUri] = sendRequest :
                sendRequest();
        }

        function sendRequest() {
            seajs.request(emitData.requestUri, emitData.onRequest, emitData.charset, emitData.crossorigin);
        }

        function onRequest() {
            delete fetchingList[requestUri];
            fetchedList[requestUri] = true;

            // Save meta data of anonymous module
            if (anonymousMeta) {
                Module.save(uri, anonymousMeta);
                anonymousMeta = null
            }

            // Call callbacks
            var m, mods = callbackList[requestUri];
            delete callbackList[requestUri];
            while ((m = mods.shift())) m.load()
        }
    };

// Execute a module
    Module.prototype.exec = function () {
        var mod = this;

        // When module is executed, DO NOT execute it again. When module
        // is being executed, just return `module.exports` too, for avoiding
        // circularly calling
        if (mod.status >= STATUS.EXECUTING) {
            return mod.exports
        }

        mod.status = STATUS.EXECUTING;

        // Create require
        var uri = mod.uri;

        function require(id) {
            return Module.get(require.resolve(id)).exec()
        }

        require.resolve = function(id) {
            return Module.resolve(id, uri)
        };

        require.async = function(ids, callback) {
            Module.use(ids, callback, uri + "_async_" + cid());
            return require
        };

        // Exec factory
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
        mod.status = STATUS.EXECUTED;

        // Emit `exec` event
        emit("exec", mod);

        return exports
    };

// Resolve id to uri
    Module.resolve = function(id, refUri) {
        // Emit `resolve` event for plugins such as text plugin
        var emitData = { id: id, refUri: refUri };
        emit("resolve", emitData);

        return emitData.uri || seajs.resolve(emitData.id, refUri)
    };

// Define a module
    Module.define = function (id, deps, factory) {
        var argsLen = arguments.length;

        // define(factory)
        if (argsLen === 1) {
            factory = id;
            id = undefined
        }
        else if (argsLen === 2) {
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

        // Parse dependencies according to the module factory code
        if (!isArray(deps) && isFunction(factory)) {
            deps = parseDependencies(factory.toString())
        }

        var meta = {
            id: id,
            uri: Module.resolve(id),
            deps: deps,
            factory: factory
        };

        // Try to derive uri in IE6-9 for anonymous modules
        if (!meta.uri && doc.attachEvent) {
            var script = getCurrentScript();

            if (script) {
                meta.uri = script.src
            }

            // NOTE: If the id-deriving methods above is failed, then falls back
            // to use onload event to get the uri
        }

        // Emit `define` event, used in nocache plugin, seajs node version etc
        emit("define", meta);

        meta.uri ? Module.save(meta.uri, meta) :
            // Save information for "saving" work in the script onload event
            anonymousMeta = meta
    };

// Save meta data to cachedMods
    Module.save = function(uri, meta) {
        var mod = Module.get(uri);

        // Do NOT override already saved modules
        if (mod.status < STATUS.SAVED) {
            mod.id = meta.id || uri;
            mod.dependencies = meta.deps || [];
            mod.factory = meta.factory;
            mod.status = STATUS.SAVED
        }
    };

// Get an existed module or create a new one
    Module.get = function(uri, deps) {
        return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
    };

// Use function is equal to load a anonymous module
    Module.use = function (ids, callback, uri) {
        var mod = Module.get(uri, isArray(ids) ? ids : [ids]);

        mod.callback = function() {
            var exports = [];
            var uris = mod.resolve();

            for (var i = 0, len = uris.length; i < len; i++) {
                exports[i] = cachedMods[uris[i]].exec()
            }

            if (callback) {
                callback.apply(global, exports)
            }

            delete mod.callback
        };

        mod.load()
    };

// Load preload modules before all other modules
    Module.preload = function(callback) {
        var preloadMods = data.preload;
        var len = preloadMods.length;

        if (len) {
            Module.use(preloadMods, function() {
                // Remove the loaded preload modules
                preloadMods.splice(0, len);

                // Allow preload modules to add new preload modules
                Module.preload(callback)
            }, data.cwd + "_preload_" + cid());
        }
        else {
            callback();
        }
    };

// Public API

    seajs.use = function(ids, callback) {
        Module.preload(function() {
            Module.use(ids, callback, data.cwd + "_use_" + cid());
        });
        return seajs;
    };


    Module.define.cmd = {};
    global.define = Module.define;


// For Developers

    seajs.Module = Module;
    data.fetchedList = fetchedList;
    data.cid = cid;

    seajs.require = function(id) {
        var mod = Module.get(Module.resolve(id));
        if (mod.status < STATUS.EXECUTING) {
            mod.onload();
            mod.exec()
        }
        return mod.exports
    };
    global.require = seajs.require;

    /**
     * config.js - The configuration for the loader
     */

    var BASE_RE = /^(.+?\/)(\?\?)?(seajs\/)+/;

// The root path to use for id2uri parsing
// If loaderUri is `http://test.com/libs/seajs/[??][seajs/1.2.3/]sea.js`, the
// baseUri should be `http://test.com/libs/`
    data.base = (loaderDir.match(BASE_RE) || ["", loaderDir])[1];

// The loader directory
    data.dir = loaderDir;

// The current working directory
    data.cwd = cwd;

// The charset for requesting files
    data.charset = "utf-8";

// The CORS options, Do't set CORS on default.
//data.crossorigin = undefined

// Modules that are needed to load before all other modules
    data.preload = (function() {
        var plugins = [];

        // Convert `seajs-xxx` to `seajs-xxx=1`
        // NOTE: use `seajs-xxx=1` flag in uri or cookie to preload `seajs-xxx`
        var str = location.search.replace(/(seajs-\w+)(&|$)/g, "$1=1$2");

        // Add cookie string
        str += " " + doc.cookie;

        // Exclude seajs-xxx=0
        str.replace(/(seajs-\w+)=1/g, function(m, name) {
            plugins.push(name)
        });

        return plugins
    })();

// data.alias - An object containing shorthands of module id
// data.paths - An object containing path shorthands in module id
// data.vars - The {xxx} variables in module id
// data.map - An array containing rules to map module uri
// data.debug - Debug mode. The default value is false

    seajs.config = function(configData) {

        for (var key in configData) {
            var curr = configData[key];
            var prev = data[key];

            // Merge object config such as alias, vars
            if (prev && isObject(prev)) {
                for (var k in curr) {
                    prev[k] = curr[k];
                }
            }
            else {
                // Concat array config such as map, preload
                if (isArray(prev)) {
                    curr = prev.concat(curr);
                }
                // Make sure that `data.base` is an absolute path
                else if (key === "base") {
                    // Make sure end with "/"
                    if (curr.slice(-1) !== "/") {
                        curr += "/";
                    }
                    curr = addBase(curr);
                }

                // Set config
                data[key] = curr;
            }
        }

        emit("config", configData);
        return seajs;
    };

    //import Style
    var RE_NON_WORD = /\W/g;
    var styleNode;
    seajs.importStyle = function (cssText, id) {
        if (id) {
            // Convert id to valid string
            id = id.replace(RE_NON_WORD, '-');

            // Don't add multiple times
            if (doc.getElementById(id)) return
        }
        var element;
        // Don't share styleNode when id is spectied
        if (!styleNode || id) {
            element = doc.createElement('style');
            id && (element.id = id);
            // Adds to DOM first to avoid the css hack invalid
            head.appendChild(element)
        } else {
            element = styleNode
        }
        // IE
        if (element.styleSheet !== undefined) {

            // http://support.microsoft.com/kb/262161
            if (doc.getElementsByTagName('style').length > 31) {
                throw new Error('Exceed the maximal count of style tags in IE')
            }

            element.styleSheet.cssText += cssText
        }
        // W3C
        else {
            element.appendChild(doc.createTextNode(cssText))
        }

        if (!id) {
            styleNode = element
        }
    };



    //exports
    svp.define = Module.define ;//兼容旧版
    svp.seajs = seajs; //兼容旧版
    seajs.cssLoader = seajs.loadCss    = seajs.request;//兼容旧版
    seajs.jsLoader  = seajs.loadScript = seajs.request;//兼容旧版

})(window);

/**
 * The Sea.js 1.0.1 plugin for concatenating HTTP requests
 */
(function (global) {
    var Module   = seajs.Module;
    var FETCHING = Module.STATUS.FETCHING;
    var data     = seajs.data;
    var isCombo  = false;
    if(/h5\.itc\.cn/i.test(window.location.href)){
        isCombo = true;
    }
    isCombo  = data && data.isCombo || svp && svp.isCombo || isCombo;

    if (isCombo) {
        var comboHash = data.comboHash = {};
        var comboSyntax = ["??", ","];
        var comboMaxLength = 2000;
        var comboExcludes;
        seajs.on("load", setComboHash);
        seajs.on("fetch", setRequestUri);

        function setComboHash(uris) {
            var len = uris.length;
            if (len < 2) {
                return;
            }

            data.comboSyntax && (comboSyntax = data.comboSyntax);
            data.comboMaxLength && (comboMaxLength = data.comboMaxLength);

            comboExcludes = data.comboExcludes;
            var needComboUris = [];
            for (var i = 0; i < len; i++) {
                var uri = uris[i];
                if (comboHash[uri]) {
                    continue
                }
                var mod = Module.get(uri);

                // Remove fetching and fetched uris, excluded uris, combo uris
                if (mod.status < FETCHING && !isExcluded(uri) && !isComboUri(uri)) {
                    needComboUris.push(uri)
                }
            }

            if (needComboUris.length > 1) {
                paths2hash(uris2paths(needComboUris))
            }
        }

        function setRequestUri(data) {
            data.requestUri = comboHash[data.uri] || data.uri
        }

// Helpers

        function uris2paths(uris) {
            return meta2paths(uris2meta(uris))
        }

// [
//   "http://example.com/p/a.js",
//   "https://example2.com/b.js",
//   "http://example.com/p/c/d.js",
//   "http://example.com/p/c/e.js"
// ]
// ==>
// {
//   "http__example.com": {
//                          "p": {
//                                 "a.js": { __KEYS: [] },
//                                 "c": {
//                                        "d.js": { __KEYS: [] },
//                                        "e.js": { __KEYS: [] },
//                                        __KEYS: ["d.js", "e.js"]
//                                 },
//                                 __KEYS: ["a.js", "c"]
//                               },
//                          __KEYS: ["p"]
//                        },
//   "https__example2.com": {
//                            "b.js": { __KEYS: [] },
//                            _KEYS: ["b.js"]
//                          },
//   __KEYS: ["http__example.com", "https__example2.com"]
// }

        function uris2meta(uris) {
            var meta = {
                __KEYS: []
            };

            for (var i = 0, len = uris.length; i < len; i++) {
                var parts = uris[i].replace("://", "__").split("/");
                var m = meta;

                for (var j = 0, l = parts.length; j < l; j++) {
                    var part = parts[j];

                    if (!m[part]) {
                        m[part] = {
                            __KEYS: []
                        };
                        m.__KEYS.push(part)
                    }
                    m = m[part]
                }
            }

            return meta;
        }

// {
//   "http__example.com": {
//                          "p": {
//                                 "a.js": { __KEYS: [] },
//                                 "c": {
//                                        "d.js": { __KEYS: [] },
//                                        "e.js": { __KEYS: [] },
//                                        __KEYS: ["d.js", "e.js"]
//                                 },
//                                 __KEYS: ["a.js", "c"]
//                               },
//                          __KEYS: ["p"]
//                        },
//   "https__example2.com": {
//                            "b.js": { __KEYS: [] },
//                            _KEYS: ["b.js"]
//                          },
//   __KEYS: ["http__example.com", "https__example2.com"]
// }
// ==>
// [
//   ["http://example.com/p", ["a.js", "c/d.js", "c/e.js"]]
// ]

        function meta2paths(meta) {
            var paths = [];
            var __KEYS = meta.__KEYS;

            for (var i = 0, len = __KEYS.length; i < len; i++) {
                var part = __KEYS[i];
                var root = part;
                var m = meta[part];
                var KEYS = m.__KEYS;

                while (KEYS.length === 1) {
                    root += "/" + KEYS[0];
                    m = m[KEYS[0]];
                    KEYS = m.__KEYS;
                }

                if (KEYS.length) {
                    paths.push([root.replace("__", "://"), meta2arr(m)]);
                }
            }

            return paths;
        }

// {
//   "a.js": { __KEYS: [] },
//   "c": {
//          "d.js": { __KEYS: [] },
//          "e.js": { __KEYS: [] },
//          __KEYS: ["d.js", "e.js"]
//        },
//   __KEYS: ["a.js", "c"]
// }
// ==>
// [
//   "a.js", "c/d.js", "c/e.js"
// ]

        function meta2arr(meta) {
            var arr = [];
            var __KEYS = meta.__KEYS;

            for (var i = 0, len = __KEYS.length; i < len; i++) {
                var key = __KEYS[i];
                var r = meta2arr(meta[key]);

                // key = "c"
                // r = ["d.js", "e.js"]
                var m = r.length;
                if (m) {
                    for (var j = 0; j < m; j++) {
                        arr.push(key + "/" + r[j])
                    }
                } else {
                    arr.push(key)
                }
            }

            return arr
        }

// [
//   [ "http://example.com/p", ["a.js", "c/d.js", "c/e.js", "a.css", "b.css"] ]
// ]
// ==>
//
// a hash cache
//
// "http://example.com/p/a.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/c/d.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/c/e.js"  ==> "http://example.com/p/??a.js,c/d.js,c/e.js"
// "http://example.com/p/a.css"  ==> "http://example.com/p/??a.css,b.css"
// "http://example.com/p/b.css"  ==> "http://example.com/p/??a.css,b.css"
//

        function paths2hash(paths) {
            for (var i = 0, len = paths.length; i < len; i++) {
                var path = paths[i];
                var root = path[0] + "/";
                var group = files2group(path[1]);

                for (var j = 0, m = group.length; j < m; j++) {
                    setHash(root, group[j])
                }
            }

            return comboHash
        }

        function setHash(root, files) {
            var comboPath = root + comboSyntax[0] + files.join(comboSyntax[1]);
            var exceedMax = comboPath.length > comboMaxLength;

            // http://stackoverflow.com/questions/417142/what-is-the-maximum-length-of-a-url
            if (files.length > 1 && exceedMax) {
                var parts = splitFiles(files,
                        comboMaxLength - (root + comboSyntax[0]).length);

                setHash(root, parts[0]);
                setHash(root, parts[1]);
            } else {
                if (exceedMax) {
                    throw new Error("The combo url is too long: " + comboPath)
                }

                for (var i = 0, len = files.length; i < len; i++) {
                    comboHash[root + files[i]] = comboPath
                }
            }
        }

        function splitFiles(files, filesMaxLength) {
            var sep = comboSyntax[1];
            var s = files[0];

            for (var i = 1, len = files.length; i < len; i++) {
                s += sep + files[i];
                if (s.length > filesMaxLength) {
                    return [files.splice(0, i), files]
                }
            }
        }

//
//  ["a.js", "c/d.js", "c/e.js", "a.css", "b.css", "z"]
// ==>
//  [ ["a.js", "c/d.js", "c/e.js"], ["a.css", "b.css"] ]
//

        function files2group(files) {
            var group = [];
            var hash = {};

            for (var i = 0, len = files.length; i < len; i++) {
                var file = files[i];
                var ext = getExt(file);
                if (ext) {
                    (hash[ext] || (hash[ext] = [])).push(file)
                }
            }

            for (var k in hash) {
                if (hash.hasOwnProperty(k)) {
                    group.push(hash[k])
                }
            }

            return group
        }

        function getExt(file) {
            var p = file.lastIndexOf(".");
            return p >= 0 ? file.substring(p) : ""
        }

        function isExcluded(uri) {
            if (comboExcludes) {
                return comboExcludes.test ?
                    comboExcludes.test(uri) :
                    comboExcludes(uri)
            }
        }

        function isComboUri(uri) {
            var comboSyntax = data.comboSyntax || ["??", ","];
            var s1 = comboSyntax[0];
            var s2 = comboSyntax[1];

            return s1 && uri.indexOf(s1) > 0 || s2 && uri.indexOf(s2) > 0
        }


        // For test
        if (data.test) {
            var test = seajs.test || (seajs.test = {});
            test.uris2paths = uris2paths;
            test.paths2hash = paths2hash;
        }
    }

})(window);