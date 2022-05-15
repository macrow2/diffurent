var discord = require("discord.js");
var ExtClient = require("../modules/Client");

/**
 * Execute the command
 * @param {discord.Message} message 
 * @param {ExtClient} client 
 */

function execute(message, client){
    /**
     * Error
     * @param {String} reason - The resason for the error
     */
    function error(reason){
        message.error(reason);
    }
    if(message.mentions.users.size == 0) return error("You need to mention someone!");
    if(message.mentions.users.size > 1)  return error("You can only send clicks to one person at a time");
    var args = message.content.split(/ +/).slice(1);
    if(args.length > 2) return error("Too many arguments provided.");
    if(args.length < 2) return error("Please specify how many clicks you want to send!");
    if(isNaN(args[1]))  return error(`Make sure you have the arguments in the correct order. \n It should be: ${message.prefix}payclick @usertopay amount`);
    var amountToPay = parseInt(args[1]);
    var userToPay = message.mentions.users.first();
    var toPayData = userToPay.getUserData();
    var userData = message.author.getUserData();
    if(!userData.games) return error("You don't have any clicks");
    if(!userData.games.clicker) return error("You don't have any clicks")
    if(userData.games.clicker.clicks < amountToPay) return error("You don't have enough clicks!");
    userData.games.clicker.clicks -= amountToPay;
    if(!toPayData.games) toPayData.games = {};
    if(!toPayData.games.clicker) toPayData.games.clicker = {clicks: 0};
    toPayData.games.clicker.clicks+=amountToPay
    var embed = new discord.MessageEmbed()
    .setTitle("Pay Clicks")
    .setFooter(message.author.tag, message.author.avatarURL())
    .setDescription(`Sent ${amountToPay} clicks to ${userToPay.username}`)
    .setColor("BLURPLE");
    message.reply({allowedMentions:{repliedUser:false}, embeds: [embed]})
}

module.exports = {
    name:"payclicks",
    aliases:["pc"],
    execute:execute
}