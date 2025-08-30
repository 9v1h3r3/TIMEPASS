module.exports = {
  name: "exit",
  description: "Bot ko group se nikalna (Admin only)",
  run: async ({ api, event, ADMIN_UID }) => {
    if (event.senderID !== ADMIN_UID) {
      return api.sendMessage("❌ Sirf admin hi bot ko group se nikal sakta hai.", event.threadID);
    }

    const botID = api.getCurrentUserID();

    api.sendMessage("👋 Main is group se nikal raha hoon...", event.threadID, () => {
      api.removeUserFromGroup(botID, event.threadID, (err) => {
        if (err) {
          return api.sendMessage("⚠ Error: Bot ko group se nikalne me dikkat aayi.", event.threadID);
        }
        console.log(`🚪 Bot exited group: ${event.threadID}`);
      });
    });
  }
};
