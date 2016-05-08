'use strict';

var Util = require('../util/Util.js');

var LispMacro = function(LispValue, func) {
    LispValue.call(this, LispValue.MACRO, func);
    Util.inherits(LispMacro, LispValue, this);

    var builtin = !!func;
    var name = 'MACRO';
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

    this.clone = Util.extend(this.clone, function(clone) {
        var val = this.getValue();
        clone.setValue((val && val.clone) ? val.clone() : val);
        clone.setBuiltin(builtin);
        clone.setName(name.clone());
        clone.setScope(funcScope);
        clone.setPosition(this.getPosition());
        clone.setParameters(parameters ? parameters.clone() : undefined);
        clone.setBody(body ? body.clone() : undefined);
        return clone;
    }.bind(this));

    this.toString = function() {
        return '<%0macro %1%2>'.fmt(
            builtin ? 'builtin ' : '',
            name.getValue(),
            builtin ? '' : ' ' + parameters.toString()
        );
    };

};

module.exports = LispMacro;
