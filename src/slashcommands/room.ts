import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageEmbed, Interaction } from "discord.js";
import { SlashCommand } from "../modules/Types";
import { getServerData, interactionQuickError } from "../modules/UtilFunctions";
import Client from "../modules/Client";

// this isnt my usual formatting style, its bc I used vscode prettify after writing it,
// and then reloaded the window.
// im stuck with this formatting now.
// its still readable but is def different from every other bit of code ive wrote here

const data = new SlashCommandBuilder()
    .setName("room")
    .addSubcommand((sub) =>
        sub.setName("create").setDescription("Create a room.")
    )
    .addSubcommand((sub) =>
        sub
            .setName("add")
            .setDescription("Add a user to the room.")
            .addUserOption((u) =>
                u
                    .setDescription("The user you want to add to the room.")
                    .setRequired(true)
                    .setName("target")
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName("remove")
            .setDescription(
                "Removes a user from the current room. Requires room ownership or co-ownership."
            )
            .addUserOption((u) =>
                u
                    .setName("target")
                    .setDescription(
                        "The user you want to remove from the room."
                    )
                    .setRequired(true)
            )
    )
    .addSubcommandGroup((subg) =>
        subg
            .setName("edit")
            .setDescription(
                "Edits the current room. Must be room owner to use."
            )
            .addSubcommand((sub) =>
                sub
                    .setName("nsfw")
                    .setDescription(
                        "Changes the NSFW status of the room. If you are under 18, this will lock you out of the channel."
                    )
                    .addBooleanOption((o) =>
                        o
                            .setName("status")
                            .setDescription(
                                "The NSFW status the room will be changed to."
                            )
                            .setRequired(true)
                    )
            )
            .addSubcommand((sub) =>
                sub
                    .setName("name")
                    .setDescription("Changes the name of the room.")
                    .addStringOption((o) =>
                        o
                            .setName("name")
                            .setDescription("The new name for the room.")
                            .setRequired(true)
                    )
            )
            .addSubcommand((sub) =>
                sub
                    .setName("topic")
                    .setDescription("Changes the topic of the room.")
                    .addStringOption((o) =>
                        o
                            .setName("topic")
                            .setDescription("The new topic for the room.")
                            .setRequired(true)
                    )
            )
    )
    // TODO: come back to this and implement, not needed as of now, may implement if the bot actually gets some public usage
    /*.addSubcommandGroup(subgroup => 
        subgroup.setName("options")
        .setDescription("Options for server owners and admins.")
        .addSubcommand( sub => 
            sub.setName("maxRooms")
            .setDescription("Sets the amount of rooms one user can have. Default 1.")
            )
        )*/
    .setDescription(
        "Create and manage a room, a semi-private space within a server for whatever you want."
    );

const exec = (interaction: Interaction, client: Client) => {
    if (!interaction.isCommand()) return;
    if (!interaction.guild) return;
    let serverData = getServerData(interaction.guild, client);
    switch (interaction.options.getSubcommand()) {
        case "create":
            // this was a nightmare to make, this code is not sane at all but should work.
            if (!serverData.rooms) {
                // TODO: once i add settings, i need to also implement a check to make sure that
                // makes sure that server owners are ok with users creating rooms, and also
                // maybe implement some options for more than one owned room per user

                // check if we can create the rooms header
                if (
                    !interaction.guild.me?.permissions.has("MANAGE_CHANNELS") ||
                    !interaction.guild.me?.permissions.has("MANAGE_ROLES")
                ) {
                    // throw error
                    const embed = new MessageEmbed()
                        .setTitle("Ut oh!")
                        .setDescription(
                            "Looks like I don't have permission to create channels in this server." +
                                "Ask a server admin to make sure I have the **Manage Channels** permission for you to use this command."
                        )
                        .setColor("RED");

                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                    });
                    break;
                }

                // if we got to here, were in the clear permissions-wise

                // create rooms header
                interaction.guild.channels
                    .create("rooms", {
                        type: "GUILD_CATEGORY",
                    })
                    .then((header) => {
                        // typegaurds, again for some reason
                        if (!interaction.guild || !interaction.guild.me) return;

                        header
                            .createChannel(
                                interaction.user.username.toLowerCase(),
                                {
                                    type: "GUILD_TEXT",
                                    reason:
                                        "Creating private room for " +
                                        interaction.user.username +
                                        ".",
                                    permissionOverwrites: [
                                        {
                                            allow: ["VIEW_CHANNEL"],
                                            id: interaction.user.id,
                                        },
                                        {
                                            allow: [
                                                "VIEW_CHANNEL",
                                                "MANAGE_ROLES",
                                            ],
                                            id: interaction.guild.me.roles
                                                .botRole!.id,
                                        },
                                        {
                                            deny: ["VIEW_CHANNEL"],
                                            id: interaction.guild.roles.everyone
                                                .id,
                                        },
                                    ],
                                }
                            )
                            .then((room) => {
                                room.send({
                                    embeds: [
                                        new MessageEmbed()
                                            .setTitle("Welcome!")
                                            .setColor("AQUA")
                                            .setDescription(
                                                "Welcome to your personal room. You can do anything you want in here, " +
                                                    "but just know that admins can see what you're doing, so keep it within server rules." +
                                                    "\nWant to add your friends? Do /room add @friendsName to add them to the room."
                                            ),
                                    ],
                                    content: "<@" + interaction.user.id + ">",
                                });

                                serverData.rooms = {
                                    header: header.id,
                                    rooms: [
                                        {
                                            owner: interaction.user.id,
                                            id: room.id,
                                        },
                                    ],
                                };

                                interaction.reply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setTitle("Done!")
                                            .setDescription(
                                                "Created your private room: <#" +
                                                    room.id +
                                                    ">"
                                            )
                                            .setColor("GREEN"),
                                    ],
                                    ephemeral: true,
                                });
                            });
                    });
            } else {
                // double check we got those perms
                if (
                    !interaction.guild.me?.permissions.has("MANAGE_CHANNELS") ||
                    !interaction.guild.me?.permissions.has("MANAGE_ROLES")
                ) {
                    // throw error
                    const embed = new MessageEmbed()
                        .setTitle("Ut oh!")
                        .setDescription(
                            "Looks like I don't have permission to create channels in this server." +
                                "Ask a server admin to make sure I have the **Manage Channels** permission for you to use this command."
                        )
                        .setColor("RED");

                    interaction.reply({
                        embeds: [embed],
                        ephemeral: true,
                    });
                    break;
                }

                var existingRoom = serverData.rooms.rooms.find(
                    (r) => r.owner == interaction.user.id
                );
                if (existingRoom !== undefined) {
                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Woops!")
                                .setDescription(
                                    "Looks like you already have a room: <#" +
                                        existingRoom.id +
                                        ">" +
                                        "\nIf your room was manually deleted by a staff member, try this command again."
                                ),
                        ],
                        ephemeral: true,
                    });
                    interaction.guild.channels
                        .fetch(existingRoom.id)
                        .then((possibleExistingRoom) => {
                            // if we got here, their room exists
                        })
                        .catch((err) => {
                            // if we got here, their room doesnt exist anymore... thats a problem
                            if (existingRoom !== undefined)
                                serverData.rooms?.rooms.splice(
                                    serverData.rooms.rooms.indexOf(existingRoom)
                                );
                        });
                    break;
                }

                interaction.guild.channels
                    .fetch(serverData.rooms.header)
                    .then((header) => {
                        if (!header || header.type !== "GUILD_CATEGORY") {
                            const embed = new MessageEmbed()
                                .setTitle("Ut oh!")
                                .setDescription(
                                    "Looks like one of your server admins broke something... I can't find the rooms category that should be there. Ask a server admin to run /rooms reset to fully reset the bots memory of rooms. Until then, rooms are broken."
                                )
                                .setColor("RED");

                            interaction.reply({
                                embeds: [embed],
                                ephemeral: true,
                            });
                            return;
                        }

                        // typegaurds pt 2
                        if (!interaction.guild || !interaction.guild.me) return;

                        header
                            .createChannel(
                                interaction.user.username.toLowerCase(),
                                {
                                    type: "GUILD_TEXT",
                                    reason:
                                        "Creating private room for " +
                                        interaction.user.username +
                                        ".",
                                    permissionOverwrites: [
                                        {
                                            allow: ["VIEW_CHANNEL"],
                                            id: interaction.user.id,
                                        },
                                        {
                                            allow: [
                                                "VIEW_CHANNEL",
                                                "MANAGE_ROLES",
                                            ],
                                            id: interaction.guild.me.roles
                                                .botRole!.id,
                                        },
                                        {
                                            deny: ["VIEW_CHANNEL"],
                                            id: interaction.guild.roles.everyone
                                                .id,
                                        },
                                    ],
                                }
                            )
                            .then((room) => {
                                room.send({
                                    embeds: [
                                        new MessageEmbed()
                                            .setTitle("Welcome!")
                                            .setColor("AQUA")
                                            .setDescription(
                                                "Welcome to your personal room. You can do anything you want in here, " +
                                                    "but just know that admins can see what you're doing, so keep it within server rules." +
                                                    "\nWant to add your friends? Do /room add @friendsName to add them to the room."
                                            ),
                                    ],
                                    content: "<@" + interaction.user.id + ">",
                                });

                                serverData.rooms?.rooms.push({
                                    id: room.id,
                                    owner: interaction.user.id,
                                });

                                interaction.reply({
                                    embeds: [
                                        new MessageEmbed()
                                            .setTitle("Done!")
                                            .setDescription(
                                                "Created your private room: <#" +
                                                    room.id +
                                                    ">"
                                            )
                                            .setColor("GREEN"),
                                    ],
                                    ephemeral: true,
                                });
                            });
                    });
            }
            break;
        case "add":
            // typeguardios
            if (!interaction.channel) break;

            var theirRoom = serverData.rooms?.rooms.find(
                (r) => r.owner === interaction.user.id
            );
            var currentRoom = serverData.rooms?.rooms.find(
                (c) => c.id === interaction.channel?.id
            );
            var mentioned = interaction.options.getUser("target", true);

            if (
                theirRoom === currentRoom ||
                currentRoom?.coOwners?.includes(interaction.user.id)
            ) {
                // its their room, add the mentioned user

                interaction.guild.members.fetch(mentioned).then((member) => {
                    // guess what?
                    // more typeguards...

                    if (
                        !interaction.channel ||
                        interaction.channel.type !== "GUILD_TEXT"
                    )
                        return;

                    if (
                        interaction.channel
                            .permissionsFor(member)
                            .has("VIEW_CHANNEL")
                    ) {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Whoops!")
                                    .setDescription(
                                        "Looks like that user is already in this private room.\nDid you mean to do `/room remove`?"
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });
                        return;
                    }

                    interaction.channel.permissionOverwrites
                        .create(interaction.options.getUser("target", true), {
                            VIEW_CHANNEL: true,
                            SEND_MESSAGES: true,
                        })
                        .then((channel) => {
                            interaction.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Success!")
                                        .setDescription(
                                            "Added <@" +
                                                interaction.options.getUser(
                                                    "target",
                                                    true
                                                ).id +
                                                "> to the room!"
                                        )
                                        .setColor("GREEN"),
                                ],
                            });
                        })
                        .catch((err) => {
                            interaction.reply({
                                embeds: [
                                    new MessageEmbed()
                                        .setTitle("Whoops...")
                                        .setDescription(
                                            "Looks like I dont have permission to add users to this channel. " +
                                                "Please contact a server admin and ask them to make sure I have the **Manage Channels** permisison."
                                        )
                                        .setColor("RED"),
                                ],
                            });
                        });
                });
            } else if (
                currentRoom &&
                !currentRoom.coOwners?.includes(interaction.user.id)
            ) {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This room isn't yours, it belongs to <@" +
                                    currentRoom.owner +
                                    ">! Ask them to make you a Co-Owner if you want to add users to this room."
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            } else if (!currentRoom) {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This isn't a private room! You can create one for yourself with `/room create`"
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            }
            break;
        case "remove":
            // typeguardios again
            if (
                interaction.channel === null ||
                interaction.channel.type !== "GUILD_TEXT"
            )
                break;

            var theirRoom = serverData.rooms?.rooms.find(
                (r) => r.owner === interaction.user.id
            );
            var currentRoom = serverData.rooms?.rooms.find(
                (c) => c.id === interaction.channel?.id
            );
            var mentioned = interaction.options.getUser("target", true);

            if (
                theirRoom === currentRoom ||
                currentRoom?.coOwners?.includes(interaction.user.id)
            ) {
                // does the mentioned user have access to this channel
                // get the member
                interaction.guild.members.fetch(mentioned).then((member) => {
                    // typeguardios, again...
                    if (
                        interaction.channel === null ||
                        interaction.channel.type !== "GUILD_TEXT"
                    )
                        return;

                    if (
                        !interaction.channel
                            .permissionsFor(member)
                            .has("VIEW_CHANNEL")
                    ) {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Whoops!")
                                    .setDescription(
                                        "Looks like that user is not in this private room.\nDid you mean to do `/room add`?"
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });
                        return;
                    }

                    // make sure they're not trying to remove the bot from the channel
                    // if the bot doesn't have admin, wont be able to manage it anymore
                    // so prevent the user from doing that
                    if (mentioned.id === client.user?.id) {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Whoops!")
                                    .setDescription(
                                        "Looks like your trying to remove me (<@" +
                                            client.user.id +
                                            ">) from the room. If you remove me from the room, I won't be able to manage it for you anymore!"
                                    )
                                    .setColor("RED"),
                            ],
                            ephemeral: true,
                        });
                        return;
                    }

                    // remove user
                    interaction.channel.permissionOverwrites.delete(member);
                    interaction.reply({
                        embeds: [
                            new MessageEmbed()
                                .setTitle("Success!")
                                .setDescription(
                                    "Removed <@" +
                                        member.user.id +
                                        "> from the room!"
                                )
                                .setColor("GREEN"),
                        ],
                    });
                });
            } else if (
                currentRoom &&
                !currentRoom.coOwners?.includes(interaction.user.id)
            ) {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This room isn't yours, it belongs to <@" +
                                    currentRoom.owner +
                                    ">! Ask them to make you a Co-Owner if you want to remove users from this room."
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            } else if (!currentRoom) {
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This isn't a private room! You can create one for yourself with `/room create`"
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            }
            break;
        case "name":
            // what time is it?
            // its typeguard time!!!
            if (
                interaction.channel === null ||
                interaction.channel.type !== "GUILD_TEXT"
            )
                break;

            var theirRoom = serverData.rooms?.rooms.find(
                (r) => r.owner === interaction.user.id
            );
            var currentRoom = serverData.rooms?.rooms.find(
                (c) => c.id === interaction.channel?.id
            );

            if (theirRoom === currentRoom) {
                // its their room, change the stuff
                var newname = interaction.options.getString("name", true);
                interaction.channel
                    .setName(newname)
                    .then((channel) => {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Success!")
                                    .setDescription(
                                        "Set the room title to: `" +
                                            newname +
                                            "`"
                                    )
                                    .setColor("GREEN"),
                            ],
                        });
                    })
                    .catch((err) => {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Ut oh")
                                    .setDescription(
                                        "I ran into an error while trying to run that command. Ask an admin to make sure I have the **Manage Channels** permission"
                                    ),
                            ],
                            ephemeral: true,
                        });
                    });
            } else if (currentRoom) {
                // its in a room, but not theirs, show error
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This room isn't yours, it belongs to <@" +
                                    currentRoom.owner +
                                    ">!"
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            } else {
                // its not in a room, show error
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This isn't a private room! You can create one for yourself with `/room create`"
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            }
            break;
        case "topic":
            if (
                interaction.channel === null ||
                interaction.channel.type !== "GUILD_TEXT"
            )
                break;

            var theirRoom = serverData.rooms?.rooms.find(
                (r) => r.owner === interaction.user.id
            );
            var currentRoom = serverData.rooms?.rooms.find(
                (c) => c.id === interaction.channel?.id
            );

            if (theirRoom === currentRoom) {
                // its their room, change the stuff
                var newtopic = interaction.options.getString("topic", true);
                interaction.channel
                    .setTopic(newtopic)
                    .then((channel) => {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Success!")
                                    .setDescription(
                                        "Set the room topic to: `" +
                                            newtopic +
                                            "`"
                                    )
                                    .setColor("GREEN"),
                            ],
                        });
                    })
                    .catch((err) => {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Ut oh")
                                    .setDescription(
                                        "I ran into an error while trying to run that command. Ask an admin to make sure I have the **Manage Channels** permission"
                                    ),
                            ],
                            ephemeral: true,
                        });
                    });
            } else if (currentRoom) {
                // its in a room, but not theirs, show error
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This room isn't yours, it belongs to <@" +
                                    currentRoom.owner +
                                    ">!"
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            } else {
                // its not in a room, show error
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This isn't a private room! You can create one for yourself with `/room create`"
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            }
            break;
        case "nsfw":
            if (
                interaction.channel === null ||
                interaction.channel.type !== "GUILD_TEXT"
            )
                break;

            var theirRoom = serverData.rooms?.rooms.find(
                (r) => r.owner === interaction.user.id
            );
            var currentRoom = serverData.rooms?.rooms.find(
                (c) => c.id === interaction.channel?.id
            );

            if (theirRoom === currentRoom) {
                // its their room, change the stuff
                var newstatus = interaction.options.getBoolean("status", true);
                interaction.channel
                    .setNSFW(newstatus)
                    .then((channel) => {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Success!")
                                    .setDescription(
                                        "Set the room NSFW Status to " +
                                            newstatus +
                                            "."
                                    )
                                    .setColor("GREEN"),
                            ],
                        });
                    })
                    .catch((err) => {
                        interaction.reply({
                            embeds: [
                                new MessageEmbed()
                                    .setTitle("Ut oh")
                                    .setDescription(
                                        "I ran into an error while trying to run that command. Ask an admin to make sure I have the **Manage Channels** permission"
                                    ),
                            ],
                            ephemeral: true,
                        });
                    });
            } else if (currentRoom) {
                // its in a room, but not theirs, show error
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This room isn't yours, it belongs to <@" +
                                    currentRoom.owner +
                                    ">!"
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            } else {
                // its not in a room, show error
                interaction.reply({
                    embeds: [
                        new MessageEmbed()
                            .setTitle("Hang on a minute!")
                            .setDescription(
                                "This isn't a private room! You can create one for yourself with `/room create`"
                            )
                            .setColor("RED"),
                    ],
                    ephemeral: true,
                });
            }
            break;
    }
};

const exportData: SlashCommand = {
    data: data,
    exec: exec,
};

export default exportData;
