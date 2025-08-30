const fs = require("fs");
const path = require("path");

let runState = {}; // { threadID: { intervalID, targetUIDs, userInfos, lines, lineIdx, delaySec, fileName } }

const configPath = "./config.json";

module.exports = {
  name: "target",
  runState, // export for targetstop & targetset

  run: async ({ api, event, args, ADMIN_UID }) => {
    const { senderID, threadID, mentions } = event;

    try {
      if (senderID !== ADMIN_UID)
        return api.sendMessage("❌ Only admin can use this command.", threadID);

      let config = fs.existsSync(configPath)
        ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
        : {
            sendfilemsgEnabled: true,
            defaultDelaySec: 10,
            defaultMessageFile: "welcome.txt",
            mentionFormat: true,
          };

      if (!config.sendfilemsgEnabled)
        return api.sendMessage("⚠️ This command is disabled.", threadID);

      // === get multiple UIDs ===
      let newUIDs = [];
      if (mentions && Object.keys(mentions).length > 0) newUIDs = Object.keys(mentions);
      for (const a of args) {
        if (/^\d+$/.test(a)) newUIDs.push(a);
      }
      newUIDs = [...new Set(newUIDs)];
      if (newUIDs.length === 0)
        return api.sendMessage("❌ Mention or valid UID(s) required.", threadID);

      // === running hai toh sirf add karo ===
      if (runState[threadID]) {
        const state = runState[threadID];
        let added = 0;
        for (const uid of newUIDs) {
          if (!state.targetUIDs.includes(uid)) {
            try {
              const info = await api.getUserInfo(uid);
              state.userInfos[uid] = info[uid]?.name || "Friend";
            } catch {
              state.userInfos[uid] = "Friend";
            }
            state.targetUIDs.push(uid);
            added++;
          }
        }
        return api.sendMessage(
          `✅ Added ${added} user(s). Now targeting ${state.targetUIDs.length} users.`,
          threadID
        );
      }

      // === fresh start ===
      let fileName = config.defaultMessageFile;
      let delaySec = config.defaultDelaySec;

      if (args.find(a => a.endsWith(".txt"))) fileName = args.find(a => a.endsWith(".txt"));
      const delayArg = args.find(a => /^\d+$/.test(a) && !newUIDs.includes(a));
      if (delayArg) delaySec = parseInt(delayArg, 10);

      const filePath = path.join(__dirname, "..", "message_files", fileName);
      if (!fs.existsSync(filePath))
        return api.sendMessage(`❌ File not found: ${fileName}`, threadID);

      const lines = fs.readFileSync(filePath, "utf-8")
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0);

      if (lines.length === 0)
        return api.sendMessage("⚠️ File is empty!", threadID);

      const userInfos = {};
      for (const uid of newUIDs) {
        try {
          const info = await api.getUserInfo(uid);
          userInfos[uid] = info[uid]?.name || "Friend";
        } catch {
          userInfos[uid] = "Friend";
        }
      }

      let lineIdx = 0;

      api.sendMessage(
        `📨 Started targeting ${newUIDs.length} users.\nDelay: ${delaySec}s\nFile: ${fileName}\nUse .targetstop to stop.`,
        threadID
      );

      const intervalID = setInterval(async () => {
        const state = runState[threadID];
        if (!state) return;

        const msg = state.lines[state.lineIdx];
        const mentionsArr = [];
        let finalMessage = msg;

        if (config.mentionFormat) {
          finalMessage =
            state.targetUIDs.map(uid => `@${state.userInfos[uid]}`).join(" ") +
            " " +
            msg;
          for (const uid of state.targetUIDs) {
            mentionsArr.push({ id: uid, tag: state.userInfos[uid] });
          }
        }

        await new Promise(resolve => {
          api.sendMessage(
            { body: finalMessage, mentions: mentionsArr },
            threadID,
            () => resolve()
          );
        });

        state.lineIdx = (state.lineIdx + 1) % state.lines.length;
      }, delaySec * 1000);

      runState[threadID] = {
        intervalID,
        targetUIDs: [...newUIDs],
        userInfos,
        lines,
        lineIdx,
        delaySec,
        fileName,
      };
    } catch (err) {
      console.error(err);
      if (runState[threadID]) {
        clearInterval(runState[threadID].intervalID);
        delete runState[threadID];
      }
      api.sendMessage("❌ Error: " + (err.message || err), threadID);
    }
  },
};
