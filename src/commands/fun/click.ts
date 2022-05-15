// First command properly using the getUserData function I created.
import * as util from "../../modules/UtilFunctions"
import {Message, MessageEmbed} from "discord.js"
import Client from "../../modules/Client"
import {Command} from "../../modules/Types"


/**
 * Execute the command
 */

function execute(message: Message, client: Client){
    var userData = util.getUserData(message.author, client);
    if(!userData.games) userData.games = {};
    if(!userData.games.clicker) userData.games.clicker = {clicks:0};
    userData.games.clicker.clicks++;
    var clicks = userData.games.clicker.clicks
    var embed = new MessageEmbed()
    .setTitle("Click")
    .setFooter(message.member!.displayName,message.author.avatarURL()!)
    .setDescription(`Your clicks are now at ${clicks}!`)
    .setColor("RANDOM")
    message.reply({allowedMentions: {repliedUser: false}, embeds: [embed]})
}

const commandJson:Command = {
    name:"click",
    aliases: ["c"],
    execute: execute,
    description: "A simple clicker game, everytime you do {prefix}click your clicks counter will go up 1.",
    category: "fun",
    hidden:false
}

export default commandJson;