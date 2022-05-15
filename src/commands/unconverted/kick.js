const {MessageEmbed} = require("discord.js");

module.exports = {
    name:"kick",
    aliases:[],
    execute(message, client){
        if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("You do not have permission to do that!")
        if(!message.guild.me.hasPermission("KICK_MEMBERS")) return message.channel.send("I don't have the correct permissions to do that.");
        var args = message.slice(client.config.prefix.length).split(/ +/).slice(1);
        if(args.length > 1) return message.channel.send("Too many arguments provided.");
        if(message.mentions.users.size > 1) return message.channel.send("Too many mentions");
        if(message.mentions.users.size== 0) return message.channel.send("You have to mention who you want to kick!");
        if(message.mentions.members.first().kickable) message.mentions.members.first().kick(); else message.channel.send("I don't have permission to kick that person.")
    }
}