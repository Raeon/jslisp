'use strict';

var List = require('../util/List.js');
var Util = require('../util/Util.js');

var LispSExpression = function(LispValue, children) {
    LispValue.call(this, LispValue.SEXPRESSION, children);
    Util.inherits(LispSExpression, LispValue, this);

    this.eval = function(scope) {

        var env = scope.getEnv();
        var limit = env.getOption('execLimit');

        // If time limit in place
        if (limit !== 0) {
            var now = new Date().getTime();
            var start = env.getOption('execStart');
            // Check if we have started tracking
            if (start === 0) {
                // Start tracking now
                env.setOption('execStart', now);
            } else {
                // Check if the time has elapsed
                if (now - start > limit) {
                    var err = LispValue.forType(
                        LispValue.ERROR,
                        'Execution time elapsed. Max: %0ms, Used: %1ms'.fmt(
                            limit,
                            now - start
                        )
                    );
                    err.addTrace(this.toString() + ' pre-evaluation');
                    return err;
                }
            }
        }

        // If we are not quoted:
        // - Evaluate all children, they deal with quotes themselves
        // If we are quoted:
        // - Iterate over all children
        // - If the current child is an SExpression:
        //   + Invoke evaluate() on the child anyways! There might be a nested
        //     child that is unquoted and must be evaluated now.
        // - If the current child isQuoted(), setQuoted(false) and do not eval
        // - Unquote self, because we have been evaluated once

        // Initialize reused variables
        var children = this.getValue();
        var i = 0, l = children.length(), child;

        // Return self if we have no children
        if (l === 0) { return this; }

        // Return error any of our children are errors
        for (i = 0, l = children.length(); i < l; i++) {
            child = children.get(i);
            if (child.getType() === LispValue.ERROR) {
                return child;
            }
        }

        // Return self if we are quoted
        if (this.isQuoted()) {
            return this;
        }

        // Get the real first argument
        var first = children.get(0).clone().evaluate(scope);
        if (first.getType() !== LispValue.FUNCTION &&
            first.getType() !== LispValue.MACRO) {

            // Return error if it's an error
            if (first.getType() === LispValue.ERROR) {
                return first;
            }

            // Return real error
            return first.toError(
                'First argument must be %0 or %1, got %2'.fmt(
                    LispValue.getName(LispValue.FUNCTION),
                    LispValue.getName(LispValue.MACRO),
                    LispValue.getName(first.getType())
                )
            );
        }

        // TODO: Reconsider when to check if first argument is quoted

        // Check if we're dealing with a macro
        var macro = first.getType() === LispValue.MACRO;

        // Differences:
        // - Do not eval arguments
        // - Evaluate body twice

        // Check if we're trying to evaluate a macro

        // Iterate over all children if we're not a macro:
        if (!macro) {
            for (i = 0; i < children.length(); i++) {
                child = children.get(i);

                // Do not evaluate child if we are quoted and it is not an SExpr.
                if (this.isQuoted() &&
                    child.getType() !== LispValue.SEXPRESSION) {
                    continue;
                }

                // Evaluate child if we aren't quoted, or it is an SExpression.
                var result = child.evaluate(scope);
                if (result.getType() === LispValue.ERROR) {
                    return result;
                }

                // Treat result as an Array if a ,@splat operator was used
                if (result instanceof Array) {

                    // Remove current entry
                    children.splice(i, 1);

                    // Add in other entries
                    if (result.length > 0) {
                        children.splice(i, result.length, result);
                        i += result.length;
                    }

                    // Decrease i by 1 because we deleted the original element
                    // and we want to evaluate all the arguments
                    i--;
                } else {
                    children.set(i, result);
                }
            }

            // Single expression
            if (children.length() == 1 &&
                children.get(0).getType() !== LispValue.FUNCTION) {
                return children.get(0).evaluate(scope);
            }

            // Return result if first argument is quoted
            if (first.isQuoted()) {
                return this.toError('First argument is quoted');
            }
        }

        // Get the arguments without the function prepended
        var args = children.after(0);

        // Call the builtin function and return the result
        if (first.isBuiltin()) {
            var func = first.getValue();
            return func(scope, args);
        }

        // Get the function/macro properties
        var scop = first.getScope().getChild();
        var params = first.getParameters();
        var body = first.getBody();

        // TODO: Deal with variable argument counts!

        // Check parameter count matches argument count
        if (params.getValue().length() !== args.length()) {
            return first.toError('Expected %0 arguments, got %1'.fmt(
                params.getValue().length(),
                args.length()
            ));
        }

        // Bind all arguments to parameter names in function scope
        for (i = 0, l = args.length(); i < l; i++) {
            var sym = params.getValue().get(i);
            var val = args.get(i);
            scop.setLocal(sym.getValue(), val);
        }

        // Evaluate the function body
        var res = null;
        if (!macro) {
            for (i = 0, l = body.length(); i < l; i++) {
                var expr = body.get(i);
                res = expr.evaluate(scop);
            }
        } else {
            console.log('before:', body.toString());
            res = body.evaluate(scop);
            console.log('during:', res.toString());
            res = res.evaluate(scop);
            console.log('after:', res.toString());
        }

        // Evaluate the function body
        return res;

    };

    this.clone = Util.extend(this.clone, function(clone) {
        var list = new List();
        var old = this.getValue();
        for (var i = 0, l = old.length(); i < l; i++) {
            list.set(i, old.get(i).clone());
        }
        clone.setValue(list);
        return clone;
    }.bind(this));

    this.toString = function(parentQuoted) {
        parentQuoted = parentQuoted || false;
        var str = '';
        if (parentQuoted && !this.isQuoted()) {
            str += ',';
        } else if (!parentQuoted && this.isQuoted()) {
            str += '\'';
        }
        str += '(';
        var children = this.getValue();
        for (var i = 0, l = children.length(); i < l; i++) {
            str += children.get(i).toString(this.isQuoted());
            if (i != l - 1) {
                str += ' ';
            }
        }
        str += ')';
        return str;
    };
};

module.exports = LispSExpression;
