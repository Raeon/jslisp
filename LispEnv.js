'use strict';

var LispScope = require('./LispScope.js');
var LispParser = require('./LispParser.js');
var LispPackage = require('./LispPackage.js');
var LispValue = require('./data/LispValue.js');
var Mapper = require('./util/Mapper.js');
var Util = require('./util/Util.js');

var LibEnv = require('./lib/LibEnv.js');
var LibPkg = require('./lib/LibPkg.js');

var LispEnv = function(options) {

    options = options || {};
    Util.fillDefaults(options, {
        execStart: 0,
        execLimit: 0
    });

    var packages = new Mapper();
    //var rootScope = new LispScope(this, null);
    var activePackage = null;

    this.evalMulti = function(str) {
        var exprs = this.parseStr(str);
        var results = exprs.each(function(expr) {
            return expr.evaluate(this.getScope()).toString();
        }.bind(this));
        this.setOption('execStart', 0);
        return results.join('\n');
    };

    this.evalSingle = function(str) {
        var exprs = this.parseStr(str);
        var results = exprs.each(function(expr) {
            return expr.evaluate(this.getScope()).toString();
        }.bind(this));
        this.setOption('execStart', 0);
        return results.getLast();
    };

    this.parseStr = function(str) {
        return new LispParser(str).parse();
    };

    this.evalExpr = function(expr) {
        var result = expr.evaluate(this.getScope());
        this.setOption('execStart', 0);
        return result;
    };

    this.loadDefaults = function() {
        LibEnv(this);
        LibPkg(this);
        activePackage = this.getPackage('env');
    };

    this.createPackage = function(name) {
        name = name.toUpperCase();
        if (this.existsPackage(name)) { return undefined; }
        var pkg = new LispPackage(this, name);
        this.registerPackage(pkg);
        return pkg;
    };

    this.registerPackage = function(pkg) {
        if (this.existsPackage(pkg.getName())) { return false; }
        return packages.set(pkg.getName(), pkg);
    };

    this.unregisterPackage = function(name) {
        return packages.remove(name.toUpperCase());
    };

    this.getPackage = function(name) {
        return packages.get(name.toUpperCase());
    };

    this.setActivePackage = function(pkg) {
        activePackage = pkg;
    };

    this.getActivePackage = function() {
        return activePackage;
    };

    this.existsPackage = function(name) {
        return packages.contains(name.toUpperCase());
    };

    this.getScope = function() {
        return activePackage ? activePackage.getScope() : undefined;
    };

    this.setOption = function(name, value) {
        options[name] = value;
    };

    this.getOption = function(name) {
        return options[name];
    };

};

module.exports = LispEnv;
