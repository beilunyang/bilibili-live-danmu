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
Object.defineProperty(exports, "__esModule", { value: true });
var stream = require("stream");
exports.packet = function (packetLength, magic, version, action, param) {
    var buf = Buffer.allocUnsafe(16);
    buf.writeUInt32BE(packetLength, 0);
    buf.writeUInt16BE(magic, 4);
    buf.writeUInt16BE(version, 6);
    buf.writeUInt32BE(action, 8);
    buf.writeUInt32BE(param, 12);
    return buf;
};
exports.filterMsg = function (message) {
    var msg = JSON.parse(message);
    var cmd = msg.cmd;
    var data = {};
    switch (cmd) {
        case "DANMU_MSG":
            data = {
                cmd: cmd,
                content: msg.info[1],
                isAdmin: msg.info[2][2] === 1,
                isVip: msg.info[2][3] === 1,
                uname: msg.info[2][1],
            };
            break;
        case "SEND_GIFT":
            data = {
                cmd: cmd,
                giftName: msg.data.giftName,
                giftNum: msg.data.num,
                uname: msg.data.uname,
            };
            break;
        case "WELCOME":
            data = {
                cmd: cmd,
                uid: msg.data.uid,
                uname: msg.data.uname,
            };
            break;
        default:
            data = {
                cmd: cmd,
            };
    }
    return data;
};
exports.log = function (msg) {
    if (process.env.NODE_ENV !== "production") {
        return console.log(msg);
    }
};
exports.error = function (err) {
    if (process.env.NODE_ENV !== "production") {
        return console.error(err);
    }
};
var DanmuTransform = (function (_super) {
    __extends(DanmuTransform, _super);
    function DanmuTransform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cache = null;
        return _this;
    }
    DanmuTransform.prototype._transform = function (chunk, encoding, callback) {
        if (!this.cache) {
            this.splitPacket(chunk, callback);
        }
        else {
            var buf = Buffer.concat([this.cache, chunk]);
            this.splitPacket(buf, callback);
        }
    };
    DanmuTransform.prototype.splitPacket = function (chunk, callback) {
        var packetLen = chunk.readInt32BE(0);
        var bufLen = chunk.byteLength;
        if (bufLen < packetLen) {
            this.cache = chunk;
        }
        else {
            this.cache = null;
            var startIdx = 0;
            while (startIdx < bufLen) {
                if (startIdx + packetLen <= bufLen) {
                    var buf = chunk.slice(startIdx, startIdx + packetLen);
                    var msgType = buf.readInt32BE(8);
                    var msgData = null;
                    switch (msgType) {
                        case 3:
                            msgType = "在线人数";
                            msgData = buf.readInt32BE(16);
                            break;
                        case 5:
                            msgType = "弹幕消息";
                            msgData = buf.slice(16).toString();
                            break;
                        default:
                            msgType = "未知消息";
                            msgData = null;
                    }
                    var isDanmuMsg = msgType === "弹幕消息";
                    var json = JSON.stringify({
                        data: isDanmuMsg ? exports.filterMsg(msgData) : msgData,
                        rawData: isDanmuMsg ? JSON.parse(msgData) : msgData,
                        type: msgType,
                    });
                    this.push(json);
                    startIdx += packetLen;
                    if (startIdx < bufLen) {
                        packetLen = chunk.readInt32BE(startIdx);
                    }
                }
                else {
                    this.cache = chunk.slice(startIdx);
                    break;
                }
            }
            callback();
        }
    };
    return DanmuTransform;
}(stream.Transform));
exports.DanmuTransform = DanmuTransform;
exports.default = {
    DanmuTransform: DanmuTransform,
    log: exports.log,
    packet: exports.packet,
};
//# sourceMappingURL=util.js.map