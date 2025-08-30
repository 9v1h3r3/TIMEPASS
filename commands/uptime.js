module.exports = {
  name: "uptime",
  run: async ({ api, event }) => {
    const uptimeSeconds = process.uptime(); // bot ka uptime in seconds
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    api.sendMessage(
      `⏳ Bot Uptime: ${hours}h ${minutes}m ${seconds}s`,
      event.threadID,
      event.messageID
    );
  }
};
