module.exports = {
  name: "mspam",
  description: "Spam pre-loaded stickers randomly with 3 sec delay",
  run: async ({ api, event, args, ADMIN_UID }) => {
    const { threadID, senderID } = event;

    if(senderID !== ADMIN_UID)
      return api.sendMessage("❌ Not authorized.", threadID);

    // Pre-loaded stickers (Summer Time / Angry Birds / custom)
    const stickers = [
      "1747082038936381",
      "387545578037993",
      "657502917666299",
      "172815829952254",
      "551710554864076",
      "1390600204574794",
      "184571475493841",
      "147663442082586"
    ];

    const count = parseInt(args[0]) || 5;

    api.sendMessage(`✅ Started random sticker spam (${count} times) with 3s delay`, threadID);

    for(let i = 0; i < count; i++){
      setTimeout(() => {
        const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
        api.sendMessage({ sticker: randomSticker }, threadID);
      }, i * 3000); // 3 sec delay per sticker
    }
  }
};
