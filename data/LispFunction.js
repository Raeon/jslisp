'use strict';

var Util = require('../util/Util.js');

var LispFunction = function(LispValue, func) {
    LispValue.call(this, LispValue.FUNCTION, func);
    Util.inherits(LispFunction, LispValue, this);

    var builtin = !!func;
    var name = null; // unevaluated Symbol
    var funcScope = null; // Scope
    var parameters = null; // unevaluated SExpression
    var body = null; // unevaluated SExpression

    this.setBuiltin = function(flag) { builtin = flag; };
    this.isBuiltin = function() { return builtin; };

    this.setName = function(nam) { name = nam; };
    this.getName = function() { return name; };

    this.setScope = function(scope) { funcScope = scope; };
    this.getScope = function() { return funcScope; };

    this.setParameters = function(params) { parameters = params; };
    this.getParameters = function() { return parameters; };

    this.setBody = function(bod) { body = bod; };
    this.getBody = function() { return body; };

    // this.eval = function(_scope) { return this; }
    // Function always evaluates to LispFunction!

    this.clone = Util.extend(this.clone, function(clone) {
        clone.setBuiltin(builtin);
        clone.setName(name.clone());
        clone.setScope(funcScope);
        clone.setParameters(parameters ? parameters.clone() : undefined);
        clone.setBody(body ? body.clone() : undefined);
        return clone;
    }.bind(this));

    this.toString = function() {
        return '<%0function %1%2>'.fmt(
            builtin ? 'builtin ' : '',
            name.getValue(),
            builtin ? '' : ' ' + parameters.toString()
        );
    };

};

module.exports = LispFunction;
