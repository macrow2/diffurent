import {Interaction, Message} from "discord.js";
import {SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder} from '@discordjs/builders';
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
        auth?: {
            username: string,
            apikey: string
        }
        blacklist?: string[]
    }
}

export type ServerData = {
    id: string,
    type: "server",
    prefix?: string,
    rooms?: {
        header: string // the category channel header that holds all rooms
        rooms: Array<{
            owner: string // user id
            id: string // channel id
            coOwners?: Array<string> // array of user ids that have co-ownership.
        }>
    }
}

export type Config = {
    prefix: string,
    token: string,
    ownerID: string,
    testGuildId: string,
    botID: string,
    commandRegisterType: "global" | "local"
    typesense: {
        enabled: boolean
        host: string
        port: number
        protocol: string
        apiKey: string
      }
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
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder
    exec: (interaction: Interaction, client: Client) => void | Promise<Message | undefined>
}

export type E6QueueItem = Promise<E6Types.Post>;
