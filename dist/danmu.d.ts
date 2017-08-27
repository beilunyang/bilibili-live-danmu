export default class Danmu {
    private CIDInfoUrl;
    private roomId;
    private chatPort;
    private protocolVersion;
    private connected;
    private client;
    private chatHost;
    private uid;
    private http;
    private okFlag;
    private cache;
    constructor(roomId: number);
    connectServer(): Promise<void>;
    joinChannel(roomId: number): Promise<boolean>;
    heartBeatLoop(): void;
    sendSocketData(packetLength: number, magic: number, version: number, action: number, param: number, body: any): Promise<{}>;
}
