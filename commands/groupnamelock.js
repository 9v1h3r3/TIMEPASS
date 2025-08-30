const fs = require("fs");
const moment = require("moment");
const file = "./locked_threads.json";
let lockedNames = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};

module.exports = {
  name: "groupnamelock",
  run: async ({ api, event, args, ADMIN_UID }) => {
    const { senderID, threadID } = event;
    if (senderID !== ADMIN_UID) return api.sendMessage("❌ Only admin can use this!", threadID);

    if (args[0] === "on") {
      const name = args.slice(1).join(" ");
      if (!name) return api.sendMessage("❌ Usage: groupnamelock on <name>", threadID);

      await api.setTitle(name, threadID);
      lockedNames[threadID] = { name, by: ADMIN_UID, time: moment().format("YYYY-MM-DD HH:mm:ss") };
      fs.writeFileSync(file, JSON.stringify(lockedNames, null, 2));
      api.sendMessage(`✅ Group name locked to "${name}" 🔒`, threadID);

    } else if (args[0] === "off") {
      if (lockedNames[threadID]) {
        delete lockedNames[threadID];
        fs.writeFileSync(file, JSON.stringify(lockedNames, null, 2));
        api.sendMessage(`🔓 Group name lock removed.`, threadID);
      } else {
        api.sendMessage(`⚠️ No group name lock is active.`, threadID);
      }
    }
  },
  onEvent: async ({ api, event }) => {
    if (event.type === "event" && event.logMessageType === "log:thread-name") {
      const lock = lockedNames[event.threadID];
      if (lock && event.logMessageData.name !== lock.name) {
        setTimeout(() => api.setTitle(lock.name, event.threadID).catch(() => {}), 2000);
      }
    }
  }
};
      
