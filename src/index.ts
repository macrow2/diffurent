// es6 imports
import * as fs from "fs";
import * as Types from "./modules/Types"
import extendedClient from "./modules/Client";
import * as utils from "./modules/UtilFunctions";
import chalk from "chalk";
import { performance } from "perf_hooks";
const client = new extendedClient();


var commandsDir = fs.readdirSync("./commands");
var commandsFilter = (c: string) => c.endsWith(".js");
var validCommands = commandsDir.filter(commandsFilter);

console.log(chalk.blue(`Found ${chalk.green(client.commands.length)} commands!`));

if (client.config.token) client.login(client.config.token);
else console.log("No token provided. Please put a bot token in config.json and restart the bot.")

client.on("ready", () => {
    client.user!.setPresence({
        activities: [{
            name: 'for ' + client.config.prefix + 'help',
            type: 'WATCHING'
        }]
    })
    console.log(chalk.blue(`Logged in as ${chalk.green(client.user!.tag)}!`));
})
client.on("messageCreate", (msg) => {
    if(msg.author.bot || !msg.guild) return;
    var thisServer = utils.getServerData(msg.guild!, client);
    var prefixToUse;
    if (typeof thisServer.prefix == "string") prefixToUse = thisServer.prefix;
    else prefixToUse = client.config.prefix;
    // if the server has a custom prefix, use it
    if (msg.content.startsWith(prefixToUse)) { // check if command starts with prefix
        var command = msg.content.slice(prefixToUse.length).split(/ +/)[0]; // get the command
        var filter = (c: Types.Command) => c.name === command || c.aliases.includes(command); // filter for command to execute
        var toExec = client.commands.filter(filter);
        // if cant find command, tell user
        if (toExec.length <= 0) {
            var name = msg.member!.displayName
            utils.quickError(msg, `I couldnt find the command you were looking for, ${name}!`);
            return;
        };
        try {
            toExec[0].execute(msg, client);
        } catch (err) {
            console.log("Error: " + err);
            msg.channel.send("I encountered an error while trying to execute your command. Please contact the developer of this bot for help.");
        }
    } else if (client.user !== null && msg.content == `<@${client.user.id}>`) {
        var serverPrefix;
        if (typeof thisServer.prefix  == "string") serverPrefix = thisServer.prefix;
        serverPrefix ? msg.channel.send(`My prefix in this server is ${serverPrefix}`) : msg.channel.send(`My prefix is ${client.config.prefix}`);
    }
})