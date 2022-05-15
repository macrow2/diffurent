import {Client, Intents} from "discord.js";
import * as Types from "./Types";
import * as fs from "fs";
import commands from "../commands/index"
import chalk from "chalk";
class Bot extends Client {
    config: Types.Config;
    commands: Array<Types.Command>;
    Users: Array<Types.UserData>;
    Servers: Array<Types.ServerData>;
    constructor(){
        super({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
        if(!fs.existsSync("../config.json")){
            // first run, probably didnt copy template
            console.log(chalk.red("Config file missing, attempting to copy template to config.json"));
            try {
                fs.copyFileSync("../config.template.json", "../config.json");
                console.log(chalk.green("Successfully copied config template to proper location!\nPlease fill out the config file with the correct information."));
                console.log(chalk.green("Exiting..."));
                process.exit(0);
            } catch(err){
                console.log(chalk.red("Couldn't copy template. Did you delete it?"));
                console.log(err)
                console.log(fs.readdirSync("../"))
                process.exit(0)
            }

        }
        this.config = require("../../config.json")
        this.commands = commands;
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
}
export default Bot;