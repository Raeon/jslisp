'use strict';

var List = function(list) {

    list = list || [];

    this.set = function(i, elem) {
        list[i] = elem;
        return true;
    };

    this.get = function(i) {
        return list[i];
    };

    this.splice = function(start, len, elem) {
        return list.splice(start, len, elem);
    };

    this.prepend = function(elem) {
        return list.unshift(elem);
    };

    this.append = function(elem) {
        return list.push(elem) - 1;
    };
    this.add = this.append;

    this.before = function(i) {
        return new List(list.slice(0, i));
    };

    this.after = function(i) {
        return new List(list.slice(i + 1));
    };

    this.remove = function(i) {
        if (i >= 0 && i < list.length) {
            list.splice(i, 1);
            return true;
        }
        return false;
    };

    this.removeValue = function(elem) {
        return this.remove(this.indexOf(elem));
    };

    this.removeFirst = function() {
        return list.shift();
    };

    this.removeLast = function() {
        return list.pop();
    };

    this.getFirst = function() { return list[0]; };

    this.getLast = function() {
        if (this.length > 0) {
            return list[list.length - 1];
        }
        return undefined;
    };

    this.concat = function(lst) {
        lst.each(function(elem) {
            this.append(elem);
        }.bind(this));
        return this;
    };

    this.each = function(func) {
        var result = [];
        for(var i = 0, l = list.length; i < l; i++) {
            result[i] = func(list[i], i);
        }
        return result;
    };

    this.every = function(func) {
        for (var i = 0, l = list.length; i < l; i++) {
            if (func(list[i], i) !== true) {
                return false;
            }
        }
        return true;
    };

    this.some = function(func) {
        for (var i = 0, l = list.length; i < l; i++) {
            if (func(list[i], i) === true) {
                return true;
            }
        }
        return false;
    };

    this.none = function(func) {
        return !this.some(func);
    };

    this.clear = function() { list = []; };

    this.clone = function() {
        var result = [];
        for (var i = 0, l = this.length(); i < l; i++) {
            result[i] = list[i].clone ? list[i].clone() : list[i];
        }
        return new List(result);
    };

    this.contains = function(elem) {
        return list.includes(elem);
    };

    this.reverse = function() {
        list.reverse();
        return this;
    };

    this.length = function() { return list.length; };

    this.import = function(data, func) {
        this.clear();
        if (typeof(func) !== 'function') {
            return this.join(data);
        }
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var mapping = func(key, data[key]);
                list[mapping.key] = mapping.value;
            }
        }
        return this;
    };

    this.export = function() {
        return list;
    };

};

module.exports = List;
