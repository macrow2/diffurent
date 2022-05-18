import {SlashCommandBuilder} from '@discordjs/builders';
import {MessageEmbed, Interaction} from 'discord.js';
import { SlashCommand } from '../modules/Types';
import { getUserData, interactionQuickError } from '../modules/UtilFunctions';
import {E621Api} from '../modules/E621Api';
import Client from "../modules/Client";

const data = new SlashCommandBuilder()
    .setName('e621login')
    .setDescription('Logs in to e621 with your account in the bot')
    .addStringOption(option => option.setName("username")
            .setDescription("The username of the account you want to log in with.")
            .setRequired(true)
    )
    .addStringOption( option => 
        option.setName("api-key")
        .setDescription("Your e621.net API key. This is not the same as your password!")
        .setRequired(true)
        )
    .setDefaultPermission(true);

const exec = async (interaction: Interaction, client: Client) => {
    if(!interaction.isCommand()) return;
    const username = interaction.options.getString("username")
    const apikey = interaction.options.getString("api-key")
    let userData = getUserData(interaction.user, client);

    if(username == null || apikey == null) return interactionQuickError(interaction, "You must provide a username and api-key!", true);
    if(userData.e621 !== undefined) return interactionQuickError(interaction, "You are already logged in!\nSign out with /e621logout and then try again.", true);

    // test if the info is correct by fetching a cub post (yucky, but it works to test login)
    // we dont actually do anything with the post, just check if it works
    // todo: make this better so we dont have to fetch a cub post

    const api = new E621Api({
        username: username,
        apikey: apikey
    });

    try {
        const post = await api.getPosts(["cub", "rating:e"], 1, 1);
    } catch (error) {
        return interactionQuickError(interaction, "Invalid username or api-key!", true);
    }

    // if we get here, the login was successful
    
    if(userData.e621 === undefined) userData.e621 = {};

    userData.e621.auth = {
        username: username,
        apikey: apikey
    }

    const embed = new MessageEmbed()
        .setTitle('E621 Login')
        .setDescription('✅ You have now logged into E621!')

    interaction.reply({
        ephemeral: true,
        embeds: [embed]
    });
}

const exportData: SlashCommand = {
    data: data,
    exec: exec
}

export default exportData;