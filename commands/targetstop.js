const { runState } = require("./target");

module.exports = {
  name: "targetstop",
  run: ({ api, event, ADMIN_UID }) => {
    const { senderID, threadID } = event;

    if (senderID !== ADMIN_UID)
      return api.sendMessage("❌ Only admin can use this command.", threadID);

    if (runState[threadID]) {
      clearInterval(runState[threadID].intervalID);
      delete runState[threadID];
      api.sendMessage("🛑 Sending stopped in this thread.", threadID);
    } else {
      api.sendMessage("⚠️ No active target sending in this thread.", threadID);
    }
  },
};
