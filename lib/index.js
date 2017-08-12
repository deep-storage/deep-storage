"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Is one array a prefix on another e.g.
 *
 * [] is a prefix of any array
 * ['asdf'] is a prefix of ['asdf', ...]
 *
 * etc.
 *
 * @param stateChangePath the full array to check, must not be null
 * @param subscriptionPath the partial array to check
 */
function isPathMatch(stateChangePath, subscriptionPath) {
    for (var i = 0; i < Math.min(subscriptionPath.length, stateChangePath.length); i++) {
        if (stateChangePath[i] !== subscriptionPath[i])
            return false;
    }
    return true;
}
exports.isPathMatch = isPathMatch;
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
                return _this.updateIn.apply(_this, path)(function () { return newValue; });
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
            return function (callback) { return __awaiter(_this, void 0, void 0, function () {
                var oldState, newState, stateChangePath, subscriberId, subscriber;
                return __generator(this, function (_a) {
                    oldState = this.stateIn.apply(this, path);
                    newState = callback(oldState);
                    if (path.length === 0) {
                        this.state = newState;
                    }
                    else {
                        // todo: this will no doubt cause some bugs... better to replace all the 
                        // parent objects too so that reference equality checks work in react
                        this.stateIn.apply(this, path.slice(0, path.length - 1))[path[path.length - 1]] = newState;
                    }
                    stateChangePath = path;
                    for (subscriberId in this.subscriptions) {
                        subscriber = this.subscriptions[subscriberId];
                        // check to see if we have any matches
                        if (subscriber.paths.some(function (subscriberPath) { return isPathMatch(stateChangePath, subscriberPath); })) {
                            subscriber.callback(stateChangePath, newState, oldState);
                        }
                    }
                    return [2 /*return*/, newState];
                });
            }); };
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
        this.root = function () { return _this; };
        this.path = [];
    }
    Object.defineProperty(DefaultDeepStorage.prototype, "props", {
        get: function () {
            var result = {};
            var state = this.state;
            for (var key in state) {
                result[key] = this.deep(key);
            }
            return result;
        },
        enumerable: true,
        configurable: true
    });
    return DefaultDeepStorage;
}());
exports.DefaultDeepStorage = DefaultDeepStorage;
var NestedDeepStorage = (function () {
    function NestedDeepStorage(path, rootStorage) {
        var _this = this;
        this.path = path;
        this.rootStorage = rootStorage;
        this.setIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return function (newValue) {
                return (_a = _this.rootStorage).setIn.apply(_a, _this.path.concat(path))(newValue);
                var _a;
            };
        };
        this.update = function (callback) {
            return (_a = _this.rootStorage).updateIn.apply(_a, _this.path)(callback);
            var _a;
        };
        this.updateIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return function (callback) {
                return (_a = _this.rootStorage).updateIn.apply(_a, _this.path.concat(path))(callback);
                var _a;
            };
        };
        this.updateProperty = function (key, callback) {
            return (_a = _this.rootStorage).updateIn.apply(_a, _this.path.concat(key))(callback);
            var _a;
        };
        this.stateIn = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return (_a = _this.rootStorage).stateIn.apply(_a, _this.path.concat(path));
            var _a;
        };
        this.deep = function () {
            var path = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                path[_i] = arguments[_i];
            }
            return (_a = _this.rootStorage).deep.apply(_a, _this.path.concat(path));
            var _a;
        };
        this.subscription = function (callback) {
            var rootSubscription = _this.rootStorage.subscription(function (path, newState, oldState) {
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
        this.root = function () { return _this.rootStorage; };
    }
    Object.defineProperty(NestedDeepStorage.prototype, "state", {
        get: function () {
            return (_a = this.rootStorage).stateIn.apply(_a, this.path);
            var _a;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NestedDeepStorage.prototype, "props", {
        get: function () {
            var result = {};
            var state = this.state;
            for (var key in state) {
                result[key] = this.deep(key);
            }
            return result;
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
exports.deepStorage = function (s) { return new DefaultDeepStorage(s); };
exports.default = exports.deepStorage;
//# sourceMappingURL=index.js.map