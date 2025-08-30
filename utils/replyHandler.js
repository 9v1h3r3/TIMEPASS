const fs = require("fs");
const path = require("path");

const targetFile = path.join(__dirname, "target_uids.json");
const replyFile = path.join(__dirname, "reply.txt");

// === Load Targets ===
function loadTargets() {
  try {
    return JSON.parse(fs.readFileSync(targetFile, "utf8"));
  } catch {
    return [];
  }
}

// === Get Random Reply ===
function getRandomReply() {
  try {
    const lines = fs.readFileSync(replyFile, "utf8").split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;
    return lines[Math.floor(Math.random() * lines.length)];
  } catch {
    return null;
  }
}

// === Main Auto-Reply Handler ===
async function autoReply({ api, event }) {
  if (event.type !== "message" || !event.senderID) return;

  const targets = loadTargets();
  if (!targets.includes(event.senderID)) return; // sirf saved UID

  const reply = getRandomReply();
  if (reply) {
    api.sendMessage(reply, event.threadID, event.messageID);
  }
}

module.exports = { autoReply };
