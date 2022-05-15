import {Message} from "discord.js";

// import modules
import * as Util from "../../modules/UtilFunctions";
import * as Types from "../../modules/Types";
import Client from "../../modules/Client";

/**
 * Execute the command.
 */
function execute(message: Message, client: Client){
    
}

const commandJson: Types.Command = {
    name: "chnick",
    aliases: ["changenickname", "nick", "nickname", "changenick"],
    description: "Change a users nickname.\nUsage: chnick <user mention> <new nickname>",
    category: "moderation",
    hidden: false,
    execute: execute
}

export default commandJson;