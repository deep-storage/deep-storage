"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Is one array a prefix on another e.g.
 *
 * [] is a prefix of any array
 * ['asdf'] is a prefix of ['asdf', ...]
 *
 * etc.
 *
 * @param full the full array to check, must not be null
 * @param partial the partial array to check
 */
function isPrefix(full, partial) {
    if (partial.length > full.length)
        return false;
    for (var i = 0; i < partial.length; i++) {
        if (partial[i] !== full[i])
            return false;
    }
    return true;
}
exports.default = function (s) { return new DefaultDeepStorage(s); };
var DefaultDeepStorage = (function () {
    function DefaultDeepStorage(state) {
        var _this = this;
        this.state = state;
        this.id = 0;
        this.subscriptions = {};
        this.update = function (callback) {
            return _this.updateIn()(callback);
        };
        this.updateProperty = function (key, callback) {
            return _this.updateIn(key)(callback);
        };
        this.setIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return function (newValue) {
                _this.updateIn.apply(_this, path)(function () { return newValue; });
            };
        };
        this.merge = function (partial) {
            _this.update(function (oldState) {
                for (var key in partial) {
                    oldState[key] = partial[key];
                }
                return oldState;
            });
        };
        this.updateIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return function (callback) {
                var oldState = _this.stateIn.apply(_this, path);
                var newState = callback(oldState);
                if (path.length === 0) {
                    _this.state = newState;
                }
                else {
                    // todo: this will no doubt cause some bugs... better to replace all the 
                    // parent objects too so that reference equality checks work in react
                    _this.stateIn.apply(_this, path.slice(0, path.length - 1))[path[path.length - 1]] = newState;
                }
                var fullPath = path;
                for (var subscriberId in _this.subscriptions) {
                    var subscriber = _this.subscriptions[subscriberId];
                    // check to see if we have any matches
                    if (subscriber.paths.some(function (subscriberPath) { return isPrefix(fullPath, subscriberPath); })) {
                        subscriber.callback(fullPath, newState, oldState);
                    }
                }
            };
        };
        this.stateIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            var currentState = _this.state;
            for (var _a = 0, path_1 = path; _a < path_1.length; _a++) {
                var p = path_1[_a];
                if (!(p in currentState)) {
                    // todo: consider looking ahead to see if the next
                    // p is a number and if so, initialize and array
                    // instead of an object
                    currentState[p] = {};
                }
                currentState = currentState[p];
            }
            return currentState;
        };
        this.deep = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return new NestedDeepStorage(path, _this);
        };
        this.subscription = function (callback) {
            var subscriberId = _this.id++;
            _this.subscriptions[subscriberId] = {
                callback: callback,
                paths: []
            };
            var cancel = function () {
                delete _this.subscriptions[subscriberId];
            };
            return {
                subscribeTo: function () {
                    var path = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        path[_i] = arguments[_i];
                    }
                    if (subscriberId in _this.subscriptions) {
                        _this.subscriptions[subscriberId].paths.push(path);
                    }
                },
                cancel: cancel
            };
        };
    }
    return DefaultDeepStorage;
}());
exports.DefaultDeepStorage = DefaultDeepStorage;
var NestedDeepStorage = (function () {
    function NestedDeepStorage(path, root) {
        var _this = this;
        this.path = path;
        this.root = root;
        this.setIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return function (newValue) {
                return (_a = _this.root).setIn.apply(_a, _this.path.concat(path))(newValue);
                var _a;
            };
        };
        this.update = function (callback) {
            return (_a = _this.root).updateIn.apply(_a, _this.path)(callback);
            var _a;
        };
        this.updateIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return function (callback) {
                return (_a = _this.root).updateIn.apply(_a, _this.path.concat(path))(callback);
                var _a;
            };
        };
        this.updateProperty = function (key, callback) {
            return (_a = _this.root).updateIn.apply(_a, _this.path.concat(key))(callback);
            var _a;
        };
        this.stateIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return (_a = _this.root).stateIn.apply(_a, _this.path.concat(path));
            var _a;
        };
        this.deep = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return (_a = _this.root).deep.apply(_a, _this.path.concat(path));
            var _a;
        };
        this.subscription = function (callback) {
            var rootSubscription = _this.root.subscription(function (path, newState, oldState) {
                callback(path.slice(path.length - _this.path.length, path.length), newState, oldState);
            });
            return {
                subscribeTo: function () {
                    var path = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        path[_i] = arguments[_i];
                    }
                    return rootSubscription.subscribeTo.apply(rootSubscription, _this.path.concat(path));
                },
                cancel: rootSubscription.cancel
            };
        };
    }
    Object.defineProperty(NestedDeepStorage.prototype, "state", {
        get: function () {
            return (_a = this.root).stateIn.apply(_a, this.path);
            var _a;
        },
        enumerable: true,
        configurable: true
    });
    return NestedDeepStorage;
}());
exports.NestedDeepStorage = NestedDeepStorage;
function numberOrString(value) {
    var parsed = parseInt(value);
    return parsed.toString() === value ? parsed : value;
}
function parsePath(path) {
    if (path instanceof Array) {
        return path;
    }
    else if (typeof path === 'number') {
        return [path];
    }
    else if (typeof path === 'string') {
        return path.split('/').map(numberOrString);
    }
}
exports.parsePath = parsePath;
function parsePaths(paths) {
    var result = {};
    for (var key in paths) {
        result[key] = parsePath(paths[key]);
    }
    return result;
}
exports.parsePaths = parsePaths;
//# sourceMappingURL=index.js.map