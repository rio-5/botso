/*
  @author: Hi aym jenica, please credit me properly if u wanna use this project
  @info: If you are here because you want a to make your own bot system but you have no idea where to start, u can use this template
  @forkers: if you are here because you want to fork this project, u can fork this project and make your own bot system, but be sure to maintain and develop the source code below
  @warning: No making modified version of this template and owning it.
  @knowledge: you are required to have any JavaScript knowledge before using this template, you cannot use this project without coding anything!
  @license: read LICENSE.md before proceeding to use this project
  @ownfile: if you want to make your own command, please read DOCS.md
  @admin: open admin.json and add your user id
*/
const fs = require("fs");
const path = require("path");
const express = require("express");
const chalk = require("chalk");
const login = require("fca-unofficial");
//@Jenica: you can replace the fca with your fca

const PREFIX = "+";
//@Jenica: you can replace the prefix.
const app = express();
const commandPath = path.join(__dirname, "scripts", "commands");
const PORT = process.env.PORT || 3000;

const commands = {};

function loadCommands() {
  console.log(chalk.green(`Loading commands..`));
  const commandFiles = fs
    .readdirSync(commandPath)
    .filter((file) => file.endsWith(".js"));

  commandFiles.forEach(loadCommand);
}

function loadCommand(file) {
  const commandName = path.basename(file, ".js");
  try {
    const command = require(path.join(commandPath, file));
    if (!command.config) {
      throw new Error(
        `Command ${commandName} does not have a config property, please set it properly!!!!`,
      );
    }
    if (!command.config.name) {
      throw new Error(
        `Command ${commandName} does not have a name property, in other words.. the command name is missing, please set it properly!!!`,
      );
    }
    if (!command.config.description) {
      throw new Error(
        `Command ${commandName} does not have a valid description! please set it properly!!!`,
      );
    }
    if (!command.run && !command.onCommand && !command.onStart) {
      throw new Error(
        `Command ${commandName} does not have a run or onCommand or onStart function! please set it properly!`,
      );
    }
    if (!command.config.author) {
      if (command.config.credits) {
        command.config.author = command.config.credits;
      } else {
        command.config.author = "No name hehe why didnt u add any name";
      }
    }
    if (command.config.role === 2 || command.config.hasPermission === 0) {
      command.config.adminOnly = true;
    }

    commands[command.config.name] = command;
    console.log(
      chalk.green(`Loaded ${command.config.name} from "${commandName}.js"`),
    );
  } catch (error) {
    console.log(`Error loading ${commandName}.js: ${error.message}`);
  }
}

function reloadCommand(filename) {
  if (filename.endsWith(".js")) {
    const commandName = path.basename(filename, ".js");
    delete require.cache[require.resolve(path.join(commandPath, filename))];
    loadCommand(filename);
    console.log(chalk.yellow(`Reload: ${commandName} reloaded successfully`));
  }
}

function initializeBot(api, event) {
  /*
  @Jenica: this is where you can define your custom box functions, feel free to edit or improve it!

*/
  const box = {
    react: (emoji) =>
      api.setMessageReaction(emoji, event.messageID, () => {}, true),

    reply: (msg) => api.sendMessage(msg, event.threadID, event.messageID),

    add: (uid) => api.addUserToGroup(uid, event.threadID),

    kick: (uid) => api.removeUserFromGroup(uid, event.threadID),

    send: (msg) => api.sendMessage(msg, event.threadID),
  };
  //@Jenica: if you want to add more functions, add them here!

  try {
    //@Jenica: this is the code that triggers when someone types "prefix"
    if (event.body && event.body.toLowerCase() === "prefix") {
      box.reply(`Please edit this prefix message, this message shows when any user enters "prefix", to include the prefix in the message output, add \${PREFIX} without any "\\".
- Nicaa: Chatbot Template`);
    } else if (event.body && event.body.toLowerCase().startsWith(PREFIX)) {
      //@Jenica: this is the code that triggers if the message from user starts with a prefix, please find the "handleCommand" function if you want to edit it.
      handleCommand(api, event, box);
    }
  } catch (error) {
    console.error("Error occurred while executing command:", error);
    //@Jenica: this is where you can handle da error or log it to your preferred logging service
  }
}
//@Jenica: this is the function that handles the commands, edit it if you want to add more features or conditions!
function handleCommand(api, event, box) {
  const message = {
    reply: box.reply,
    reaction: box.reaction,
    send: box.send,
  };
  const startObjects = { api, event, box, message };

  const [command, ...args] = event.body.slice(PREFIX.length).trim().split(" ");
  startObjects.args = args;
  //@Jenica: gonna extract the command string and args array from the message!

  if (command in commands) {
    //@Jenica: checks if the command is there or loaded ._.

    const targetCommand = commands[command];

    const configuration = JSON.parse(fs.readFileSync("admin.json", "utf8"));
    const adminList = configuration.admins;

    if (
      targetCommand.config.adminOnly &&
      !adminList.some((admin) => admin.id === event.senderID)
    ) {
      box.reply(
        `Insert message here if the user is not admin, still u can use \${command} for command name but write it without any "\\"`,
      );

      //@Jenica: you can add if statements here that can interrupt the execution command
    } else {
      targetCommand.onCommand(startObjects);
      targetCommand.onStart(startObjects);
      targetCommand.run(startObjects);
    }
    //@Jenica: runs the command with the api, event, args and box object bein passed in! basically it activates the function inside the commands in scripts/commands folder.
  } else {
    //@Jenica: if the command is not found, it will reply with this message! please edit it
    box.reply(`Insert message here for invalid command, you need to edit it, if you want to include the command name, just use \${command} without any "\\"
- Nicaa: Chatbot Template`);
  }
}
//@Jenica: UwU

function loadAppState() {
  //@Jenica: simple appState loading, add your cookies or appstate to appstate.json! before you can login.
  //@Jenica: note: no native support for login with credential.
  try {
    const appStatePath = path.join(__dirname, "appstate.json");
    return JSON.parse(fs.readFileSync(appStatePath, "utf8"));
  } catch (error) {
    console.error("Error loading app state:", error);
    return null;
  }
}
//@Jenica: read get-appstate.md for guide on getting your appstate.

function startExpressServer() {
  app.use(express.static("public"));
  //@Jenica: feel free to add your pages :) just make an about.html, github.html on public folder!
  const pages = ["index", "about", "github", "stats"];

  pages.forEach((page) => {
    app.get(`/${page}`, (req, res) => {
      res.sendFile(path.join(__dirname, "public", `${page}.html`));
    });
  });
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  app.listen(PORT, () => {
    console.log(chalk.grey("⟩ 🤖 Nicaa: Chatbot Template V1.0.0"));
    console.log(chalk.green(`⟩ Server is listening on PORT ${PORT}`));
    console.log("");
  });
}

fs.watch(commandPath, (eventType, filename) => {
  if (eventType === "change") {
    reloadCommand(filename);
  }
});

login({ appState: loadAppState() }, (err, api) => {
  //@Jenica: login function, if you think you can use credential then u can edit it
  loadCommands();
  startExpressServer();
  if (err) return console.log("Login Error: " + err.error);

  api.listen((err, event) => {
    if (err) {
      console.error("Error occurred while processing event:", err);
      return;
    }

    initializeBot(api, event);
  });
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
