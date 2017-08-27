"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packet = function (packetLength, magic, version, action, param) {
    var buf = Buffer.allocUnsafe(16);
    buf.writeUInt32BE(packetLength, 0);
    buf.writeUInt16BE(magic, 4);
    buf.writeUInt16BE(version, 6);
    buf.writeUInt32BE(action, 8);
    buf.writeUInt32BE(param, 12);
    return buf;
};
exports.unpacket = function (packet) {
    var msg = {
        data: null,
        type: "",
    };
    var msgType = packet.readInt32BE(8);
    switch (msgType) {
        case 5:
            msg.type = "弹幕消息";
            var data = [];
            var bufLen = packet.byteLength;
            var startIdx = 0;
            var packetLen = packet.readInt32BE(0);
            while (startIdx < bufLen) {
                var buf = packet.slice(startIdx + 16, startIdx + packetLen);
                data.push(JSON.parse(buf.toString()));
                startIdx += packetLen;
                if (startIdx < bufLen) {
                    packetLen = packet.readInt32BE(startIdx);
                }
            }
            msg.data = data;
            break;
        case 3:
            msg.type = "在线人数";
            msg.data = packet.readInt32BE(16);
            break;
        default:
            msg.type = "未知消息";
    }
    return msg;
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
exports.default = {
    log: exports.log,
    packet: exports.packet,
    unpacket: exports.unpacket,
};
//# sourceMappingURL=util.js.map