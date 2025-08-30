const fs = require('fs');

module.exports = {
  name: "setprefix",
  description: "Change the bot's command prefix",
  run: async ({ api, event, args, ADMIN_UID }) => {
    const { threadID, senderID } = event;

    // Only admin can change prefix
    if (senderID !== ADMIN_UID) {
      return api.sendMessage("❌ You are not authorized to change the prefix.", threadID);
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      return api.sendMessage(`❌ Please provide a new prefix.\nCurrent prefix: ${global.PREFIX}`, threadID);
    }

    try {
      const oldPrefix = global.PREFIX;

      // Update prefix.txt
      fs.writeFileSync('./prefix.txt', newPrefix, 'utf-8');

      // Update in-memory global PREFIX
      global.PREFIX = newPrefix;

      api.sendMessage(`✅ Prefix changed successfully!\nOld Prefix: "${oldPrefix}"\nNew Prefix: "${newPrefix}"`, threadID);
    } catch (err) {
      api.sendMessage(`❌ Failed to update prefix: ${err.message}`, threadID);
    }
  }
};
