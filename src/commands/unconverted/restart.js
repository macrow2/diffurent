const discord = require("discord.js");

module.exports = {
    name:"restart",
    aliases:["shutdown"],
    execute: function(message, client){
        var args = message.content.split(/ +/).slice(1);
        if(message.author.id !== client.config.ownerID && message.author.id !== client.config.coOwnerID){
            var embed = new discord.MessageEmbed()
            .setTitle("Permission Denied")
            .setDescription("Unfortunately, it appears you dont have access to this command.")
            .setColor("RED")
            .setAuthor(message.member.displayName, message.author.avatarURL())
        }
    }
}