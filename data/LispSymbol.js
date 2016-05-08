'use strict';

var Util = require('../util/Util.js');

var LispSymbol = function(LispValue, symbol) {
    symbol = symbol.toUpperCase();
    LispValue.call(this, LispValue.SYMBOL, symbol);
    Util.inherits(LispSymbol, LispValue, this);

    var splat = false;
    var packag = '';

    this.eval = function(scope) {
        if (this.isQuoted()) {
            return this;
        }

        // If we are in a package
        if (packag.length > 0) {

            // Get the package or error if it doesn't exist
            var pkg = scope.getEnv().getPackage(packag);
            if (!pkg) {
                var err = LispValue.forType(
                    LispValue.ERROR,
                    'Symbol %0 belongs to unknown package %1'.fmt(
                        this.getValue(),
                        packag
                    )
                );
                err.addTrace(this.toString() + ' when evaluating symbol');
                return err;
            }

            // Get value from package
            var result = pkg.get(this.getValue());
            return result;
        }

        // Get value from scope
        result = scope.get(this.getValue());
        return result;
    };


    this.setSplat = function(splt) { splat = splt; };
    this.isSplat = function() { return splat; };

    this.setPackage = function(pkg) { packag = pkg; };
    this.getPackage = function() { return packag; };

    this.clone = Util.extend(this.clone, function(clone) {
        clone.setSplat(splat);
        clone.setPackage(packag);
        return clone;
    }.bind(this));

    this.toString = function() {
        return '%0%1'.fmt(
            packag.length > 0 ? packag + ':' : '',
            this.getValue()
        );
    };

};

module.exports = LispSymbol;
