'use strict';

var List = require('../util/List.js');
var Util = require('../util/Util.js');

var LispError = function(LispValue, error) {
    LispValue.call(this, LispValue.ERROR, error);
    Util.inherits(LispError, LispValue, this);

    var traces = new List();

    this.addTrace = function(msg) {
        traces.append(msg);
    };

    this.toString = function() {
        return 'ERROR: ' +
            this.getValue() +
            (traces.length > 0 ? '\n' : '') +
            traces.reverse().each(
                function(trace) {
                    return 'at ' + trace;
                }
            ).join(', ');
    };

};

module.exports = LispError;
