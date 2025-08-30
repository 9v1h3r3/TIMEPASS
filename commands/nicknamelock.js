const fs = require("fs");
const moment = require("moment");
const file = "./locked_nicks.json";

// अगर फाइल है तो पढ़ लो, नहीं तो खाली object
let lockedNicks = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};

module.exports = {
  name: "nicknamelock",
  run: async ({ api, event, args, ADMIN_UID }) => {
    const { senderID, threadID, mentions } = event;
    
    if (senderID !== ADMIN_UID) 
      return api.sendMessage("❌ Only admin can use this command!", threadID);

    // ➡ Lock ON
    if (args[0] === "on") {
      let targets = [];

      // Mention या UID से target select
      if (Object.keys(mentions).length > 0) {
        targets = Object.keys(mentions);
      } else if (args.length > 2 && /^\d+$/.test(args[1])) {
        targets = args.slice(1, -1).filter(a => /^\d+$/.test(a));
      }

      let nickname;
      if (targets.length > 0) {
        nickname = args[args.length - 1];
      } else {
        nickname = args.slice(1).join(" ");
        const info = await api.getThreadInfo(threadID);
        targets = info.participantIDs;
      }

      if (!nickname) 
        return api.sendMessage("❌ Please provide a nickname.", threadID);

      if (!lockedNicks[threadID]) {
        lockedNicks[threadID] = { 
          nick: nickname, 
          users: {}, 
          by: ADMIN_UID, 
          time: moment().format("YYYY-MM-DD HH:mm:ss") 
        };
      }

      for (const uid of targets) {
        await api.changeNickname(nickname, threadID, uid).catch(() => {});
        lockedNicks[threadID].users[uid] = nickname;
      }

      fs.writeFileSync(file, JSON.stringify(lockedNicks, null, 2));
      api.sendMessage(`🔒 Nickname locked to "${nickname}" for ${targets.length} user(s).`, threadID);
    }

    // ➡ Lock OFF
    else if (args[0] === "off") {
      let targets = [];
      if (Object.keys(mentions).length > 0) {
        targets = Object.keys(mentions);
      } else {
        targets = args.slice(1).filter(a => /^\d+$/.test(a));
      }

      if (!lockedNicks[threadID]) 
        return api.sendMessage("⚠️ No nickname lock is active here.", threadID);

      if (targets.length === 0) {
        delete lockedNicks[threadID];
        api.sendMessage("🔓 Nickname lock removed for whole group.", threadID);
      } else {
        targets.forEach(uid => delete lockedNicks[threadID].users[uid]);
        api.sendMessage(`🔓 Nickname lock removed for ${targets.length} user(s).`, threadID);
      }

      fs.writeFileSync(file, JSON.stringify(lockedNicks, null, 2));
    }

    else {
      api.sendMessage("❌ Usage:\n nicknamelock on <name/UID/mention>\n nicknamelock off [UID/mention]", threadID);
    }
  },

  // ➡ Auto revert अगर कोई nickname बदल दे
  onEvent: async ({ api, event }) => {
    if (event.type === "event" && event.logMessageType === "log:user-nickname") {
      const uid = event.logMessageData.participant_id;
      const expected = lockedNicks[event.threadID]?.users?.[uid];
      if (expected && event.logMessageData.nickname !== expected) {
        setTimeout(() => {
          api.changeNickname(expected, event.threadID, uid).catch(() => {});
        }, 1500);
      }
    }
  }
};
