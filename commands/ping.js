module.exports = {
  name: "ping",
  description: "Check if bot is alive",
  run: async ({ api, event }) => {
    api.sendMessage("🏓 Pong! Bot is running ✅", event.threadID);
  }
};
