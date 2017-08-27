/// <reference types="node" />
export declare const packet: (packetLength: number, magic: number, version: number, action: number, param: number) => Buffer;
export interface IMessage {
    type: string;
    data: string[] | number | null;
}
export declare const unpacket: (packet: Buffer) => IMessage;
export declare const log: (msg: any) => void;
export declare const error: (err: any) => void;
declare const _default: {
    log: (msg: any) => void;
    packet: (packetLength: number, magic: number, version: number, action: number, param: number) => Buffer;
    unpacket: (packet: Buffer) => IMessage;
};
export default _default;
