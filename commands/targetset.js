const fs = require("fs");
const path = require("path");
const { runState } = require("./target");

module.exports = {
  name: "targetset",
  run: ({ api, event, args, ADMIN_UID }) => {
    const { senderID, threadID } = event;

    if (senderID !== ADMIN_UID)
      return api.sendMessage("❌ Only admin can use this command.", threadID);

    if (!runState[threadID])
      return api.sendMessage("⚠️ No active target in this thread.", threadID);

    const state = runState[threadID];

    if (args[0] === "delay" && args[1] && /^\d+$/.test(args[1])) {
      const newDelay = parseInt(args[1], 10);
      clearInterval(state.intervalID);

      state.intervalID = setInterval(() => {
        const msg = state.lines[state.lineIdx];
        const mentionsArr = [];
        let finalMessage = msg;

        finalMessage =
          state.targetUIDs.map(uid => `@${state.userInfos[uid]}`).join(" ") +
          " " +
          msg;
        for (const uid of state.targetUIDs) {
          mentionsArr.push({ id: uid, tag: state.userInfos[uid] });
        }

        api.sendMessage({ body: finalMessage, mentions: mentionsArr }, threadID);
        state.lineIdx = (state.lineIdx + 1) % state.lines.length;
      }, newDelay * 1000);

      state.delaySec = newDelay;
      return api.sendMessage(`✅ Delay updated to ${newDelay} seconds.`, threadID);
    }

    if (args[0] === "file" && args[1]) {
      const filePath = path.join(__dirname, "..", "message_files", args[1]);
      if (!fs.existsSync(filePath))
        return api.sendMessage(`❌ File not found: ${args[1]}`, threadID);

      const lines = fs.readFileSync(filePath, "utf-8")
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0);

      if (lines.length === 0)
        return api.sendMessage("⚠️ File is empty!", threadID);

      state.lines = lines;
      state.fileName = args[1];
      return api.sendMessage(`✅ File updated to ${args[1]}.`, threadID);
    }

    api.sendMessage("⚠️ Usage:\n.targetset delay <seconds>\n.targetset file <filename>.txt", threadID);
  },
};
