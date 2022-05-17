// es6 imports
import * as fs from "fs";
import * as Types from "./modules/Types"
import * as utils from "./modules/UtilFunctions";
import slashcommands from "./slashcommands/index";
import extendedClient from "./modules/Client";
import chalk from "chalk";
const client = new extendedClient();

console.log(chalk.blue(`Found ${chalk.green(client.commands.length)} commands!`));

if (client.config.token) client.login(client.config.token);
else console.log("No token provided. Please put a bot token in config.json and restart the bot.")

// register slash commands


client.on("ready", () => {
    for(var command in slashcommands){
        client.addSlashCommand(slashcommands[command])
    }
    client.registerSlashCommands();
    
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
        var filter = (c: Types.Command) => c.name === command.toLocaleLowerCase() || c.aliases.includes(command.toLocaleLowerCase()); // filter for command to execute
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

client.on("interactionCreate", (interaction) => {
    if(!interaction.isCommand()) return;

    var cmd = client.slashCommands.filter(c => c.data.name == interaction.commandName)[0];
    if(!cmd) return;
    cmd.exec(interaction, client);
})