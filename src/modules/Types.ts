import {Interaction, Message} from "discord.js";
import {SlashCommandBuilder} from '@discordjs/builders';
import Client from "./Client";
import * as E6Types from "./E621Api";

export type UserData = {
    id: string,
    type: "user",
    isBot: boolean,
    games?: {
        clicker?: {
            clicks: number
        }
    },
    e621?: {
        username: string,
        apikey: string
    }
}

export type ServerData = {
    id: string,
    type: "server",
    prefix?: string
}

export type Config = {
    prefix: string,
    token: string,
    ownerID: string,
    coOwnerID: string,
    testGuildId: string,
    botID: string
}

export type Command = {
    name: string,
    aliases: Array<string>,
    description: string,
    category: string,
    execute: (msg: Message, client: Client) => void | Promise<Message>
    hidden: boolean /* hides the command from help */
}

export type SlashCommand = {
    data: SlashCommandBuilder
    exec: (interaction: Interaction, client: Client) => void | Promise<Message | undefined>
}

export type E6QueueItem = Promise<E6Types.Post>;
