module.exports = {
  name: "groupinfo",
  run: async ({ api, event }) => {
    const info = await api.getThreadInfo(event.threadID);
    const admins = info.adminIDs.map(a => a.id).join(", ");
    api.sendMessage(`ℹ️ Group Name: ${info.name}\n👥 Members: ${info.participantIDs.length}\n⭐ Admins: ${admins}`, event.threadID);
  }
};
