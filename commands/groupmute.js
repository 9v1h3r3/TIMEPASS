module.exports = {
  name: "groupmute",
  description: "🔒 Toggle group mute/unmute (Admin only)",
  run: async ({ api, event, ADMIN_UID }) => {
    try {
      // Admin check
      if (event.senderID !== ADMIN_UID) {
        return api.sendMessage("❌ Sirf Admin hi ye command use kar sakta hai.", event.threadID);
      }

      // Fetch thread info
      api.getThreadInfo(event.threadID, (err, info) => {
        if (err || !info) {
          console.error("❌ Failed to fetch thread info:", err);
          return api.sendMessage("⚠ Error: Unable to fetch group info. Make sure bot is in the group and has permissions.", event.threadID);
        }

        // Check if bot is admin
        const botAdmin = info.adminIDs.some(a => a.id === api.getCurrentUserID());
        if (!botAdmin) {
          return api.sendMessage("⚠ Bot ko admin banao tabhi mute/unmute kaam karega.", event.threadID);
        }

        const isMuted = info.adminOnlyMode;

        // Toggle admin-only mode
        api.changeThreadConfig(event.threadID, { adminOnlyMode: !isMuted }, (err2) => {
          if (err2) {
            console.error("❌ Error changing thread config:", err2);
            return api.sendMessage("⚠ Error: Mute/unmute change nahi ho paaya.", event.threadID);
          }

          // Success message with cool emojis
          const msg = !isMuted
            ? "🔒 *Group Mute Activated!* ✅\nAb sirf Admin hi message bhej sakte hain."
            : "🔓 *Group Unmute Activated!* ✅\nAb sabhi members message bhej sakte hain.";

          api.sendMessage(msg, event.threadID);
        });
      });
    } catch (e) {
      console.error("❌ Exception:", e);
      api.sendMessage(`❌ Error: ${e.message}`, event.threadID);
    }
  }
};
