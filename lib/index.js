"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPrefix(full, partial) {
    if (partial.length > full.length)
        return false;
    for (var i = 0; i < partial.length; i++) {
        if (partial[i] !== full[i])
            return false;
    }
    return true;
}
var DeepStorage = (function () {
    function DeepStorage(state) {
        var path = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            path[_i - 1] = arguments[_i];
        }
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
                var fullPath = _this.path.concat(path);
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
            for (var _a = 0, _b = _this.path.concat(path); _a < _b.length; _a++) {
                var p = _b[_a];
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
            return new (DeepStorage.bind.apply(DeepStorage, [void 0, _this.stateIn.apply(_this, path)].concat(_this.path)))();
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
        this.path = path;
    }
    return DeepStorage;
}());
exports.DeepStorage = DeepStorage;
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