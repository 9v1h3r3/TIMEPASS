const fs = require("fs");
const path = require("path");
const { log } = require("../utils/logger");

const rkbFile = path.join(__dirname, "..", "rkb_users.json");
const replyFile = path.join(__dirname, "..", "reply.txt");

function loadRkb() { 
  try { return JSON.parse(fs.readFileSync(rkbFile,"utf-8")); } 
  catch { return []; } 
}

function getRandomReply() {
  try {
    const lines = fs.readFileSync(replyFile,"utf-8").split("\n").filter(l=>l.trim());
    if(!lines.length) return null;
    return lines[Math.floor(Math.random()*lines.length)];
  } catch { return null; }
}

module.exports = {
  name: "autoreply",
  run: async () => {},

  onEvent: async ({ api, event }) => {
    if (event.type !== "message" || !event.body) return;

    log(`Message received from UID: ${event.senderID} | Msg: ${event.body}`);

    const list = loadRkb();
    if (!list.includes(event.senderID)) {
      log(`UID ${event.senderID} not in RKB list, skipping.`);
      return;
    }

    const reply = getRandomReply();
    if (!reply) {
      log("reply.txt empty or no valid line found.");
      return;
    }

    log(`Sending reply to UID ${event.senderID}: ${reply}`);

    setTimeout(() => {
      api.sendMessage(reply, event.threadID, event.messageID);
    }, 2000);
  }
};
