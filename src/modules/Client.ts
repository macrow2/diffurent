import {Client, Intents} from "discord.js";
import * as Types from "./Types";
import * as fs from "fs";
import commands from "../commands/index"
import chalk from "chalk";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
 
class Bot extends Client {
    e6queue: Array<Types.E6QueueItem>;
    config: Types.Config;
    commands: Array<Types.Command>;
    slashCommands: Array<Types.SlashCommand>;
    Users: Array<Types.UserData>;
    Servers: Array<Types.ServerData>;
    debugSwitch: boolean;
    constructor(){
        super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

        this.debugSwitch = false // only toggleable from eval command, for debugging purposes
        // eval client.debugSwitch = true

        if(!fs.existsSync("../config.json")){
            // first run, probably didnt copy template
            try {
                console.log(chalk.red("Config file missing, attempting to copy template to config.json"));
                fs.copyFileSync("../config.template.json", "../config.json");
                console.log(chalk.green("Successfully copied config template to proper location!\nPlease fill out the config file with the correct information."));
                console.log(chalk.green("Exiting..."));
                process.exit(0);
            } catch(err){
                console.log(chalk.red("Couldn't copy template. Did you delete it?"));
                process.exit(0)
            }

        }
        this.config = require("../../config.json")
        this.commands = commands;
        this.slashCommands = new Array();
        this.e6queue = new Array();
        this.Users = new Array();
        this.Servers = new Array();

        if(!fs.existsSync("../data/")) fs.mkdirSync("../data");
        var datafolder = fs.readdirSync("../data");
        for(var i in datafolder){
            var file = datafolder[i];
            if(!file.endsWith(".json")) continue;
            var whereToPush: "Users" | "Servers" = file.startsWith("user") ? "Users" : "Servers";
            this[whereToPush].push(require("../../data/" + datafolder[i]));
        }
        var filter = (d: string) => d.endsWith(".json")
        console.log(chalk.blue(`Loaded ${chalk.green(datafolder.filter(filter).length)} data files.`));
        // Auto-save data

        var that = this

        var autoSaveInterval = 300 // Autosave interval in seconds.
        setInterval(function(){
            for(var i = 0; i < that.Users.length; i++){
                var user = that.Users[i];
                fs.writeFileSync(`../data/user_${user.id}.json`, JSON.stringify(user, null, 2))
            }
            for(var i = 0; i < that.Servers.length; i++){
                var server = that.Servers[i];
                fs.writeFileSync(`../data/server_${server.id}.json`, JSON.stringify(server, null, 2))
            }
            console.debug(chalk.green("Autosaved!"));
        }, autoSaveInterval*1000)
    }
    addSlashCommand(command: Types.SlashCommand){
        this.slashCommands.push(command);
    }
    registerSlashCommands(){
        var commandData = [];
        for(var i = 0; i < this.slashCommands.length; i++){
            var command = this.slashCommands[i];
            commandData.push(command.data.toJSON());
        }
        const rest = new REST( {version: "10"} ).setToken(this.config.token);
        if(this.config.commandRegisterType == "global"){
            rest.put(Routes.applicationCommands(this.config.botID), {body: commandData}).then((res) => {
                console.log(chalk.green("Successfully registered global slash commands! You may have to wait up to an hour for the commands to appear in all servers."));
            })
        } else if(this.config.commandRegisterType == "local"){
            rest.put(Routes.applicationGuildCommands(this.config.botID, this.config.testGuildId), {body:commandData}).then((res) => {
                console.log(chalk.green("Successfully registered local slash commands in guild " + this.config.testGuildId + "."))
            })
        }
    }
    removeSlashCommand(id: string){
        
        this.application?.commands.fetch(id)!.then(c => {
            c.delete();
        }).catch(err => {
            return "yeah mate couldn't find whatever the fuck you're looking for"
        })
    }
}
export default Bot;