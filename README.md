# About
JSLisp is a hand-built Lisp 'implementation' or interpreter built in
JavaScript. The purpose of this project is to allow an easy-to-use yet entirely
safe scripting language within JavaScript.

# Building
For use in a browser, I recommend using `browserify` to compress the files into
a single file. As of right now, the project is also fully NodeJS compatible
tested on NodeJS v5.3.0 on Windows 10 x64.

# Usage
To use the JSLisp environment, you should `require()` the `LispEnv` class and
invoke it to get a new `LispEnv`. With this, you can evaluate raw strings, or
manage `LispPackage`s. To create new builtin functions or custom packages,
you should create a `LispPackage` by using `LispEnv.createPackage(name)`.
Using a `LispPackage` object you can then use `addBuiltin(..)` to define new
built-in functions. I recommend you look at the lib/*.js files for examples
of how to do this.

# Contributing
Feel free to open pull requests or fork the project. When submitting pull
requests, please make sure your code style matches the style used in the
currently existing code.

# License
See LICENSE