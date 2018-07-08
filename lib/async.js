"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./index");
var AsyncStatus;
(function (AsyncStatus) {
    AsyncStatus[AsyncStatus["Created"] = 0] = "Created";
    AsyncStatus[AsyncStatus["Running"] = 1] = "Running";
    AsyncStatus[AsyncStatus["Failed"] = 2] = "Failed";
    AsyncStatus[AsyncStatus["Succeeded"] = 3] = "Succeeded";
})(AsyncStatus = exports.AsyncStatus || (exports.AsyncStatus = {}));
var AlreadyRunningError = /** @class */ (function (_super) {
    __extends(AlreadyRunningError, _super);
    function AlreadyRunningError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AlreadyRunningError;
}(Error));
exports.AlreadyRunningError = AlreadyRunningError;
var DefaultDeepAsync = /** @class */ (function () {
    function DefaultDeepAsync(storage, process) {
        var _this = this;
        this.storage = storage;
        this.process = process;
        this.run = function () { return __awaiter(_this, void 0, void 0, function () {
            var data_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // todo: probably want to queue this
                        if (this.status === AsyncStatus.Running)
                            throw new AlreadyRunningError();
                        return [4 /*yield*/, this.storage.update(function (state) { return (__assign({}, state, { status: AsyncStatus.Running, data: undefined, error: undefined })); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 7]);
                        return [4 /*yield*/, this.process()];
                    case 3:
                        data_1 = _a.sent();
                        return [4 /*yield*/, this.storage.update(function (state) { return (__assign({}, state, { status: AsyncStatus.Succeeded, data: data_1, error: undefined })); })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.storage.state];
                    case 5:
                        error_1 = _a.sent();
                        return [4 /*yield*/, this.storage.update(function (state) { return (__assign({}, state, { status: AsyncStatus.Failed, error: error_1, data: undefined })); })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, this.storage.state];
                    case 7: return [2 /*return*/];
                }
            });
        }); };
        this.update = function (updater) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.storage.update(function (state) {
                            return (__assign({}, state, { status: AsyncStatus.Succeeded, data: updater(state.data), error: undefined }));
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.storage.state];
                }
            });
        }); };
    }
    Object.defineProperty(DefaultDeepAsync.prototype, "status", {
        get: function () { return this.storage.state.status; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultDeepAsync.prototype, "running", {
        get: function () { return this.storage.state.status === AsyncStatus.Running; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultDeepAsync.prototype, "started", {
        get: function () { return this.storage.state.status !== AsyncStatus.Created; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultDeepAsync.prototype, "succeeded", {
        get: function () { return this.storage.state.status === AsyncStatus.Succeeded; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultDeepAsync.prototype, "failed", {
        get: function () { return this.storage.state.status === AsyncStatus.Failed; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultDeepAsync.prototype, "completed", {
        get: function () { return this.storage.state.status === AsyncStatus.Failed || this.storage.state.status == AsyncStatus.Succeeded; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefaultDeepAsync.prototype, "data", {
        get: function () { return this.storage.state.data; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(DefaultDeepAsync.prototype, "error", {
        get: function () { return this.storage.state.error; },
        enumerable: true,
        configurable: true
    });
    ;
    return DefaultDeepAsync;
}());
exports.DefaultDeepAsync = DefaultDeepAsync;
exports.deepAsync = function (process) { return __awaiter(_this, void 0, void 0, function () {
    var storage;
    return __generator(this, function (_a) {
        storage = index_1.deepStorage({
            status: AsyncStatus.Created
        });
        return [2 /*return*/, new DefaultDeepAsync(storage, process)];
    });
}); };
