'use strict';

var Util = require('../util/Util.js');

var LispString = function(LispValue, str) {
    LispValue.call(this, LispValue.STRING, str);
    Util.inherits(LispString, LispValue, this);

    this.toString = function() {
        return '"' + this.getValue() + '"';
    };

};

module.exports = LispString;
