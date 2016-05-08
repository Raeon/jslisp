'use strict';

//require('./Lisp@(?*).js', { mode: 'expand' });
require('./LispError.js');
require('./LispFunction.js');
require('./LispMacro.js');
require('./LispNumber.js');
require('./LispSExpression.js');
require('./LispString.js');
require('./LispSymbol.js');
var List = require('../util/List.js');
var Util = require('../util/Util.js');

var LispValue = function(type, value) {

    var quoted = false;
    var position = { line: -1, index: -1 };

    this.evaluate = function(scope) {
        // If quoted:
        // return the variable in the scope
        // otherwise, use yourself

        // If splat:
        // splat list

        // Evaluate self
        var result = this.eval(scope);

        // Set quoted to false because we've been evaluated
        quoted = false;

        if (this.isSplat && this.isSplat()) {
            // The argument is supposed to be splat!
            if (result.getValue() instanceof Array) {
                return result.getValue();
            } else {
                return result.toError('Unsplattable argument');
            }
        }
        return result;
    };
    this.eval = function(_scope) { return this; };

    this.setValue = function(val) { value = val; };
    this.getValue = function() { return value; };

    this.setQuoted = function(quote) { quoted = quote; };
    this.isQuoted = function() { return quoted; };

    this.getType = function() { return type; };

    this.setPosition = function(pos) { position = pos; };
    this.getPosition = function() { return position; };

    this.clone = function() {
        var val = LispValue.forType(type, value);
        val.setQuoted(quoted);
        val.setPosition(position);
        return val;
    };

    this.toString = function() {
        return value;
    };
    this.toDebug = function() {
        return '%0 at %1:%2'.fmt(
            this.toString(),
            position.line,
            position.index
        );
    };
    this.toError = function(msg) {
        return LispValue.forType(
            LispValue.ERROR,
            '%0: %1'.fmt(msg, this.toDebug())
        );
    };

};

var Mapper = require('../util/Mapper.js');
var map = new Mapper();

LispValue.ANYTHING = -1;
LispValue.ERROR = 0;
LispValue.SYMBOL = 1;
LispValue.NUMBER = 2;
LispValue.SEXPRESSION = 3;
LispValue.FUNCTION = 4;
LispValue.MACRO = 5;
LispValue.STRING = 6;

map.put(LispValue.ANYTHING, 'Anything');
map.put(LispValue.ERROR, 'Error');
map.put(LispValue.SYMBOL, 'Symbol');
map.put(LispValue.NUMBER, 'Number');
map.put(LispValue.SEXPRESSION, 'SExpression');
map.put(LispValue.FUNCTION, 'Function');
map.put(LispValue.MACRO, 'Macro');
map.put(LispValue.STRING, 'String');

LispValue.forType = function(type, value) {
    var cl = require('./Lisp' + map.get(type) + '.js');
    if (cl) {
        return new cl(LispValue, value);
    }
};

LispValue.forName = function(name, value) {
    var cl = require('./Lisp' + name + '.js');
    if (cl) {
        return new cl(LispValue, value);
    }
};

LispValue.getName = function(type) {
    return map.get(type);
};

LispValue.fromPrimitive = function(obj) {
    if (obj instanceof LispValue) {
        return obj;
    }
    var type = Util.getType(obj);
    switch(type) {
        case 'string':
            if (obj.isUpperCase()) {
                return LispValue.forType(LispValue.SYMBOL, obj);
            }
            return LispValue.forType(LispValue.STRING, obj);
        case 'number':
            return LispValue.forType(LispValue.NUMBER, obj);
        case 'array':
            var objs = [];
            for (var i = 0, l = obj.length; i < l; i++) {
                objs[i] = LispValue.fromPrimitive(obj[i]);
            }
            return LispValue.forType(LispValue.SEXPRESSION, new List(objs));
        case 'boolean':
            return LispValue.fromPrimitive(obj ? 1 : 0);
        default:
            return LispValue.forType(
                LispValue.ERROR,
                'No LispValue type found for native type \'%0\''.fmt(
                    type
                ));
    }
};

module.exports = LispValue;
