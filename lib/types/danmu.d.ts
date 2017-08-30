/// <reference types="node" />
import * as stream from "stream";
export declare class Danmu extends stream.PassThrough {
    private CIDInfoUrl;
    private roomId;
    private chatPort;
    private protocolVersion;
    private client;
    private chatHost;
    private uid;
    private http;
    private okFlag;
    private danmuTransform;
    constructor(roomId: number);
    connectServer(): Promise<void>;
    joinChannel(roomId: number): Promise<boolean>;
    heartBeatLoop(): void;
    sendSocketData(packetLength: number, magic: number, version: number, action: number, param: number, body: any): Promise<{}>;
}
export default Danmu;
