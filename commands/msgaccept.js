module.exports = {
  name: "msgaccept",
  run: async function ({ api, event }) {
    return api.sendMessage("✅ Auto message-request accept हमेशा enabled है।", event.threadID);
  },

  // === Listener (auto accept always on) ===
  onEvent: async function ({ api, event }) {
    if (event.type === "message_request") {
      try {
        await api.handleMessageRequest(event.threadID, true); // ✅ Auto accept request
        api.sendMessage("✅ Your request has been auto-accepted.", event.threadID);
      } catch (e) {
        console.error("❌ Failed to accept request:", e.message);
      }
    }
  }
};
