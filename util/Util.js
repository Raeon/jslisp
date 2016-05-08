'use strict';
/* global $ */

exports.DEBUG = false;

exports.request = function(url, success, error) {
    $.ajax({
        url: url,
        dataType: 'json',
        success: success,
        error: error
    });
};

exports.inherits = function(child, parent, inst) {
    child.super_ = parent;
    child.prototype = Object.create(parent.prototype, {
        constructor: {
            value: child,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (inst) {
        inst.__proto__ = child.prototype;
    }
};

exports.extend = function(before, after) {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
    }
    return function() {
        var ret = before();
        if (exports.isDefined(ret)) {
            args.unshift(before());
        }
        return after.apply(undefined, args);
    };
};

exports.isDefined = function(arg) {
    return (arg !== null && arg !== undefined);
};

exports.addLogging = function(obj, name) {
    obj.log = function() {
        var args = ['[' + name + ']'];
        for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
        console.log.apply(console, args);
    };
    obj.info = function() {
        var args = ['[' + name + ']'];
        for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
        console.info.apply(console, args);
    };
    obj.warn = function() {
        var args = ['[' + name + ']'];
        for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
        console.warn.apply(console, args);
    };
    obj.error = function() {
        var args = ['[' + name + ']'];
        for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
        console.error.apply(console, args);
    };
    obj.debug = function() {
        if (!exports.DEBUG) {
            return;
        }
        var args = ['[' + name + ']'];
        for (var i = 0; i < arguments.length; i++) { args.push(arguments[i]); }
        console.debug.apply(console, args);
    };
};

exports.getType = function(val) {
    var type = Object.prototype.toString.call(val);
    return type.slice(8, type.length - 1).toLowerCase();
};

String.prototype.contains = function(sub) {
    return this.indexOf(sub) !== -1;
};

String.prototype.startsWith = function(sub) {
    return this.indexOf(sub) === 0;
};

String.prototype.endsWith = function(sub) {
    return this.length - this.indexOf(sub) === sub.length;
};

String.prototype.splitExisting = function(sub) {
    var parts = this.split(sub);
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].length === 0) {
            parts.splice(i--, 1);
        }
    }
    return parts;
};

String.prototype.replaceAll = function(search, replace) {
    return this.replace(new RegExp(search, 'g'), replace);
};

String.prototype.cutBefore = function(sub) {
    var index = this.indexOf(sub);
    if (index === -1) {
        return this;
    }
    return this.substring(0, index);
};

String.prototype.cutAfter = function(sub) {
    var index = this.indexOf(sub);
    if (index === -1) {
        return '';
    }
    return this.substring(index + sub.length);
};

String.prototype.in = function() {
    for (var i = 0, l = arguments.length; i < l; i++) {
        if (arguments[i] === this) {
            return true;
        }
    }
    return false;
};

String.prototype.format = function() {
    var args = arguments;
    var reg = new RegExp('\%([0-9]+)', 'g');
    return this.replace(reg, function(full, num) {
        return args[parseInt(num)];
    });
};
String.prototype.fmt = String.prototype.format;

String.prototype.isUpperCase = function() {
    for (var i = 0, l = this.length; i < l; i++) {
        var char = this.charAt(i);
        if (char !== char.toUpperCase()) {
            return false;
        }
    }
    return true;
};

String.prototype.isLowerCase = function() {
    for (var i = 0, l = this.length; i < l; i++) {
        var char = this.charAt(i);
        if (char !== char.toLowerCase()) {
            return false;
        }
    }
    return true;
};

// Array


// Object


exports.fillDefaults = function(to, from) {
    for (var key in from) {
        if (from.hasOwnProperty(key)) {
            if (!to.hasOwnProperty(key)) {
                to[key] = from[key];
            }
        }
    }
    return to;
};
