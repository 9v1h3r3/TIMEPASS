const fs = require('fs');
const path = require('path');

const rkbFile = path.join(__dirname, '..', 'rkb_users.json');
function loadRkb() { try { return JSON.parse(fs.readFileSync(rkbFile,'utf-8')); } catch { return []; } }
function saveRkb(list) { fs.writeFileSync(rkbFile, JSON.stringify(list,null,2)); }

module.exports = {
  name: "rkb",
  description: "Admin only: Manage RKB auto-reply UIDs",

  run: async ({ api, event, args, ADMIN_UID }) => {
    if (event.senderID !== ADMIN_UID) return api.sendMessage("❌ Only Admin", event.threadID);

    const subCmd = args[0]?.toLowerCase();
    let list = loadRkb();

    // Clear all
    if (subCmd === "clear") { saveRkb([]); return api.sendMessage("🗑️ All UIDs cleared.", event.threadID); }

    // Show list
    if (subCmd === "list") return api.sendMessage(list.length ? `📂 RKB UIDs:\n${list.join("\n")}` : "📂 Empty", event.threadID);

    // Delete UID
    if (subCmd === "del") {
      let uid = event.mentions && Object.keys(event.mentions)[0] || args[1];
      if (!uid) return api.sendMessage("⚠ Usage: .rkb del <uid>", event.threadID);
      if (!list.includes(uid)) return api.sendMessage("⚠ UID not found", event.threadID);
      list = list.filter(u=>u!==uid); saveRkb(list);
      return api.sendMessage(`✅ UID removed: ${uid}`, event.threadID);
    }

    // Add UID
    const targetUID = event.mentions && Object.keys(event.mentions)[0] || args[0];
    if (!targetUID) return api.sendMessage("⚠ Usage: .rkb <uid>", event.threadID);
    if (list.includes(targetUID)) return api.sendMessage("⚠ UID already added", event.threadID);
    list.push(targetUID); saveRkb(list);
    return api.sendMessage(`✅ UID added: ${targetUID}`, event.threadID);
  }
};
