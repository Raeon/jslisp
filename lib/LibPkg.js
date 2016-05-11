'use strict';

var LispValue = require('../data/LispValue.js');

var LibPkg = function(env) {

    var pkg = env.createPackage('pkg');
    if (!pkg) {
        return false;
    }

    // CREATE
    pkg.addBuiltin('create', true,
        function(scope, name, depends) {
            var pkg = scope.getEnv().createPackage(name);
            for (var i = 0, l = depends.length(); i < l; i++) {

                // Get the package we depend on
                var using = scope.getEnv().getPackage(depends.get(i));

                // Error out if it doesn't exist
                if (!using) {
                    var err = LispValue.forType(
                        LispValue.ERROR,
                        'MAKE-PACKAGE dependency %0 does not exist'.fmt(
                            depends.get(i)
                        )
                    );
                    err.addTrace(this.toString() + ' DEPENDENCY verification');
                    return err;
                }

                // Add package
                pkg.addUsing(using);
            }
            return pkg ? 1 : 0;
        }, [{ type: LispValue.SYMBOL, native: true },
            { type: LispValue.SYMBOL, native: true, remainder: true }]);

    // ENTER
    pkg.addBuiltin('enter', true,
        function(scope, name) {
            var env = scope.getEnv();
            var pkg = env.getPackage(name);
            if (!pkg) { return 0; }
            env.setActivePackage(pkg);
            return 1;
        }, [{ type: LispValue.SYMBOL, native: true }]);

    // EXPORT
    pkg.addBuiltin('export', false,
        function(scope, name, value) {
            // We want a symbol so
            var pkg = env.getActivePackage();
            if (!pkg) { return 0; }
            return pkg.setExport(name, value);
        }, [{ type: LispValue.SYMBOL, native: true },
            { type: LispValue.ANYTHING }]);

};

module.exports = LibPkg;
