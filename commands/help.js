const { readFileSync } = require("fs");

module.exports = {
  name: "help",
  description: "Show all available commands",
  run: async ({ api, event, PREFIX }) => {
    try {
      const helpMsg = `
✨ JERRY BOT COMMAND LIST ✅

🤖 General:
  • ${PREFIX}ping 📡 ➝ Check if bot is alive
  • ${PREFIX}uptime ⏱️ ➝ Show bot uptime
  • ${PREFIX}tid 🆔 ➝ Show thread ID
  • ${PREFIX}uid 🪪 ➝ Get UID of a user
  • ${PREFIX}groupinfo 🏘️ ➝ Show group info

🎭 Fun:
  • ${PREFIX}joke 😂 ➝ Random joke
  • ${PREFIX}love ❤️ ➝ Love message
  • ${PREFIX}compliment 🌸 ➝ Nice compliment
  • ${PREFIX}mspam 🎲 ➝ Spam random stickers
  • ${PREFIX}sspam 🎯 ➝ Spam single sticker

🛠️ Utilities:
  • ${PREFIX}help 📖 ➝ Show all commands
  • ${PREFIX}setprefix 🔑 ➝ Change command prefix
  • ${PREFIX}response 💬 ➝ Add/list/delete responses
  • ${PREFIX}autoreply 🤖 ➝ Auto reply system

👑 Admin Only:
  • ${PREFIX}rkb 🎯 ➝ Manage RKB UIDs
  • ${PREFIX}ban 🚫 ➝ Ban user
  • ${PREFIX}unban ✅ ➝ Unban user
  • ${PREFIX}kick 🦵 ➝ Kick user
  • ${PREFIX}tagall 📢 ➝ Tag everyone
  • ${PREFIX}groupnamelock 🔒 ➝ Lock group name
  • ${PREFIX}nicknamelock 🔏 ➝ Lock nicknames
  • ${PREFIX}target 🎯 ➝ Target mode
  • ${PREFIX}targetset ⚡ ➝ Set target
  • ${PREFIX}targetstop 🛑 ➝ Stop target
  • ${PREFIX}exit 🚪 ➝ Bot leaves group

⚡ Prefix: ${PREFIX}
👑 Admin only commands are restricted
`;

      api.sendMessage(helpMsg, event.threadID, event.messageID);
    } catch (e) {
      api.sendMessage("⚠ Error showing help.", event.threadID);
      console.error("Help command error:", e);
    }
  }
};
