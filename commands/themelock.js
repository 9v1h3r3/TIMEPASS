const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../lockdata.json");

function readData() {
  if (!fs.existsSync(DATA_FILE)) return {};
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "themelock",
  run: async function ({ api, event, args }) {
    if (!event.isGroup) return api.sendMessage("⚠️ Group only.", event.threadID);

    const action = args[0]; // on | off
    let data = readData();
    if (!data[event.threadID]) data[event.threadID] = {};

    if (action === "off") {
      delete data[event.threadID].theme;
      writeData(data);
      return api.sendMessage("🔓 Theme lock disabled.", event.threadID);
    }

    const info = await api.getThreadInfo(event.threadID);
    if (info.threadThemeID || info.color) {
      data[event.threadID].theme = info.threadThemeID || info.color;
      writeData(data);
      return api.sendMessage("🔒 Theme locked.", event.threadID);
    } else {
      return api.sendMessage("⚠️ No theme found.", event.threadID);
    }
  },

  onEvent: async function ({ api, event }) {
    let data = readData();
    if (!data[event.threadID]?.theme) return;

    if (event.logMessageType === "log:thread-color") {
      if (
        event.logMessageData?.theme_id !== data[event.threadID].theme &&
        event.logMessageData?.theme_color !== data[event.threadID].theme
      ) {
        await api.changeThreadColor(data[event.threadID].theme, event.threadID);
        api.sendMessage("⚠️ Theme locked! Restored.", event.threadID);
      }
    }
  }
};
