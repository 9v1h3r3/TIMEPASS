module.exports = {
  name: "kick",
  run: async ({ api, event, args, ADMIN_UID }) => {
    const { threadID, senderID, mentions } = event;
    if (senderID !== ADMIN_UID) return api.sendMessage("❌ Only admin can use this!", threadID);

    let targets = [];
    if (Object.keys(mentions).length > 0) targets = Object.keys(mentions);
    else if (args[0] && /^\d+$/.test(args[0])) targets.push(args[0]);
    else return api.sendMessage("❌ Usage: kick <@mention/UID>", threadID);

    for (const uid of targets) {
      api.removeUserFromGroup(uid, threadID, err => {
        if (err) api.sendMessage(`❌ Failed to remove ${uid}`, threadID);
      });
    }
  }
};
