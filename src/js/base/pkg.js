(function (svp) {
   /*
     pkg.config(moduleName,{
            base: 'http://tv.sohu.com/upload/clientapp/vstar/js',
            alias: {
            'starList': 'http://tv.sohu.com/upload/clientapp/vstar/js/starList.min.20151120.js'
            },
            preload: [
               'http://tv.sohu.com/upload/lib/coreLib.min.20151120.js?v=1.0.1'
            ],
     })

    */
    var pkg = function(){
        this.Config={
            fns:{}
        };
    };

    pkg.config= function (configName, configValue) {
        var self = this;
        var cfg, r, fn;
        var Config = this.Config;
        var configFns = Config.fns;

        if (typeof configName === 'string') {
            cfg = configFns[configName];
            if (configValue === undefined) {
                if (cfg) {
                    r = cfg.call(self);
                } else {
                    r = Config[configName];
                }
            } else {
                if (cfg) {
                    r = cfg.call(self, configValue);
                } else {
                    Config[configName] = configValue;
                }
            }
        } else {
            for (var p in configName) {
                configValue = configName[p];
                fn = configFns[p];
                if (fn) {
                    fn.call(self, configValue);
                } else {
                    Config[p] = configValue;
                }
            }
        }
        return r;
    };
    /**
     *
     * @param configName
     * @param configValue

     */
    pkg.initConfig = function(pkgName, alias, preload ){
        if(pkgName && alias) {
            this.Config[pkgName]={
                alias:alias,
                preload:preload
            };
        }
        return this.Config;
    };

    window.pkg = pkg;
    define('base/pkg', function (require, exports, module) {
        module.exports = svp.pkg;
    });
}(window));