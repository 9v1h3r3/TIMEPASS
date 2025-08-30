const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../spamdata.json");

function readData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "antiemoji",
  run: async function ({ api, event, args }) {
    if (!event.isGroup) return api.sendMessage("⚠️ Group only.", event.threadID);

    const action = args[0]; // on | off
    let data = readData();
    if (!data[event.threadID]) data[event.threadID] = { enabled: false, users: {} };

    if (action === "off") {
      data[event.threadID].enabled = false;
      writeData(data);
      return api.sendMessage("🚫 Anti-emoji spam disabled.", event.threadID);
    }

    data[event.threadID].enabled = true;
    writeData(data);
    return api.sendMessage("✅ Anti-emoji spam enabled.", event.threadID);
  },

  // === Listener for spam detection ===
  onEvent: async function ({ api, event }) {
    let data = readData();
    if (!data[event.threadID]?.enabled) return;

    // सिर्फ text messages check करेंगे
    if (event.type === "message" && event.body) {
      const emojiRegex = /\p{Emoji}/gu; // Unicode emoji regex
      const emojis = event.body.match(emojiRegex) || [];

      if (emojis.length > 0) {
        if (!data[event.threadID].users[event.senderID]) {
          data[event.threadID].users[event.senderID] = { count: 0, last: Date.now() };
        }

        let user = data[event.threadID].users[event.senderID];
        let now = Date.now();

        // 10 sec window
        if (now - user.last < 10000) {
          user.count += emojis.length;
        } else {
          user.count = emojis.length;
          user.last = now;
        }

        writeData(data);

        // अगर किसी ने 10 sec में 20+ emoji भेजे
        if (user.count >= 20) {
          try {
            await api.removeUserFromGroup(event.senderID, event.threadID);
            api.sendMessage(
              `🚫 User removed for emoji spam (20+ in 10s)!`,
              event.threadID
            );
          } catch (e) {
            api.sendMessage(
              `⚠️ Spam detected but can't kick (not admin).`,
              event.threadID
            );
          }
          user.count = 0;
          writeData(data);
        }
      }
    }
  }
};
