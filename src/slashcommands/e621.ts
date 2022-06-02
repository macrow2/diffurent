import {SlashCommandBuilder} from '@discordjs/builders';
import {MessageEmbed, Interaction, MessageActionRow, MessageButton} from 'discord.js';
import { SlashCommand } from '../modules/Types';
import { getUserData, interactionQuickError, interactionQuickInfo } from '../modules/UtilFunctions';
import {E621Api} from '../modules/E621Api';
import Client from "../modules/Client";

const data = new SlashCommandBuilder()
    .setName('e621')
    .setDescription('Fetches a post from e621.net using the given tags')
    .addStringOption(option => option.setName("tags")
        .setDescription("The tags you want to use to fetch a post.")
        .setRequired(false)
    )
    .addIntegerOption(option => option.setName("page")
        .setDescription("The page you want to fetch.")
        .setRequired(false)
    );

const videoExts = ["mp4","mov","webm","avi","mkv","flv"]; // file extensions that are associated with videos

const exec = async (interaction: Interaction, client: Client) => {
    // typegaurds to make sure the data is the right type (so typescript doesn't yell at me)
    if(!interaction.isCommand()) return;
    if(!interaction.channel) return;
    if(interaction.channel.type !== "GUILD_TEXT") return;

    const tags = interaction.options.getString("tags") || ""
    let page = interaction.options.getInteger("page") || 1;
    let userData = getUserData(interaction.user, client);

    const api = new E621Api(userData.e621?.auth ? userData.e621.auth : undefined);

    try {
        let posts = await api.getPosts(tags.split(" "), 50, page);
        var postIndex = 0;
        const ratingMap = {
            "e": "Explicit",
            "q": "Questionable",
            "s": "Safe"
        }
        const firstPost = posts[postIndex];
        var lastAction: string = "";
        function createEmbed(action ?: string) : MessageEmbed {
            if(action) lastAction = action;
            const post = posts[postIndex];
            var nasty = (post.tags.general.includes("cub") || post.tags.general.includes("child") || post.tags.general.includes("loli")) && post.rating !== "s";
            if(!nasty) {
            if((post.rating == "e" || post.rating == "q") && interaction.channel?.type == "GUILD_TEXT" && interaction.channel.nsfw === false) return new MessageEmbed()
            .setTitle("NSFW Channel Required")
            .setDescription("This post is marked as NSFW, but this channel is not marked as NSFW. Please change the channel settings to mark this channel as NSFW.")
            .setColor("#ff0000")
            .setFooter({text: `Page ${page || 1}. Post ${postIndex + 1} of ${posts.length}`});
            const embed = new MessageEmbed()
                .setTitle('E621')
                .setURL(`https://e621.net/posts/${post.id}`)
                .setFooter({
                    text: `Page ${page || 1}. Post ${postIndex + 1} of ${posts.length}`,
                })
                // first 10 tags in a field
                .addField('Tags', post.tags.general.slice(0, 10).join(', '), false)
                .addField('Rating', ratingMap[post.rating], true)
                .addField('Score', `${post.score.up} ↑ | ${Number(post.score.down) * -1} ↓ | ${post.score.total} Total`, true)
                /*
                I do .split("_").join("\\_") to escape underscores in the tags so they dont get formatted as italics
                */
                if(post.tags.artist.length > 0) embed.addField(post.tags.artist.length == 1 ? "Artist" : "Artists", post.tags.artist.join(', ').split("_").join("\\_"), true)
                if(post.tags.character.length > 0) embed.addField(post.tags.character.length == 1 ? "Character" : "Characters", post.tags.character.join(', ').split("_").join("\\_"), true);
                if(post.tags.species.length > 0) embed.addField("Species", post.tags.species.join(', ').split("_").join("\\_"), true);
                if(action) embed.setAuthor({
                    "name": action,
                    "iconURL": "https://e621.net/favicon.ico"
                });
                if(!videoExts.includes(post.file.ext)) embed.setImage(post.file.url);
                else {
                    embed.setDescription(`This post is a video. [Click here to watch it](${post.file.url})`);
                }
                if(post.file.ext == "webm" && post.sample.has) embed.setImage(post.sample.url!);

            return embed;
            } else {
                const embed = new MessageEmbed()
                .setTitle('E621')
                .setColor("#ff0000")
                .setDescription("Sorry, this post violates our hard-coded block on loli/child/cub content that is not marked as safe. Please search for something else, or continue looking through posts.")
                .setFooter({
                    text: `Page ${page || 1}. Post ${postIndex + 1} of ${posts.length}`,
                })
                return embed;
            }
        }

        const row1 = new MessageActionRow()
            .addComponents( // server emojis since ios discord doesn't use twemoji
                new MessageButton()
                    .setEmoji("<:left:976638690870837348>")
                    .setCustomId("prev")
                    .setStyle("SECONDARY"),
                new MessageButton()
                    .setEmoji("<:right:976638690841473024>")
                    .setCustomId("next")
                    .setStyle("SECONDARY"),
                new MessageButton()
                    .setEmoji("<:star:976540353714876507>")
                    .setCustomId("favorite")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setEmoji("<:up:976638690501738517>")
                    .setCustomId("upvote")
                    .setStyle("SUCCESS")
                    .setDisabled(false),
                new MessageButton()
                    .setEmoji("<:down:976638927316328458>")
                    .setCustomId("downvote")
                    .setStyle("DANGER")
                    .setDisabled(false)
            )

            const row3 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setEmoji("<:pageleft:976671491087294495>")
                        .setCustomId("pageleft")
                        .setStyle("SECONDARY"),
                    new MessageButton()
                        .setEmoji("<:pageright:976671490802081883>")
                        .setCustomId("pageright")
                        .setStyle("SECONDARY")
                )

            const row2 = new MessageActionRow() // disabled buttons, used after timeout
            .addComponents( // server emojis since ios discord doesn't use twemoji
                new MessageButton()
                    .setEmoji("<:left:976638690870837348>")
                    .setCustomId("prev")
                    .setStyle("SECONDARY")
                    .setDisabled(true),
                new MessageButton()
                    .setEmoji("<:right:976638690841473024>")
                    .setCustomId("next")
                    .setStyle("SECONDARY")
                    .setDisabled(true),
                new MessageButton()
                    .setEmoji("<:star:976540353714876507>")
                    .setCustomId("favorite")
                    .setStyle("PRIMARY")
                    .setDisabled(true),
                new MessageButton()
                    .setEmoji("<:up:976638690501738517>")
                    .setCustomId("upvote")
                    .setStyle("SUCCESS")
                    .setDisabled(true),
                new MessageButton()
                    .setEmoji("<:down:976638927316328458>")
                    .setCustomId("downvote")
                    .setStyle("DANGER")
                    .setDisabled(true)
            )

            const row4 = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setEmoji("<:pageleft:976671491087294495>")
                        .setCustomId("pageleft")
                        .setStyle("SECONDARY")
                        .setDisabled(true),
                    new MessageButton()
                        .setEmoji("<:pageright:976671490802081883>")
                        .setCustomId("pageright")
                        .setStyle("SECONDARY")
                        .setDisabled(true)
                )
        
        interaction.reply({
            ephemeral: false,
            embeds: [createEmbed()],
            components: [row1, row3],
            fetchReply: true
        }).then ( (msg) => {
            
            const filter = (i:Interaction) => {
                return i.isButton() && i.channel!.id == interaction.channel!.id && i.message.id == msg.id
            };
            const collector = interaction.channel?.createMessageComponentCollector({ filter: filter, time: 60000 });

            collector?.on("end", () => {
                interaction.editReply({
                        embeds: [createEmbed(lastAction)],
                        components: [row2, row4]
                    });
            })

            collector?.on("collect", async (i) => {
                collector.resetTimer();
                switch(i.customId) {
                    case "prev":
                        postIndex--;
                        if(postIndex < 0) postIndex = posts.length - 1;
                        // update the embed
                        i.deferUpdate();
                        interaction.editReply({
                            embeds: [createEmbed()],
                            components: [row1, row3]
                        });
                    break;
                    case "next":
                        postIndex++;
                        if(postIndex >= posts.length) postIndex = 0;
                        // update the embed
                        i.deferUpdate();
                        interaction.editReply({
                            embeds: [createEmbed()],
                            components: [row1, row3]
                        });
                    break;
                    case "favorite":
                        var data = getUserData(i.user, client);
                        if(!data.e621?.auth) {
                            interactionQuickError(i, "You need to set up your e621 account first!", true);
                            break;
                        };
                        var api = new E621Api(data.e621.auth);
                        i.deferUpdate();
                        api.addFavorite(posts[postIndex].id).then((response) => {
                            interaction.editReply({
                                embeds: [createEmbed(`${i.user.username} ${response ? "added" : "removed"} this post ${response ? "to" : "from"} their favorites!`)],
                                components: [row1, row3]
                            });
                        })
                    break;
                    case "upvote":
                        var data = getUserData(i.user, client);
                        if(!data.e621?.auth) {
                            interactionQuickError(i, "You need to set up your e621 account first!", true);
                            break;
                        };
                        var api = new E621Api(data.e621.auth);
                        api.voteOnPost(posts[postIndex].id, 1).then((json) => {
                            posts[postIndex].score.up = json.up;
                            posts[postIndex].score.down = json.down;
                            posts[postIndex].score.total = json.score;
                            //interactionQuickInfo(i, `${json.our_score ? "Added" : "Removed"} upvote ${json.our_score ? "to" : "from"} post!`);
                            i.deferUpdate();
                            interaction.editReply({
                                embeds: [createEmbed(`${i.user.username} ${json.our_score ? "added" : "removed"} an upvote ${json.our_score ? "to" : "from"} this post!`)],
                                components: [row1, row3]
                            });
                        })
                    break;
                    case "downvote":
                        var data = getUserData(i.user, client);
                        if(!data.e621?.auth) {
                            interactionQuickError(i, "You need to set up your e621 account first!", true);
                            break;
                        }
                        var api = new E621Api(data.e621.auth);
                        api.voteOnPost(posts[postIndex].id, -1).then((json) => {
                            posts[postIndex].score.up = json.up;
                            posts[postIndex].score.down = json.down;
                            posts[postIndex].score.total = json.score;
                            //interactionQuickInfo(i, `${json.our_score ? "Added" : "Removed"} downvote ${json.our_score ? "to" : "from"} post!`);
                            i.deferUpdate();
                            interaction.editReply({
                                embeds: [createEmbed(`${i.user.username} ${json.our_score ? "added" : "removed"} a downvote ${json.our_score ? "to" : "from"} this post!`)],
                                components: [row1, row3]
                            });
                        })
                    break;
                    case "pageleft":
                        var data = getUserData(i.user, client);
                        var api = new E621Api(data.e621?.auth || undefined)
                        // @ts-ignore
                        if(page !== 1) page -=1;
                        posts = await api.getPosts(tags.split(" "), 50, page);
                        postIndex = 0;
                        i.deferUpdate();
                        interaction.editReply({
                            embeds: [createEmbed()],
                            components: [row1, row3]
                        });
                    break;
                    case "pageright":
                        var data = getUserData(i.user, client);
                        var api = new E621Api(data.e621?.auth || undefined)
                        // @ts-ignore
                        if(posts.length !< 50 || page !== 750)page +=1;
                        posts = await api.getPosts(tags.split(" "), 50, page);
                        postIndex = 0;
                        i.deferUpdate();
                        interaction.editReply({
                            embeds: [createEmbed()],
                            components: [row1, row3]
                        });
                }
            })

        })
    } catch (error) {
        console.log(error);
        return interactionQuickError(interaction, "Invalid tags!", true);
    }
}

const exportData: SlashCommand = {
    // @ts-ignore - Why is tsc bitching about this?
    // no idea why it's complaining but ts-ignore it is
    data: data,
    exec: exec
}

export default exportData;