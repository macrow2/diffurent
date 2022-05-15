// Use this file for easy creation of a new command.
// Dont forget to add the command to the index!

import {Message, MessageEmbed} from "discord.js";

// import modules
import * as Util from "../../modules/UtilFunctions";
import * as Types from "../../modules/Types";
import Client from "../../modules/Client";

/**
 * Execute the command.
 */
function execute(message: Message, client: Client){
    let args = Util.quickArgs(message, client);
    let acro = args.map( (val) => {return val.charAt(0).toLocaleLowerCase()});
    let acrostring = acro.join("");
    let embed = new MessageEmbed();
    embed.setTitle("Here is your acronym:");
    embed.setDescription(acrostring);
    embed.setColor("#0099ff");
    message.channel.send({
        embeds: [embed],
        allowedMentions: {
            repliedUser: false
        }
    });
}

const commandJson: Types.Command = {
    name: "acronym",
    aliases: ["abbr", "abbreviate"],
    description: "Turn any phrase into an acronym! istgiwctyhabtlsooyiydstfu!",
    category: "fun",
    hidden: false,
    execute: execute
}

export default commandJson;