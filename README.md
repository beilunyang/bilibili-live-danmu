# bilibili-live-danmu
获取bilibili直播弹幕

[![npm](https://img.shields.io/npm/l/express.svg)]()

[![NPM](https://nodei.co/npm/bilibili-live-danmu.png)](https://nodei.co/npm/bilibili-live-danmu/)



## 安装
```bash
npm install --save bilibili-live-danmu
```

## 使用方法
```javascript
import Danmu from "bilibili-live-danmu";

const danmu = new Danmu("roomID");
danmu.connectServer();
danmu.setEncoding("utf8");
danmu.on("data", (json) => {
  const msg = JSON.parse(json);
  // ...
});
// 或者 danmu.pipe("writable stream");
// Danmu类继承自stream.PassThrough,实现了流接口,既可读又可写
// 具体使用方法可参考 src/example.ts
```

## 数据结构
```javascript
  // JSON.parse后的数据如下:
  {
    // 消息类型
    type: "在线人数" || "弹幕消息" || "未知消息",
    // 过滤后的数据
    data: [在线人数] || null || {
      cmd: "DANMU_MSG",
      content: [弹幕主体],
      isAdmin: true || false,
      isVip: true || false,
      uname: [用户名]
    } || {
      cmd: "SEND_GIFT",
      giftName: [礼物名],
      giftNum: [礼物数量],
      uname: [用户名],
    } || {
      cmd: "WELCOME",
      uid: [用户ID],
      uname: [用户名],
    } || {
      cmd: [其它弹幕类型],
    },
    // 原始数据
    rawData: [不展开了,有需要可以自己打印查看],
  }
```

## 参考&感谢
http://www.lyyyuna.com/2016/03/14/bilibili-danmu01/

https://github.com/lyyyuna/bilibili_danmu

## 开源许可
MIT
