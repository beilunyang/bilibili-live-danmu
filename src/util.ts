/*
 * @Author: beilunyang
 * @Date: 2017-08-10 17:44:38
 * @Last Modified by: beilunyang
 * @Last Modified time: 2017-08-27 20:54:33
 */
export const packet = (packetLength: number, magic: number, version: number, action: number, param: number) => {
  const buf = Buffer.allocUnsafe(16);
  buf.writeUInt32BE(packetLength, 0);
  buf.writeUInt16BE(magic, 4);
  buf.writeUInt16BE(version, 6);
  buf.writeUInt32BE(action, 8);
  buf.writeUInt32BE(param, 12);
  return buf;
};

export interface IMessage {
  type: string;
  data: string[] | number | null;
}

export const unpacket = (packet: Buffer): IMessage => {
  const msg: IMessage = {
    data: null,
    type: "",
  };
  const msgType = packet.readInt32BE(8);
  switch (msgType) {
    case 5:
      msg.type = "弹幕消息";
      const data = [];
      const bufLen = packet.byteLength;
      let startIdx = 0;
      let packetLen = packet.readInt32BE(0);
      // 一个packet中可能有多条消息
      while (startIdx < bufLen) {
        const buf = packet.slice(startIdx + 16, startIdx + packetLen);
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

/* tslint:disable:no-console */
export const log = (msg: any) => {
  if (process.env.NODE_ENV !== "production") {
    return console.log(msg);
  }
};

export const error = (err: any) => {
  if (process.env.NODE_ENV !== "production") {
    return console.error(err);
  }
};

export default {
  log,
  packet,
  unpacket,
};
