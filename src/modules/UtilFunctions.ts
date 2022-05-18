/*
A bunch of functions to make code shorter, and easier to read.
*/

import {Guild, User, GuildMember, Message, MessageEmbed, Interaction} from "discord.js";
import Client from "./Client";
import * as Types from "./Types";

export function getUserData(user: User, client: Client): Types.UserData {
    var possibleData = client.Users.filter(data => data.id == user.id)[0];
    // If user data exists, then just return that
    if (possibleData != null) return possibleData;
    // Create new user data and return that instead
    var newData: Types.UserData = {
        "type": "user",
        "id": user.id.toString(),
        "isBot": user.bot
    }
    var pushed = client.Users.push(newData);
    return client.Users[pushed - 1];
}

export function getServerData(server: Guild, client: Client): Types.ServerData {
    let possibleData = client.Servers.filter(data => data.id == server.id)[0];
    // If user data exists, then just return that
    if (possibleData != null) return possibleData;
    // Create new user data and return that instead
    let newData: Types.ServerData = {
        "type": "server",
        "id": server.id.toString()
    }
    let pushed = client.Servers.push(newData);
    return client.Servers[pushed - 1];
}

export function quickError(msg: Message, error: string): Promise<Message> {
    let embed = new MessageEmbed();
        embed.setTitle("Error");
        embed.setDescription(error);
        embed.setColor("#ff0000");
        return msg.reply({
            embeds: [embed],
            allowedMentions: {
                repliedUser: false
            }
        });
}

export function interactionQuickError(interaction: Interaction, error: string, empheral?: Boolean): Promise<Message> {
    let embed = new MessageEmbed();
        embed.setTitle("Error");
        embed.setDescription(error);
        embed.setColor("#ff0000");
        // @ts-ignore - Typescript thinks interaction could be a non-command interaction
        return interaction.reply({
            embeds: [embed],
            allowedMentions: {
                repliedUser: false
            },
            ephemeral: empheral || false
        });
}

export function interactionQuickInfo(interaction: Interaction, info: string, empheral?: Boolean, footer?: string): Promise<Message> {
    let embed = new MessageEmbed();
        embed.setTitle("Info");
        embed.setDescription(info);
        embed.setColor("#00ff00");
        if (footer) embed.setFooter({text: footer});
        // @ts-ignore - Typescript thinks interaction could be a non-command interaction
        return interaction.reply({
            embeds: [embed],
            allowedMentions: {
                repliedUser: false
            },
            ephemeral: empheral || false
        });
}

export function getContextualPrefix(msg: Message, client: Client): string {
    let serverData = getServerData(msg.guild!, client);
    if (serverData.prefix != null) {
        return serverData.prefix;
    } else {
        return client.config.prefix;
    }
}

export function quickArgs(msg: Message, client : Client): Array<string>{
    let args = msg.content.replace(getContextualPrefix(msg, client), "").split(" ");
    args.shift();
    return args;
}