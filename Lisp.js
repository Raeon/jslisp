'use strict';

var Scope = require('./Scope.js');
var LispParser = require('./LispParser.js');
require('./util/Util.js');

var Lisp = function() {

    var scope = new Scope();

    this.read = function(str) {
        var parser = new LispParser(str);
        var exprs = parser.parse(str);
        //var expr = parser.parse(str);
        return exprs;
    };

    this.eval = function(exprs) {
        var results = exprs.each(
            function(expr) {
                return expr.evaluate(scope);
            }
        );
        return results.join('\n');
    };

    this.evalstr = function(str) {
        return this.eval(this.read(str)).toString();
    };

    this.getScope = function() {
        return scope;
    };

};



module.exports = Lisp;
