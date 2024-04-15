//https://deku-rest-api.onrender.com/spotify?q=dkodkdodk

const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
    config: {
      name: "spotify",
      description: "GPT-4 Turbo AI",
      usage: "+gpt4 <question>"

    },

    onCommand: async ({ api, event, args, box }) => {
      const name = args.join(" ")
      if (!name) {
        box.reply("please provide query.\nusage: +spotify <music name>");
        return;
      }

      box.reply(`searching for "${name}"...`);

      try {
        const url = `https://deku-rest-api.onrender.com/spotify?q=${name}`;
        const res = await axios.get(url);
        const res2 = res.data.result;
        const musicpath = __dirname+`/cache/${name}.mp3`;

        const music = (await axios.get(res2, { responseType: "arraybuffer" })).data;

        fs.writeFileSync(musicpath, Buffer.from(music, 'binary'));

        api.sendMessage({
          attachment: fs.createReadStream(musicpath)
        }, event.threadID, () => fs.unlinkSync(musicpath), event.messageID);


      } catch (e) {
        box.reply("error occurred")
      };

    }
}
