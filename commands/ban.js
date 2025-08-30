const fs = require("fs");
const banFile = "./banned.json";
let banned = fs.existsSync(banFile) ? JSON.parse(fs.readFileSync(banFile)) : [];

module.exports = {
  name: "ban",
  run: async ({ api, event, args, ADMIN_UID }) => {
    const { threadID, senderID, mentions } = event;
    if (senderID !== ADMIN_UID) return api.sendMessage("❌ Only admin can ban.", threadID);

    let targets = Object.keys(mentions);
    if (targets.length === 0 && args[0] && /^\d+$/.test(args[0])) targets = [args[0]];
    if (targets.length === 0) return api.sendMessage("❌ Mention or UID required.", threadID);

    targets.forEach(uid => { if (!banned.includes(uid)) banned.push(uid); });
    fs.writeFileSync(banFile, JSON.stringify(banned, null, 2));
    api.sendMessage(`🚫 Banned ${targets.length} user(s).`, threadID);

    // Also remove them
    for (const uid of targets) {
      try { await api.removeUserFromGroup(uid, threadID); } catch {}
    }
  },
  onEvent: async ({ api, event }) => {
    if (event.logMessageType === "log:subscribe") {
      for (const p of event.logMessageData.addedParticipants) {
        if (banned.includes(p.userFbId)) {
          api.removeUserFromGroup(p.userFbId, event.threadID).catch(() => {});
        }
      }
    }
  }
};
