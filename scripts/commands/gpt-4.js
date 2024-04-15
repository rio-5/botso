//https://deku-rest-api.onrender.com/gpt4?prompt=hi&uid=100

module.exports = {
    config: {
      name: "gpt4",
      description: "GPT-4 Turbo AI",
      usage: "+gpt4 <question>"

    },

    onCommand: async ({ api, event, args, box }) => {
      const axios = require('axios')

      const que = args.join(" ")
      const uid = event.senderID;

      if (!que) {
        box.reply("please put a prompt.");
        return;
      }

     box.reply("searching...")

     try {
       let url = `https://deku-rest-api.onrender.com/gpt4?prompt=${que}&uid=${uid}`
       const res = await axios.get(url);
       box.reply(res.data.gpt4)

     } catch (e) {
       return box.reply("error occurred, please try again later.")
     };

    }
}