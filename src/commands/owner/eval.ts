// Use this file for easy creation of a new command.
// Dont forget to add the command to the index!

import {Message} from "discord.js";

// import modules
import * as Util from "../../modules/UtilFunctions";
import * as Types from "../../modules/Types";
import Client from "../../modules/Client";
import {performance} from "perf_hooks";

function clean(text: string) {
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
}
/**
 * Execute the command.
 */
function execute(message: Message, client: Client){
    if(message.author.id !== client.config.ownerID) return; // Only I can use this command!
    try {
        const code = message.content.split(" ").slice(1).join(" ");
        var before = performance.now()
        let evaled = eval(code);
        var after = performance.now()
        var exectime = (after-before).toFixed(2);

        if (typeof evaled !== "string")
            evaled = require("util").inspect(evaled);

        message.channel.send(`Took ${exectime}ms to execute. \n\`\`\`\n${clean(evaled)}\`\`\``);
    } catch (err: any) {
        message.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
    }
}
const commandJson:Types.Command = {
  name:"eval",
  aliases: [],  
  description: "Runs code.",
  category: "owner",
  hidden: true,
  execute:execute
}

export default commandJson;