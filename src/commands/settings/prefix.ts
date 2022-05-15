import {Message, MessageEmbed} from "discord.js";

// import modules
import * as Util from "../../modules/UtilFunctions";
import * as Types from "../../modules/Types";
import Client from "../../modules/Client";


function execute(message: Message, client: Client){
    if(!message.member!.permissions.has("ADMINISTRATOR")) return Util.quickError(message, `Only server administrators can do that, ${message.member!.displayName}`);
    var newPrefix = message.content.slice(client.config.prefix.length).split(" ").slice(1).join(" ")
    var server = Util.getServerData(message.guild!, client);
    if(newPrefix.length > 10) return message.channel.send("Whoa there, thats a really long prefix! Please make your prefix something 10 or less characters.")
    if(server.prefix == newPrefix) return message.channel.send("The server prefix is already that!")
    server.prefix = newPrefix;
    var embed = new MessageEmbed()
    .setTitle("Prefix")
    .setFooter({text: message.guild!.name, iconURL: message.guild!.iconURL()!})
    .setDescription(`Set server prefix to ${newPrefix}`)
    .setTimestamp()
    if(newPrefix == client.config.prefix) embed.setDescription(`Set server prefix to default (\`${newPrefix}\`)`)
    message.reply({allowedMentions : {repliedUser : false}, embeds : [embed]})
    
}

const commandJson: Types.Command = {
    name:"prefix",
    aliases:["pfx"],
    execute:execute,
    category: "settings",
    description: "Change the prefix in this server.",
    hidden: false
}

export default commandJson