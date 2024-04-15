module.exports = {
    config: {
      name: "gemini",
      description: "GEMINI AI",
      usage: "+gemini <question>",
      author: "James Lim"

    },

    onCommand: async ({ api, event, args, box }) => {
      const { get } = require('axios');
      const que = args.join(" ");
      if (!que) {
        box.reply("please provide a prompt.");
        
      };

      try {

        if (event.type == "message_reply") {
          if (event.messageReply.attachments[0]?.type == "photo") {
            const url = encodeURIComponent(event.messageReply.attachments[0].url);
            const apiUrl = `https://deku-rest-api.onrender.com/gemini?prompt=${que}&url=${url}`;
            const res = (await get(apiUrl)).data;
            box.reply(res.gemini)
          }
        } else {
          try {
           const res = await get(`https://deku-rest-api.onrender.com/gemini?prompt=${que}&uid=${event.senderID}`);
           return box.reply(res.data.gemini);
          } catch (error) {
           return box.reply(`error: ${error}`) 
          }
        };

      } catch (e) {
        return box.reply(`error: ${e}`)
      };
      ////////
    }
}