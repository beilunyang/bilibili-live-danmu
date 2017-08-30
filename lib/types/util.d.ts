/// <reference types="node" />
import * as stream from "stream";
export declare const packet: (packetLength: number, magic: number, version: number, action: number, param: number) => Buffer;
export declare const filterMsg: (message: string) => {};
export declare const log: (msg: any) => void;
export declare const error: (err: any) => void;
export declare class DanmuTransform extends stream.Transform {
    private cache;
    _transform(chunk: Buffer, encoding: string, callback: () => void): void;
    private splitPacket(chunk, callback);
}
declare const _default: {
    DanmuTransform: typeof DanmuTransform;
    log: (msg: any) => void;
    packet: (packetLength: number, magic: number, version: number, action: number, param: number) => Buffer;
};
export default _default;
