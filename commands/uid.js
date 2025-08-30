module.exports = {
  name: 'uid',
  description: 'UID निकालने का command',

  run: async ({ api, event }) => {
    let targetUID;

    // ✅ अगर mention किया है
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    }

    // ✅ अगर reply किया है
    else if (event.type === "message_reply" && event.messageReply?.senderID) {
      targetUID = event.messageReply.senderID;
    } 
    
    // कुछ setups में reply info type "message" होता है लेकिन messageReply मौजूद होता है
    else if (event.messageReply && event.messageReply.senderID) {
      targetUID = event.messageReply.senderID;
    }

    // ✅ वरना अपनी खुद की UID
    else {
      targetUID = event.senderID;
    }

    // नाम निकालना
    let name;
    try {
      const info = await api.getUserInfo(targetUID);
      name = info[targetUID]?.name || "Unknown";
    } catch {
      name = "Unknown";
    }

    // UID भेजना
    api.sendMessage(`👤 ${name}\n🆔 UID: ${targetUID}`, event.threadID, event.messageID);
  }
};
