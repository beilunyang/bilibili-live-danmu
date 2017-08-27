/*
 * @Author: beilunyang
 * @Date: 2017-08-10 17:45:16
 * @Last Modified by: beilunyang
 * @Last Modified time: 2017-08-27 20:10:46
 */
import * as process from "process";
import Danmu from "./danmu";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (str) => {
  const roomId = Number(str);
  if (!isNaN(roomId)) {
    process.stdin.removeAllListeners("data");
    const danmu = new Danmu(roomId);
    danmu.connectServer();
  } else {
    process.stdout.write("please enter an room id: ");
  }
});

process.stdout.write("please enter an room id: ");
