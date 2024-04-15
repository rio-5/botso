module.exports = {
    config: {
      name: "fbdl",
      description: "Download Facebook Video/Reels",
      usage: "+fbdl <link>",
      author: "James Lim"

    },

    onCommand: async ({ api, event, args, box }) => {
      const axios = require("axios");
      const fs = require('fs-extra');

      const link = args.join(" ");
      let pathie = __dirname + `/cache/fbdl.mp4`;
      if (!link) {
        box.reply("please provide a link.");
        return;
      };

      box.reply("downloading...");

      try {
        const url = `https://joshweb.click/facebook?url=${link}`;

        const res = await axios.get(url);
        const url2 = res.data.result;

        const res2= (await axios.get(url2, {
          responseType: "arraybuffer"
        })).data;

        fs.writeFileSync(pathie, Buffer.from(res2, 'binary'));

        api.sendMessage({
          body: "downloaded",
          attachment: fs.createReadStream(pathie)
        }, event.threadID, () => fs.unlinkSync(pathie), event.messageID);

      } catch (e) {
        return box.reply("error occurred, please try again later.")
      };

    }
}