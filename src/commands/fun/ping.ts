import {Message} from "discord.js";

// import modules
import * as Util from "../../modules/UtilFunctions";
import * as Types from "../../modules/Types";
import Client from "../../modules/Client";

/**
 * Execute the command.
 */
function execute(message: Message, client: Client){
    message.reply({content: "Pong! 🏓", allowedMentions: {repliedUser: false}});
}

const commandJson: Types.Command = {
    name: "ping",
    aliases: [],
    description: "A simple ping command.",
    category: "fun",
    hidden: false,
    execute: execute
}

export default commandJson;