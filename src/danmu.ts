/*
 * @Author: beilunyang
 * @Date: 2017-08-10 10:20:25
 * @Last Modified by: beilunyang
 * @Last Modified time: 2017-09-27 17:41:53
 */

import axios from "axios";
import * as net from "net";
import * as stream from "stream";
import * as helper from "./util";

/**
 * 弹幕类，负责加入房间和解析弹幕
 *
 * @export
 * @class Danmu
 */
export class Danmu extends stream.PassThrough {
  private CIDInfoUrl: string = "http://live.bilibili.com/api/player?id=cid:";
  private roomId: number;
  private chatPort: number = 788;
  private protocolVersion: number = 1;
  private client: net.Socket;
  private chatHost: string = "livecmt-1.bilibili.com";
  private uid: number = Math.floor(100000000000000.0 + 200000000000000.0 * Math.random());
  private http = axios.create({
    timeout: 2000,
  });
  private okFlag: Buffer = Buffer.from("00000010001000010000000800000001", "hex");
  private danmuTransform = new helper.DanmuTransform();

  /**
   * Creates an instance of Danmu.
   * @param {number} roomId
   * @memberof Danmu
   */
  constructor(roomId: number) {
    super();
    this.roomId = roomId;
  }

  /**
   * 连接直播服务器
   *
   * @returns {Promise<void>}
   * @memberof Danmu
   */
  public async connectServer(): Promise<void> {
    helper.log("正在解析真实房间ID和服务器地址");
    const res = await this.http.get(`http://live.bilibili.com/${this.roomId}`);
    const html = res.data;
    this.roomId = html.match(/var\sROOMID\s=\s(\d+?);/)[1];
    helper.log(`真实房间ID是${this.roomId}`);
    const result = await this.http.get(`${this.CIDInfoUrl}${this.roomId}`);
    const xml = result.data;
    this.chatHost = xml.match(/<server>(\S+?)<\/server>/)[1];
    helper.log(`服务器地址是${this.chatHost}`);
    this.client = net.createConnection(this.chatPort, this.chatHost);
    this.client.on("connect", async () => {
      if (await this.joinChannel(this.roomId)) {
        helper.log("正在进入房间");
      }
    });

    this.client.once("data", (data: Buffer): void => {
      if (data.equals(this.okFlag)) {
        this.heartBeatLoop();
        helper.log("进入房间成功");
        helper.log("开始获取弹幕");
        this.client.pipe(this.danmuTransform).pipe(this);
      } else {
        helper.log("进入房间失败");
        this.client.end();
      }
    });

    this.client.on("end", () => {
      helper.log("结束连接");
      process.exit();
    });

  }

  /**
   * 加入房间(频道)
   *
   * @param {number} roomId
   * @returns {Promise<boolean>}
   * @memberof Danmu
   */
  public async joinChannel(roomId: number): Promise<boolean> {
    const body = `{"roomid":${roomId},"uid":${this.uid}}`;
    try {
      await this.sendSocketData(0, 16, this.protocolVersion, 7, 1, body);
      return true;
    } catch (e) {
      helper.error(`send socket data fail: ${e.message}`);
      return false;
    }
  }

  /**
   * 每隔30s发一次心跳包，维持tcp长连接
   *
   * @memberof Danmu
   */
  public heartBeatLoop(): void {
    setInterval(() => {
      this.sendSocketData(0, 16, this.protocolVersion, 2, 1, "");
    }, 30 * 1000);
  }

  /**
   * 发送tcp数据包
   *
   * @param {number} packetLength
   * @param {number} magic
   * @param {number} version
   * @param {number} action
   * @param {number} param
   * @param {*} body
   * @returns {Promise<{}>}
   * @memberof Danmu
   */
  public sendSocketData(packetLength: number, magic: number, version: number, action: number, param: number, body: any): Promise<{}> {
    const bytearr = Buffer.from(body);
    if (packetLength === 0) {
      packetLength = bytearr.byteLength + 16;
    }
    let sendBytes = helper.packet(packetLength, magic, version, action, param);
    if (bytearr.byteLength > 0) {
      sendBytes = Buffer.concat([sendBytes, bytearr]);
    }
    return new Promise((resolve) => {
      this.client.write(sendBytes, () => {
        resolve();
      });
    });
  }
}

export default Danmu;
