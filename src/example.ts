/*
 * @Author: beilunyang
 * @Date: 2017-08-10 17:45:16
 * @Last Modified by: beilunyang
 * @Last Modified time: 2017-08-27 20:10:46
 */
/* tslint:disable:no-console */
import Danmu from "./danmu";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (str) => {
  const roomId = Number(str);
  if (!isNaN(roomId)) {
    process.stdin.removeAllListeners("data");
    const danmu = new Danmu(roomId);
    danmu.connectServer();
    danmu.setEncoding("utf8");
    danmu.on("data", (json: string) => {
      const msg = JSON.parse(json);
      if (msg.type === "在线人数") {
        return console.log(`在线人数: ${msg.data}`);
      }
      const data = msg.data;
      switch (data.cmd) {
        case "DANMU_MSG":
          const vip = data.isVip ? "会员" : "";
          const admin = data.isAdmin ? "管理员" : "";
          console.log(`\x1b[41m${vip}\x1b[42m${admin}\x1b[0m${data.uname}发送弹幕: ${data.content}`);
          break;
        case "SEND_GIFT":
          console.log(`\x1b[31m${data.uname}送出${data.giftNum}个${data.giftName}\x1b[37m`);
          break;
        case "WELCOME":
          console.log(`\x1b[32m欢迎${data.uname}进入房间\x1b[37m`);
          break;
        default:
          console.log(`\x1b[36m直播${data.cmd}中\x1b[37m`);
      }
    });
  } else {
    process.stdout.write("please enter an room id: ");
  }
});

process.stdout.write("please enter an room id: ");
