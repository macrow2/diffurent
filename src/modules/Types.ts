import {Message} from "discord.js";
import Client from "./Client";

export type UserData = {
    id: string,
    type: "user",
    isBot: boolean,
    games?: {
        clicker?: {
            clicks: number
        }
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
    coOwnerID: string
}

export type Command = {
    name: string,
    aliases: Array<string>,
    description: string,
    category: string,
    execute: (msg: Message, client: Client) => void | Promise<Message>
    hidden: boolean /* hides the command from help */
}
