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
var axios_1 = require("axios");
var net = require("net");
var stream = require("stream");
var helper = require("./util");
var Danmu = (function (_super) {
    __extends(Danmu, _super);
    function Danmu(roomId) {
        var _this = _super.call(this) || this;
        _this.CIDInfoUrl = "http://live.bilibili.com/api/player?id=cid:";
        _this.chatPort = 788;
        _this.protocolVersion = 1;
        _this.chatHost = "livecmt-1.bilibili.com";
        _this.uid = Math.floor(100000000000000.0 + 200000000000000.0 * Math.random());
        _this.http = axios_1.default.create({
            timeout: 2000,
        });
        _this.okFlag = Buffer.from("00000010001000010000000800000001", "hex");
        _this.danmuTransform = new helper.DanmuTransform();
        _this.roomId = roomId;
        return _this;
    }
    Danmu.prototype.connectServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var res, html, result, xml;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        helper.log("正在解析真实房间ID和服务器地址");
                        return [4, this.http.get("http://live.bilibili.com/" + this.roomId)];
                    case 1:
                        res = _a.sent();
                        html = res.data;
                        this.roomId = html.match(/var\sROOMID\s=\s(\d+?);/)[1];
                        helper.log("\u771F\u5B9E\u623F\u95F4ID\u662F" + this.roomId);
                        return [4, this.http.get("" + this.CIDInfoUrl + this.roomId)];
                    case 2:
                        result = _a.sent();
                        xml = result.data;
                        this.chatHost = xml.match(/<server>(\S+?)<\/server>/)[1];
                        helper.log("\u670D\u52A1\u5668\u5730\u5740\u662F" + this.chatHost);
                        this.client = net.createConnection(this.chatPort, this.chatHost);
                        this.client.on("connect", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, this.joinChannel(this.roomId)];
                                    case 1:
                                        if (_a.sent()) {
                                            helper.log("正在进入房间");
                                        }
                                        return [2];
                                }
                            });
                        }); });
                        this.client.once("data", function (data) {
                            if (data.equals(_this.okFlag)) {
                                _this.heartBeatLoop();
                                helper.log("进入房间成功");
                                helper.log("开始获取弹幕");
                                _this.client.pipe(_this.danmuTransform).pipe(_this);
                            }
                            else {
                                helper.log("进入房间失败");
                                _this.client.end();
                            }
                        });
                        this.client.on("end", function () {
                            helper.log("结束连接");
                            process.exit();
                        });
                        return [2];
                }
            });
        });
    };
    Danmu.prototype.joinChannel = function (roomId) {
        return __awaiter(this, void 0, void 0, function () {
            var body, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        body = "{\"roomid\":" + roomId + ",\"uid\":" + this.uid + "}";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4, this.sendSocketData(0, 16, this.protocolVersion, 7, 1, body)];
                    case 2:
                        _a.sent();
                        return [2, true];
                    case 3:
                        e_1 = _a.sent();
                        helper.error("send socket data fail: " + e_1.message);
                        return [2, false];
                    case 4: return [2];
                }
            });
        });
    };
    Danmu.prototype.heartBeatLoop = function () {
        var _this = this;
        setInterval(function () {
            _this.sendSocketData(0, 16, _this.protocolVersion, 2, 1, "");
        }, 30 * 1000);
    };
    Danmu.prototype.sendSocketData = function (packetLength, magic, version, action, param, body) {
        var _this = this;
        var bytearr = Buffer.from(body);
        if (packetLength === 0) {
            packetLength = bytearr.byteLength + 16;
        }
        var sendBytes = helper.packet(packetLength, magic, version, action, param);
        if (bytearr.byteLength > 0) {
            sendBytes = Buffer.concat([sendBytes, bytearr]);
        }
        return new Promise(function (resolve) {
            _this.client.write(sendBytes, function () {
                resolve();
            });
        });
    };
    return Danmu;
}(stream.PassThrough));
exports.Danmu = Danmu;
exports.default = Danmu;
//# sourceMappingURL=danmu.js.map