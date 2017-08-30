/*
 * @Author: beilunyang
 * @Date: 2017-09-27 11:57:28
 * @Last Modified by: beilunyang
 * @Last Modified time: 2017-09-27 15:59:17
 */
import * as stream from "stream";

/**
 * 封装数据包
 * http://www.lyyyuna.com/2016/03/14/bilibili-danmu01/
 *
 * @param packetLength
 * @param magic
 * @param version
 * @param action
 * @param param
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

/**
 * 过滤数据字段
 * @param message
 */
export const filterMsg = (message: string) => {
  const msg = JSON.parse(message);
  const cmd = msg.cmd;
  let data = {};
  switch (cmd) {
    case "DANMU_MSG":
      data = {
        cmd,
        content: msg.info[1],
        isAdmin: msg.info[2][2] === 1,
        isVip: msg.info[2][3] === 1,
        uname: msg.info[2][1],
      };
      break;
    case "SEND_GIFT":
      data = {
        cmd,
        giftName: msg.data.giftName,
        giftNum: msg.data.num,
        uname: msg.data.uname,
      };
      break;
    case "WELCOME":
      data = {
        cmd,
        uid: msg.data.uid,
        uname: msg.data.uname,
      };
      break;
    default:
      data = {
        cmd,
      };
  }
  return data;
};

/* tslint:disable:no-console */

/**
 * 打印一般日志
 * @param msg
 */
export const log = (msg: any) => {
  if (process.env.NODE_ENV !== "production") {
    return console.log(msg);
  }
};

/**
 * 打印错误日志
 * @param err
 */
export const error = (err: any) => {
  if (process.env.NODE_ENV !== "production") {
    return console.error(err);
  }
};
/* tslint:enable:no-console */

/**
 * 直播弹幕包转换流, 用于转换数据流
 *
 * @export
 * @class DanmuTransform
 * @extends {stream.Transform}
 */
export class DanmuTransform extends stream.Transform {
  private cache: Buffer | null = null;

  /**
   * override _transform方法
   *
   * @param {Buffer} chunk
   * @param {string} encoding
   * @param {() => void} callback
   * @memberof DanmuTransform
   */
  public _transform(chunk: Buffer, encoding: string, callback: () => void) {
    if (!this.cache) {
      this.splitPacket(chunk, callback);
    } else {
      const buf = Buffer.concat([this.cache, chunk]);
      this.splitPacket(buf, callback);
    }
  }

  /**
   * 根据包长切割数据包
   *
   * @private
   * @param {Buffer} chunk
   * @param {() => void} callback 回调函数,当push数据后必须调用
   * @memberof DanmuTransform
   */
  private splitPacket(chunk: Buffer, callback: () => void) {
    let packetLen = chunk.readInt32BE(0);
    const bufLen = chunk.byteLength;
    if (bufLen < packetLen) {
      this.cache = chunk;
    } else {
      this.cache = null;
      let startIdx = 0;
      while (startIdx < bufLen) {
        if (startIdx + packetLen <= bufLen) {
          const buf = chunk.slice(startIdx, startIdx + packetLen);
          let msgType: number | string = buf.readInt32BE(8);
          let msgData = null;
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
          const isDanmuMsg = msgType === "弹幕消息";
          const json = JSON.stringify({
            data: isDanmuMsg ? filterMsg(msgData as string) : msgData,
            rawData: isDanmuMsg ? JSON.parse(msgData as string) : msgData,
            type: msgType,
          });
          this.push(json);
          startIdx += packetLen;
          if (startIdx < bufLen) {
            packetLen = chunk.readInt32BE(startIdx);
          }
        } else {
          this.cache = chunk.slice(startIdx);
          break;
        }
      }
      callback();
    }
  }

}

export default {
  DanmuTransform,
  log,
  packet,
};
