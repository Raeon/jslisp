'use strict';

var Mapper = function(data) {
    var mappings = data || {};

    this.put = function(key, value) {
        mappings[key] = value;
        return true;
    };
    this.set = this.put;

    this.get = function(key) {
        var value = mappings[key];
        if (value && mappings.hasOwnProperty(key)) {
            return value;
        }
        return undefined;
    };

    this.remove = function(key) {
        var value = mappings[key];
        if (value) {
            delete mappings[key];
            return true;
        }
        return false;
    };

    this.contains = function(key) {
        return mappings[key] !== undefined;
    };
    this.exists = this.contains;

    this.keys = function() {
        var keys = [];
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                keys.append(key);
            }
        }
        return keys;
    };

    this.values = function() {
        var values = [];
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                values.append(mappings[key]);
            }
        }
        return values;
    };

    this.each = function(func) {
        var result = [];
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                result[key] = func(key, mappings[key]);
            }
        }
        return result;
    };

    this.every = function(func) {
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                if (!func(key, mappings[key])) {
                    return false;
                }
            }
        }
        return true;
    };

    this.some = function(func) {
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                if (func(key, mappings[key]) === true) {
                    return true;
                }
            }
        }
        return false;
    };

    this.none = function(func) {
        return !this.some(func);
    };

    this.clear = function() {
        mappings = {};
    };

    this.clone = function() {
        var clone = new Mapper();
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                clone.put(key, mappings[key]);
            }
        }
        return clone;
    };

    this.length = function() {
        var len = 0;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                len++;
            }
        }
        return len;
    };

    this.import = function(data, func) {
        if (typeof(func) !== 'function') {
            mappings = data || mappings;
            return;
        }
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var mapping = func(key, data[key]);
                data[mapping.key] = mapping.value;
            }
        }
        mappings = data || mappings;
    };

    this.export = function() {
        var data = {};
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                var value = mappings[key];

                key = key.export ? key.export() : key;
                value = value.export ? value.export() : value;

                data[key] = value;
            }
        }
        return data;
    };
};

module.exports = Mapper;
