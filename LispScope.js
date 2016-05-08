'use strict';

var Mapper = require('./util/Mapper.js');
var Util = require('./util/Util.js');
var LispValue = require('./data/LispValue.js');

var LispScope = function(env, parent) {
    Util.addLogging(this, 'LispScope');

    var map = new Mapper();

    this.set = function(name, value) {
        // If it is defined in package, GET MAD!
        // I DON'T NEED YOUR F***ING LEMONS!
        var pkg = env.getActivePackage();
        if (pkg.exists(name)) {
            return false;
        }
        // If it is defined locally, redefine locally
        if (map.contains(name)) {
            return map.set(name, value);
        }
        // If it is defined in parent, redefine in parent
        if (parent && parent.exists(name)) {
            return parent.set(name, value);
        }
        // Set locally otherwise
        return map.set(name, value);
    };
    this.setLocal = function(name, value) { return map.set(name, value); };
    this.setGlobal = function(name, value) {
        return this.getRoot().set(name, value);
    };

    this.get = function(name) {
        var val = map.get(name); // get locally
        if (!val) { // if it doesnt exist locally,
            // try to get it from parent if we have one, or env otherwise
            val = parent ? parent.get(name) : env.getActivePackage().get(name);
        }
        // clone val if it exists or return undefined
        return val ? val.clone() : LispValue.forType(
            LispValue.ERROR,
            'Variable ' + name + ' does not exist in the current scope'
        );
    };

    this.exists = function(name) {
        return map.contains(name) || (parent && parent.exists(name));
    };

    this.getParent = function() { return parent; };
    this.getChild = function() { return new LispScope(env, this); };

    this.getRoot = function() {
        if (!parent) {
            return this;
        }

        var par = parent;
        while (par.getParent()) {
            par = par.getParent();
        }
        return par;
    };

    this.getDepth = function() {
        if (!parent) {
            return 1;
        }

        var par = parent;
        var depth = 1;
        while (par.getParent()) {
            par = par.getParent();
            depth++;
        }
        return depth;
    };

    this.getEnv = function() { return env; };

};

module.exports = LispScope;
