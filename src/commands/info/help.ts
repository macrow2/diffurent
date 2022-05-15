import {Message, MessageEmbed} from "discord.js";

// import modules
import * as Util from "../../modules/UtilFunctions";
import * as Types from "../../modules/Types";
import Client from "../../modules/Client";

// import command index
import commands from "../index";

/**
 * Execute the command.
 */
function execute(message: Message, client: Client){
    const showableCommands = commands.filter( (c) => c.hidden === false);
    let categories : Array<string> = [];
    showableCommands.forEach( (c) => {
        if(!categories.includes(c.category)){
            categories.push(c.category);
        };
    });
    let args = message.content.slice(client.config.prefix.length).split(" ").slice(1);
    let embed = new MessageEmbed();
    let prefix = Util.getContextualPrefix(message, client);
    embed.setColor("#0099ff");
    if(args.length === 0){
        embed.setTitle("Commands");
        embed.setDescription(`Use ${prefix}help <category> to see the commands in a category.`);
        
        for(let i of categories){
            let categoryCommands = showableCommands.filter( (c) => c.category === i);
            let commandsString = categoryCommands.map( (c) => c.name).join(", ");
            embed.addField(i, commandsString);
        }
    } else {
        let category = args[0];
        if(!categories.includes(category)){
            return Util.quickError(message, `Category ${category} does not exist.`);
        }
        let categoryCommands = showableCommands.filter( (c) => c.category === category);
        embed.setTitle(`Commands in ${category}`);
        for(let i of categoryCommands){
            i.description = i.description.replace(/\{prefix\}/g, prefix);
            embed.addField(`\`${i.name}\``, i.description);
        }
    }
    message.reply({embeds: [embed], allowedMentions: {repliedUser: false}});
}

const commandJson: Types.Command = {
    name: "help",
    aliases: ["h"],
    description: "List all commands that the bot has",
    category: "info",
    execute: execute,
    hidden: false /* hides the command from help */
}

export default commandJson;