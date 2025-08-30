module.exports = {
  name: "tid",
  run: async ({ api, event }) => {
    api.sendMessage(`🆔 Thread ID: ${event.threadID}`, event.threadID, event.messageID);
  }
};
