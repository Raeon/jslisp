'use strict';

var Util = require('../util/Util.js');

var LispNumber = function(LispValue, value) {
    LispValue.call(this, LispValue.NUMBER, value);
    Util.inherits(LispNumber, LispValue, this);
    this.__proto__ = LispNumber.prototype;

    this.toString = function() {
        return '' + value;
    };
};

module.exports = LispNumber;
