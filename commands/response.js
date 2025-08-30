const fs = require("fs");
const path = require("path");

const responseFile = path.join(__dirname, "..", "response.txt");

function loadResponses() {
  try {
    const data = fs.readFileSync(responseFile, "utf-8").trim().split("\n");
    return data.filter(Boolean).map(line => {
      const [trigger, reply] = line.split("=>");
      return { trigger: trigger.trim(), reply: reply.trim() };
    });
  } catch {
    return [];
  }
}

function saveResponses(responses) {
  const data = responses.map(r => `${r.trigger}=>${r.reply}`).join("\n");
  fs.writeFileSync(responseFile, data, "utf-8");
}

module.exports = {
  name: "response",
  description: "Add, list, or delete trigger-response pairs",

  run: async ({ api, event, args, ADMIN_UID }) => {
    const { threadID, senderID } = event;

    if (senderID !== ADMIN_UID) {
      return api.sendMessage("❌ Only Admin can use this command.", threadID);
    }

    const sub = args[0]?.toLowerCase();

    // Add new response
    if (sub === "add") {
      const match = args.slice(1).join(" ").match(/^(.*?)\s*\((.*?)\)$/);
      if (!match) {
        return api.sendMessage("❌ Format: .response add <trigger> (<reply>)", threadID);
      }
      const [, trigger, reply] = match;
      const responses = loadResponses();
      responses.push({ trigger, reply });
      saveResponses(responses);
      return api.sendMessage(`✅ Added response:\nTrigger: ${trigger}\nReply: ${reply}`, threadID);
    }

    // List all
    if (sub === "list") {
      const responses = loadResponses();
      if (responses.length === 0) return api.sendMessage("⚠ No responses saved.", threadID);
      const msg = responses
        .map((r, i) => `${i + 1}. ${r.trigger} => ${r.reply}`)
        .join("\n");
      return api.sendMessage(`📋 Saved Responses:\n${msg}`, threadID);
    }

    // Delete response
    if (sub === "del") {
      const index = parseInt(args[1]);
      if (isNaN(index)) return api.sendMessage("❌ Format: .response del <id>", threadID);
      const responses = loadResponses();
      if (index < 1 || index > responses.length) {
        return api.sendMessage("⚠ Invalid ID.", threadID);
      }
      const removed = responses.splice(index - 1, 1);
      saveResponses(responses);
      return api.sendMessage(`🗑 Deleted response: ${removed[0].trigger} => ${removed[0].reply}`, threadID);
    }

    return api.sendMessage("⚙ Usage:\n.response add <trigger> (<reply>)\n.response list\n.response del <id>", threadID);
  },

  // Auto reply system
  onEvent: async ({ api, event }) => {
    if (event.type !== "message" || !event.body) return;

    const responses = loadResponses();
    const found = responses.find(r => r.trigger.toLowerCase() === event.body.toLowerCase().trim());
    if (found) {
      api.sendMessage(found.reply, event.threadID, event.messageID);
    }
  }
};
