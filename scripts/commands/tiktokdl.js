const { get } = require('axios');
const { writeFileSync, createReadStream, unlinkSync } = require('fs-extra');
const path = require("path");
module.exports = {
    config: {
      name: "tiktokdl",
      description: "Download Tiktok Video or Photo",
      usage: "+tiktokdl [link] [video/photo]",
      author: "James Lim"

    },

    onCommand: async ({ api, event, args, box }) =>  {
        const option = args[1];

        // Check if an option is provided
        if (!option) {
            box.reply("please choose option:\n 🔹photo\n 🔹video")
            return;
        }

        box.reply("downloading...");
        if (option == "video") {
            const link = args[0];
          if (!link) {
            box.reply("pleas provide a link!")
          }
          try {
            const url = "https://deku-rest-api.onrender.com/tiktokdl?url="+link;
            let pathie = __dirname +`/cache/tiktokdl.mp4`;
            const resp = await get(url);
            const result = resp.data.result;
            const resp2 = (await get(result, {
              responseType: "arraybuffer"
            })).data;

            writeFileSync(pathie, Buffer.from(resp2, 'binary'));

            api.sendMessage({
              body: "downloaded",
              attachment: createReadStream(pathie)
            }, event.threadID, () => unlinkSync(pathie), event.messageID);

          } catch (e) {
            box.reply("error occurred")
          };
          
        } else if (option == "photo") {
            const link = args[0];
            if (!link) {
                box.reply("please provide a link!");
                return;
            }
            try {
                const url = "https://deku-rest-api.onrender.com/tiktokdl?url=" + link;
                const resp = await get(url);
                const data = resp.data.result; // Access the 'result' directly from 'resp.data'

                const photos = [];

                for (let i = 0; i < data.length; i++) {
                    const photoUrl = data[i];
                    const photoRes = await get(photoUrl, { responseType: "arraybuffer" }); // Add closing bracket here
                    const photoPath = path.join(__dirname, "cache", `photo${i + 1}.jpg`);
                    writeFileSync(photoPath, Buffer.from(photoRes.data, 'binary'));
                    photos.push(createReadStream(photoPath));
                }

                await api.sendMessage({
                    body: "downloaded",
                    attachment: photos
                }, event.threadID, () => unlinkSync(photoPath), event.messageID);

            } catch (e) {
                box.reply(`error: ${e}`);
            }
        }
    }
};