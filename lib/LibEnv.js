'use strict';

var LispValue = require('../data/LispValue.js');

var LibEnv = function(env) {

    var pkg = env.createPackage('env');
    if (!pkg) {
        throw new Error('Failed to register LibEnv');
    }

    // EVAL
    pkg.addBuiltin('eval', false,
        function(scope, arg) {
            return arg.evaluate(scope);
        }, [{ type: LispValue.SEXPRESSION }]);

    // DEFINE
    pkg.addBuiltin('def', false,
        function(scope, name, value) {
            scope.set(name.getValue(), value); return name;
        }, [{ type: LispValue.SYMBOL },
            { type: LispValue.ANYTHING }]);

    // PRINT
    pkg.addBuiltin('print', false,
        function(scope, args) {
            var a = '';
            args.each(function(arg) { a += arg.toString() + '\n'; });
            if (a.length > 0) { a = a.substr(0, a.length - 1); }
            return LispValue.fromPrimitive(a);
        }, [{ type: LispValue.ANYTHING, remainder: true }]);

    // LAMBDA
    pkg.addBuiltin('lambda', true,
        function(scope, params, body) {
            // Check if all parameters are symbols and scan for
            // either optional or remainder arguments
            var rparams = params.getValue();

            for (var i = 0, l = rparams.length(); i < l; i++) {
                var param = rparams.get(i);

                // Error if the param isn't a symbol
                if (param.getType() !== LispValue.SYMBOL) {

                    // Return error if it is one
                    var err = (param.getType() === LispValue.ERROR) ?
                        param :
                        LispValue.forType(
                            LispValue.ERROR,
                            'LAMBDA Parameter %0 is of type %1' +
                            'but expected %2'.fmt(
                                i,
                                LispValue.getName(param.getType()),
                                LispValue.getName(LispValue.SYMBOL)
                            )
                        );

                    err.addTrace(this.toString() + ' PARAMETER verification');
                    return err;
                }
            }

            // Check if all body lines are expressions
            for (i = 0, l = body.length(); i < l; i++) {
                var arg = body.get(i);
                if (arg.getType() !== LispValue.SEXPRESSION) {

                    // Return error if it is one
                    err = (param.getType() === LispValue.ERROR) ?
                        arg :
                        LispValue.forType(
                            LispValue.ERROR,
                            'LAMBDA Argument %0 is of type %1' +
                            'but expected %2'.fmt(
                                i,
                                LispValue.getName(param.getTye()),
                                LispValue.getName(LispValue.SYMBOL)
                            )
                        );

                    err.addTrace(this.toString() + ' BODY verification');
                    return err;
                }
            }

            var fun = LispValue.forType(LispValue.FUNCTION, null);
            fun.setBuiltin(false);
            fun.setScope(scope.getChild());
            fun.setName(LispValue.forType(LispValue.SYMBOL, 'lambda'));
            fun.setParameters(params);
            fun.setBody(body);
            return fun;
        }, [{ type: LispValue.SEXPRESSION },
            { type: LispValue.SEXPRESSION, remainder: true }]);

    // MACRO
    pkg.addBuiltin('macro', true,
        function(scope, params, body) {
            // Check if all parameters are symbols and scan for
            // either optional or remainder arguments
            var rparams = params.getValue();

            for (var i = 0, l = rparams.length(); i < l; i++) {
                var param = rparams.get(i);

                // Error if the param isn't a symbol
                if (param.getType() !== LispValue.SYMBOL) {

                    // Return error if it is one
                    var err = (param.getType() === LispValue.ERROR) ?
                        param :
                        LispValue.forType(
                            LispValue.ERROR,
                            'MACRO Parameter %0 is of type %1' +
                            'but expected %2'.fmt(
                                i,
                                LispValue.getName(param.getType()),
                                LispValue.getName(LispValue.SYMBOL)
                            )
                        );

                    err.addTrace(this.toString() + ' PARAMETER verification');
                    return err;
                }
            }

            var mac = LispValue.forType(LispValue.MACRO, null);
            mac.setScope(scope.getChild());
            mac.setName(LispValue.forType(LispValue.SYMBOL, 'macro'));
            mac.setParameters(params);
            mac.setBody(body);
            return mac;
        }, [{ type: LispValue.SEXPRESSION },
            { type: LispValue.SEXPRESSION }]);

    // TYPEOF
    pkg.addBuiltin('typeof', false,
        function(scope, arg) {
            return LispValue.getName(arg.getType());
        }, [{ type: LispValue.ANYTHING }]);

    // LIST?
    pkg.addBuiltin('list?', false,
        function(scope, arg) {
            return arg.getType() === LispValue.SEXPRESSION ? 1 : 0;
        }, [{ type: LispValue.ANYTHING }]);

    // NUMBER?
    pkg.addBuiltin('number?', false,
        function(scope, arg) {
            return arg.getType() === LispValue.NUMBER ? 1 : 0;
        }, [{ type: LispValue.ANYTHING }]);

    // SYMBOL?
    pkg.addBuiltin('symbol?', false,
        function(scope, arg) {
            return arg.getType() === LispValue.SYMBOL ? 1 : 0;
        }, [{ type: LispValue.ANYTHING }]);

    // STRING?
    pkg.addBuiltin('string?', false,
        function(scope, arg) {
            return arg.getType() === LispValue.STRING ? 1 : 0;
        }, [{ type: LispValue.ANYTHING }]);

    // FUNCTION?
    pkg.addBuiltin('function?', false,
        function(scope, arg) {
            return arg.getType() === LispValue.FUNCTION ? 1 : 0;
        }, [{ type: LispValue.ANYTHING }]);

    // MACRO?
    pkg.addBuiltin('macro?', false,
        function(scope, arg) {
            return arg.getType() === LispValue.MACRO ? 1 : 0;
        }, [{ type: LispValue.ANYTHING }]);

    // ERROR?
    pkg.addBuiltin('error?', false,
        function(scope, arg) {
            return arg.getType() === LispValue.ERROR ? 1 : 0;
        }, [{ type: LispValue.ANYTHING }]);

    // +
    pkg.addBuiltin('+', false,
        function(scope, a, nums){
            nums.each(function(num) { a += num; }); return a;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true, remainder: true }]);

    // -
    pkg.addBuiltin('-', false,
        function(scope, a, nums){
            if (nums.length === 0) { return 0 - a; }
            nums.each(function(num) { a -= num; }); return a;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true, remainder: true }]),

    // *
    pkg.addBuiltin('*', false,
        function(scope, a, nums){
            nums.each(function(num) { a *= num; }); return a;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true, remainder: true }]);

    // /
    pkg.addBuiltin('/', false,
        function(scope, a, nums){
            nums.each(function(num) { a /= num; });
            if (isNaN(a)) { return 0; } if (!isFinite(a)) { return 0; }
            return a;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true, remainder: true }]);

    // LIST
    pkg.addBuiltin('list', false,
        function(scope, args) {
            return args;
        }, [{ type: LispValue.ANYTHING, native: true, remainder: true }]);

    // HEAD
    pkg.addBuiltin('head', false,
        function(scope, args) {
            return args.getFirst();
        }, [{ type: LispValue.SEXPRESSION, native: true }]);

    // TAIL
    pkg.addBuiltin('tail', false,
        function(scope, args) {
            return args.getLast();
        }, [{ type: LispValue.SEXPRESSION, native: true }]);

    // JOIN
    pkg.addBuiltin('join', false,
        function(scope, list, args) {
            args.each(function(lst) { list.concat(lst); }); return list;
        }, [{ type: LispValue.SEXPRESSION, native: true },
            { type: LispValue.SEXPRESSION, native: true, remainder: true }]);

    // CAR
    pkg.addBuiltin('car', false,
        function(scope, list) {
            return list.getFirst();
        }, [{ type: LispValue.SEXPRESSION, native: true }]);

    // CDR
    pkg.addBuiltin('cdr', false,
        function(scope, list) {
            return list.after(0);
        }, [{ type: LispValue.SEXPRESSION, native: true }]);

    // NTH
    pkg.addBuiltin('nth', false,
        function(scope, list, index) {
            if (list.get(index)) {
                return list.get(index);
            }
            return 0;
        }, [{ type: LispValue.SEXPRESSION, native: true },
            { type: LispValue.NUMBER, native: true }]);

    // =
    pkg.addBuiltin('=', false,
        function(scope, a, b) {
            return a === b ? 1 : 0;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true }]);

    // !=
    pkg.addBuiltin('!=', false,
        function(scope, a, b) {
            return a !== b ? 1 : 0;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true }]);

    // <
    pkg.addBuiltin('<', false,
        function(scope, a, b) {
            return a < b ? 1 : 0;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true }]);

    // <=
    pkg.addBuiltin('<=', false,
        function(scope, a, b) {
            return a <= b ? 1 : 0;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true }]);

    // >
    pkg.addBuiltin('>', false,
        function(scope, a, b) {
            return a > b ? 1 : 0;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true }]);

    // >=
    pkg.addBuiltin('>=', false,
        function(scope, a, b) {
            return a >= b ? 1 : 0;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true }]);

    // EQ
    pkg.addBuiltin('eq', true,
        function(scope, a, b) {
            return a === b ? 1 : 0;
        }, [{ type: LispValue.ANYTHING },
            { type: LispValue.ANYTHING }]);

    // STRING
    pkg.addBuiltin('string', false,
        function(scope, a) {
            return a.toString();
        }, [{ type: LispValue.ANYTHING }]);

    // RAND
    pkg.addBuiltin('rand', false,
        function(scope, min, max) {
            return Math.random() * (max - min) + min;
        }, [{ type: LispValue.NUMBER, native: true },
            { type: LispValue.NUMBER, native: true }]);

};

module.exports = LibEnv;
