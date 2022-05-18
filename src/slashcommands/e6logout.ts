import {SlashCommandBuilder} from '@discordjs/builders';
import {MessageEmbed, Interaction} from 'discord.js';
import { SlashCommand } from '../modules/Types';
import { getUserData, interactionQuickError, interactionQuickInfo } from '../modules/UtilFunctions';
import {E621Api} from '../modules/E621Api';
import Client from "../modules/Client";

const data = new SlashCommandBuilder()
    .setName('e621logout')
    .setDescription('Logs out of e621, deleting your credentials')

const exec = async (interaction: Interaction, client: Client) => {
    if(!interaction.isCommand()) return;
    if(!interaction.channel) return;
    if(interaction.channel.type !== "GUILD_TEXT") return;

    const userData = getUserData(interaction.user, client);
    if(!userData.e621?.auth) {
        interactionQuickError(interaction, "You are not logged in to e621");
        return;
    }

    delete userData.e621.auth;
    return interactionQuickInfo(interaction, "You have been logged out of e621", true);
}

const command: SlashCommand = {
    data,
    exec
}

export default command;