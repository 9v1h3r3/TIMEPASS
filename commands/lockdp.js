const fs = require("fs");
const path = require("path");
const axios = require("axios");

const DATA_FILE = path.join(__dirname, "../lockdata.json");

function readData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "lock",
  run: async function ({ api, event, args }) {
    if (!event.isGroup) return api.sendMessage("⚠️ Group chat only.", event.threadID);

    const type = args[0];
    const action = args[1]; // "on" / "off"

    if (!type || type !== "dp") return api.sendMessage("Usage: .lock dp [on|off]", event.threadID);

    let data = readData();
    if (!data[event.threadID]) data[event.threadID] = {};

    // === Turn OFF Lock ===
    if (action === "off") {
      if (data[event.threadID].dp) {
        delete data[event.threadID].dp;
        writeData(data);
        return api.sendMessage("🔓 Group DP lock disabled.", event.threadID);
      } else {
        return api.sendMessage("⚠️ No DP lock was active.", event.threadID);
      }
    }

    // === Turn ON Lock ===
    if (!action || action === "on") {
      try {
        const info = await api.getThreadInfo(event.threadID);
        if (info.imageSrc) {
          const dpPath = path.join(__dirname, `../dp_${event.threadID}.jpg`);
          const res = await axios.get(info.imageSrc, { responseType: "arraybuffer" });
          fs.writeFileSync(dpPath, Buffer.from(res.data, "binary"));

          data[event.threadID].dp = dpPath;
          writeData(data);

          return api.sendMessage(`🔒 Group DP locked and saved.`, event.threadID);
        } else {
          return api.sendMessage("⚠️ No DP found to lock.", event.threadID);
        }
      } catch (e) {
        console.error("❌ Error while locking DP:", e);
        return api.sendMessage("❌ Failed to lock DP.", event.threadID);
      }
    }
  },

  // === Auto Listener ===
  onEvent: async function ({ api, event }) {
    let data = readData();
    if (!data[event.threadID]) return;

    if (
      event.type === "change_thread_image" ||
      event.logMessageType === "log:thread-image"
    ) {
      if (data[event.threadID].dp && fs.existsSync(data[event.threadID].dp)) {
        try {
          const img = fs.createReadStream(data[event.threadID].dp);
          await api.changeGroupImage(img, event.threadID);
          api.sendMessage("", event.threadID);
        } catch (e) {
          console.error("❌ Error restoring DP:", e);
        }
      }
    }
  }
};
