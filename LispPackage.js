'use strict';

var LispScope = require('./LispScope.js');
var LispValue = require('./data/LispValue.js');
var Mapper = require('./util/Mapper.js');
var List = require('./util/List.js');
var Util = require('./util/Util.js');

var LispPackage = function(env, name) {
    name = name.toUpperCase();

    var using = new List(); // package[]
    var exprts = new Mapper(); // name -> value

    var scope = new LispScope(env, null);
    var mutable = true;

    // Creation
    this.addBuiltin = function(name, macro, func, argopts) {
        name = name.toUpperCase();
        if (this.exists(name)) {
            console.log(this, 'already exists:', name, this.get(name));
            return false;
        }

        // Initialize arguments
        var min = 0, max = 0, hasOpt = false, remainderOpt = undefined;

        // Defaults
        var defopt = {
            type: -1,
            native: false,
            optional: false,
            remainder: false
        };

        // Iterate over all specified args to get min/max values
        for (var i = 0, l = argopts.length; i < l; i++) {
            // Fill arguments if they aren't provided
            var argopt = Util.fillDefaults(argopts[i], defopt);

            hasOpt = hasOpt || argopt.optional;

            // Error if we have optional args but this one isn't one
            if (hasOpt && !argopt.optional) {
                throw new Error(
                    'Required argument specified after optional arguments'
                );
            }

            if (!argopt.remainder) {

                // If this arg is optional, do not increase min/max
                min += argopt.optional ? 0 : 1;
                if (max !== -1) {
                    max += argopt.optional ? 0 : 1;
                }

            } else {
                // If we already have a remainder, throw error
                if (max === -1) {
                    throw new Error(
                        'Multiple arguments have the remainder modifier'
                    );
                }

                // Set remainder type
                remainderOpt = argopt;

                // Set max to -1 so we know we have a remainder
                max = -1;
            }
        }

        // Define result beforehand so we can bind it to fnc
        var result = LispValue.forType(
            macro ? LispValue.MACRO : LispValue.FUNCTION,
            null
        );

        // Function to handle all argument parsing
        var fnc = function(scope, args) {
            var argc = args.length();

            // Check if we have at least minimum arguments
            if (argc < min) {
                var err  = LispValue.forType(
                    LispValue.ERROR,
                    'Got %0 arguments, expected at least %1'.fmt(argc, min)
                );
                err.addTrace(
                    this.toString() + 'argument validation: MINARGS'
                );
                return err;
            }

            // Check if we have at most maximum arguments
            if (argc > max && max != -1) {
                err = LispValue.forType(
                    LispValue.ERROR,
                    'Got %0 arguments, expected at most %1'.fmt(argc, max)
                );
                err.addTrace(
                    this.toString() + ' argument validation: MAXARGS'
                );
                return err;
            }

            // Return errors if any
            for (var i = 0, l = args.length(); i < l; i++) {
                var arg = args.get(i);
                if (arg.getType() === LispValue.ERROR) {
                    arg.addTrace(
                        this.toString() +
                        ' argument validation: ERRORS'
                    );
                    return arg;
                }
            }

            // Verify argument types
            var resultArgs = new List();
            var remainders = new List();

            l = Math.max(args.length(), argopts.length());
            for (i = 0; i < l; i++) {
                arg = args.get(i);
                var argopt = argopts[i];

                // If argument is required but not provided
                if (!arg && argopt && !argopt.optional && !argopt.remainder) {
                    err = LispValue.forType(
                        LispValue.ERROR,
                        'Argument %0 is not provided'.fmt(i)
                    );
                    err.addTrace(
                        this.toString() + ' argument validation: PRESENCE'
                    );
                    return err;
                }

                // If both exist, verify type
                if (arg && argopt) {
                    if (arg.getType() !== argopt.type && argopt.type !== -1) {
                        err = LispValue.forType(
                            LispValue.ERROR,
                            'Argument %0 is of type %1 but expected %2'.fmt(
                                i,
                                LispValue.getName(arg.getType()),
                                LispValue.getName(argopt.type)
                            )
                        );
                        err.addTrace(
                            this.toString() + ' argument validation: TYPE'
                        );
                        return err;
                    }
                }

                // If it is an unprovided optional/remainder argument
                if (!arg && (argopt.optional || argopt.remainder)) {
                    continue;
                }

                // If it is an remainder argument
                if (arg && (!argopt || argopt.remainder) && max === -1) {
                    if (arg.getType() !== remainderOpt.type &&
                            remainderOpt.type !== -1) {
                        err = LispValue.forType(
                            LispValue.ERROR,
                            'Argument %0 is of type %1 but expected %2'.fmt(
                                i,
                                LispValue.getName(arg.getType()),
                                LispValue.getName(remainderOpt.type)
                            )
                        );
                        err.addTrace(
                            this.toString() +
                            ' argument validation: REMAINDERTYPE'
                        );
                        return err;
                    }
                    remainders.add(remainderOpt.native ? arg.getValue() : arg);
                    continue;
                }

                // Get the primitive type
                resultArgs.set(i, argopt.native ? arg.getValue() : arg);
            }

            // Append remainder if any
            if (max === -1) {
                resultArgs.append(remainders);
            }

            // Prepend the scope
            resultArgs.prepend(scope);

            // Invoke the function and return the result
            var result = func.apply(this, resultArgs.export());
            if (!(result instanceof LispValue)) {
                result = LispValue.fromPrimitive(result);
            }
            return result;
        }.bind(result);

        // Update function
        result.setValue(fnc);
        result.setBuiltin(true);
        var nam = LispValue.forType(LispValue.SYMBOL, name);
        nam.setPackage(this.getName());
        result.setName(nam);

        // Register it as export, obviously
        return this.setExport(name, result);
    };

    // Normals
    this.get = function(name) {
        // Return from our own exports
        var result = this.getExport(name);
        if (result) { return result; }

        // Return from parents
        for (var i = 0, l = using.length(); i < l; i++) {
            var parent = using.get(i);
            result = parent.getExport(name);
            if (result) { return result; }
        }

        // Symbol checks if it is prepended with a package name,
        // so we don't need to account for that.

        // Return result
        return LispValue.forType(
            LispValue.ERROR,
            'Variable %0 does not exist in package %1'.fmt(
                name,
                this.getName()
            )
        );
    };

    this.exists = function(name) {
        return this.hasExport(name) ||
            using.some(function(parent) {
                parent.hasExport(name);
            });
    };

    // Usings
    this.addUsing = function(pkg) {
        // We need to check if ALL of the symbols defined by 'pkg'
        // don't already exist to prevent conflicts!
        var expts = pkg.getExports();
        var duplicate = expts.some(function(key) {
            if (this.exists(key)) {
                console.log('Duplicate:', key);
                return true;
            }
            return false;
        }.bind(this));

        // Return false if we found a duplicate
        if (duplicate) {
            console.log('Duplicate!');
            return false;
        }

        // Success! Add to using list
        console.log(this, 'added using package:', pkg);
        using.append(pkg);
        return true;
    };
    this.removeUsing = function(pkg) {
        return using.removeValue(pkg);
    };
    this.hasUsing = function(pkg) {
        return using.contains(pkg);
    };

    // Exports
    this.setExport = function(name, value) {
        if (!mutable) { return false; }
        return exprts.set(name, value);
    };
    this.getExport = function(name) { return exprts.get(name); };
    this.existsExport = function(name) { return exprts.contains(name); };
    this.hasExport = this.existsExport;
    this.getExports = function() { return exprts; };

    this.setName = function(nam) { name = nam.toUpperCase(); };
    this.getName = function() { return name; };

    this.setMutable = function(mutabl) { mutable = mutabl; };
    this.isMutable = function() { return mutable; };

    this.getEnv = function() { return env; };
    this.getScope = function() { return scope; };

};

module.exports = LispPackage;
