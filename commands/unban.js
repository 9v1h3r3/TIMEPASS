const fs = require("fs");
const banFile = "./banned.json";
let banned = fs.existsSync(banFile) ? JSON.parse(fs.readFileSync(banFile)) : [];

module.exports = {
  name: "unban",
  run: async ({ api, event, args, ADMIN_UID }) => {
    const { threadID, senderID } = event;
    if (senderID !== ADMIN_UID) return api.sendMessage("❌ Only admin can unban.", threadID);

    if (!args[0]) return api.sendMessage("❌ Provide UID to unban.", threadID);
    banned = banned.filter(uid => uid !== args[0]);
    fs.writeFileSync(banFile, JSON.stringify(banned, null, 2));
    api.sendMessage(`♻️ Unbanned ${args[0]}`, threadID);
  }
};
