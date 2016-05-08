'use strict';

var List = require('./util/List.js');
var LispValue = require('./data/LispValue.js');

var LispParser = function(str) {

    // Keep track where our cursor is in 'str'
    var cursor = 0;
    var line = 0;
    var index = 0;

    // Keep track of the tokens we've parsed so far
    var tokens = new List();

    this.parse = function() {
        while (!this.eof()) {
            if (this.expectWhitespace()) {
                continue;
            }

            var token = this.readToken();
            tokens.add(token);
        }

        // Return all the tokens
        return tokens;
    };

    this.readToken = function(quoted) {
        // Skip all whitespace
        while (this.expectWhitespace() && !this.eof()) {
            // Do nothing
        }

        // Return if EOF
        if (this.eof()) {
            throw new Error(
                'Token expected, found EOF at %0:%1'.ftm(line, index)
            );
        }

        // Read and return token
        var pos = { line: line, index: index };
        var token = this.readSymbol() || this.readSExpression(quoted) ||
                    this.readString();

        if (!token) {
            throw new Error('Illegal token "%3" at %0:%1: %2'.fmt(
                line,
                index,
                str.charAt(cursor),
                token
            ));
        }
        token.setPosition(pos);
        return token;
    };

    this.expectWhitespace = function() {
        if (this.eof()) {
            return false;
        }
        var c = str.charAt(cursor);
        if (c === '\n') { // Newline, line++
            cursor++; line++; index = 0; return true;
        } else if (c === '\r') { // Carriage return
            cursor++; return true;
        } else if (c.in('\t', ' ')) { // Whitespace, index++
            cursor++; index++; return true;
        }
        return false;
    };

    this.readSymbol = function() {
        var reg = new RegExp(
            '^(\\,\\@|[\\\'\\,])?' +
            '([a-zA-Z0-9\\*\\$\\%\\^\\#\\!\\+\\-\\_\\=\\\\\\|\\[\\]\\:\\;' +
            '\\,\\.\\/\\?\\~\\@]+)'
        );
        var match = str.substr(cursor).match(reg);

        if (!match) { return undefined; }

        // Parse number if applicable
        var num = this.readNumber();
        if (num && num[1].length === match[0].length) {
            cursor += num[1].length;
            index += num[1].length;

            // Get number
            var norm = parseInt(num[2]);
            if (num[4] && num[4].length > 0) {
                norm *= Math.pow(
                    10,
                    parseInt(num[4].substr(1))
                );
            }

            return new LispValue.forType(
                LispValue.NUMBER,
                norm
            );
        }

        var pkg = '';
        if (match[2] && match[2].contains(':')) {
            pkg = match[2].cutBefore(':');
            match[2] = match[2].cutAfter(':');
        }

        var selfQuoted = match[1] ? match[1].in('\'', '`') : false;
        var selfUnquoted = match[1] ? match[1].charAt(0) === ',' : false;
        var quoted = selfQuoted && !selfUnquoted;

        var splat = match[1] ? (match[1].length > 1) : false;

        cursor += match[0].length;
        index += match[0].length;

        var result = LispValue.forType(
            LispValue.SYMBOL,
            match[2]
        );
        result.setQuoted(quoted);
        result.setSplat(splat);
        result.setPackage(pkg);
        return result;
    };

    this.readNumber = function() {
        var reg = new RegExp('^(([0-9]+)(\\.[0-9]+)?(e[0-9]+)?)');
        return str.substr(cursor).match(reg);
    };

    this.readSExpression = function(parentQuoted) {
        var reg = new RegExp('^([\\\'|\\`|\\,]?)\\(.*\\)');
        var match = str.substr(cursor).match(reg);

        if (!match) { return undefined; }

        // Move cursor past bracket and apostrophe if applicable
        var selfQuoted = match[1].length > 0 && match[1].in('\'', '`');
        var selfUnquoted = match[1].length > 0 && match[1] === ',';
        var quoted = (parentQuoted || selfQuoted) && !selfUnquoted;

        // Increase cursor position correct amount
        cursor += 1 + match[1].length;
        index += 1 + match[1].length;

        var tokens = new List();
        while (!this.eof()) {

            // Ignore all the whitespace
            if (this.expectWhitespace()) {
                continue;
            }

            // Check if we're done
            if (str.charAt(cursor) === ')') {
                cursor++; index++;
                break;
            }

            // Read more tokens
            var token = this.readToken(quoted);
            tokens.add(token);
        }

        // Create the resulting SExpression
        var result = LispValue.forType(
            LispValue.SEXPRESSION,
            tokens
        );
        result.setQuoted(quoted);
        return result;
    };

    this.readString = function() {
        var reg = new RegExp('^"(\\.|[^\\\"])+"');
        var match = str.substr(cursor).match(reg);

        if (!match) { return undefined; }

        cursor++; index++;

        var accum = '';
        while (!this.eof()) {
            var char = str.charAt(cursor++); index++;
            if (char === '"' && str.charAt(cursor - 2) !== '\\') {
                break;
            }
            accum += char;
        }

        accum = accum.replaceAll('\\"', '"');

        return LispValue.forType(
            LispValue.STRING,
            accum
        );
    };

    this.eof = function() {
        return cursor >= str.length;
    };

};

module.exports = LispParser;
