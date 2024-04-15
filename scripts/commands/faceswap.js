module.exports = {
    config: {
      name: "faceswap",
      description: "GPT-4 Turbo AI",
      usage: "+gpt4 <question>"

    },

    onCommand: async ({ api, event, args, box }) => {
      const { Prodia } = require("prodia.js");
      const { faceSwap, wait, getJob } = Prodia("8cf107fe-0542-483b-9192-b41914cfa75c");
      const axios = require("axios");
      const fs = require('fs-extra');
      try {

      if (event.type == "message_reply") {
        if (event.messageReply.attachments.length < 0) {
       return box.reply("No image found.");
        }
        if (event.messageReply.attachments[0].type !== "photo") {
        return box.reply("Only image can be converted.");
        }

        if (event.messageReply.attachments.lengt > 2) {
          return box.reply("Only 2 image can be converted.");
        }

        const url = event.messageReply.attachments[0].url;
        const url1 = event.messageReply.attachments[1].url;

        box.reply("Processing...");

        const generate = await faceSwap({

          sourceUrl: encodeURI(url),

          targetUrl: encodeURI(url1),

        });
       while (generate.status !== "succeeded" && generate.status !== "failed") {

         new Promise((resolve) => setTimeout(resolve, 250));

         const job = await getJob(generate.job);

         if (job.status === "succeeded") {

           let img = (await axios.get(job.imageUrl, { responseType: "arraybuffer" })).data;

           let path = __dirname + '/cache/gen.png';

           fs.writeFileSync(path, Buffer.from(img, "utf-8"))

           return box.reply({ attachment: fs.createReadStream(path) });

         }

       }
      } else {

        return box.reply("Please reply to an image.");

      }

      } catch (e) {

        return box.reply(e.message)

      }



      //
    }
}