import {SlashCommandBuilder} from '@discordjs/builders';
import {MessageEmbed, Interaction} from 'discord.js';
import { SlashCommand } from '../modules/Types';
import Client from "../modules/Client";

const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows this message')
    .setDefaultPermission(true);

const exec = (interaction: Interaction, client: Client) => {
    if(!interaction.isCommand()) return;
    const embed = new MessageEmbed()
        .setTitle('Help')
        .setDescription('This is a list of commands for this bot.')
        .addField('`help`', '<:down:975586527625224212> Shows this message')

    interaction.reply({
        ephemeral: false,
        embeds: [embed]
    });
}

const exportData: SlashCommand = {
    data: data,
    exec: exec
}

export default exportData;