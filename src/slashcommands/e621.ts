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
    const page = interaction.options.getInteger("page")
    let userData = getUserData(interaction.user, client);

    const api = new E621Api(userData.e621?.auth ? userData.e621.auth : undefined);

    try {
        const posts = await api.getPosts(tags.split(" "), 25, page || 1);
        var postIndex = 0;
        const ratingMap = {
            "e": "Explicit",
            "q": "Questionable",
            "s": "Safe"
        }
        const firstPost = posts[postIndex];
        function createEmbed() : MessageEmbed {
            const post = posts[postIndex];
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
                if(!videoExts.includes(post.file.ext)) embed.setImage(post.file.url);
                else {
                    embed.setDescription(`This post is a video. [Click here to watch it](${post.file.url})`);
                }
                if(post.file.ext == "webm" && post.sample.has) embed.setImage(post.sample.url!);

            return embed;
        }

        const row1 = new MessageActionRow()
            .addComponents( // server emojis since ios discord doesn't use twemoji
                new MessageButton()
                    .setEmoji("<:left:976302767847112755>")
                    .setCustomId("prev")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setEmoji("<:right:976302767859728394>")
                    .setCustomId("next")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setEmoji("<:star:976540353714876507>")
                    .setCustomId("favorite")
                    .setStyle("PRIMARY"),
                new MessageButton()
                    .setEmoji("<:up:976302767750656080>")
                    .setCustomId("upvote")
                    .setStyle("PRIMARY")
                    .setDisabled(false),
                new MessageButton()
                    .setEmoji("<:down:976302767700344882>")
                    .setCustomId("downvote")
                    .setStyle("PRIMARY")
                    .setDisabled(false)
            )

        if(((firstPost.rating == "e" || firstPost.rating == "q") && interaction.channel.nsfw) || firstPost.rating == "s") {
        
        interaction.reply({
            ephemeral: false,
            embeds: [createEmbed()],
            components: [row1],
            fetchReply: true
        }).then ( (msg) => {
            
            const filter = (i:Interaction) => {
                return i.isButton() && i.channel!.id == interaction.channel!.id && i.message.id == msg.id
            };
            const collector = interaction.channel?.createMessageComponentCollector({ filter: filter, time: 60000 });

            collector?.on("collect", (i) => {
                collector.resetTimer();
                switch(i.customId) {
                    case "prev":
                        postIndex--;
                        if(postIndex < 0) postIndex = posts.length - 1;
                        // update the embed
                        i.deferUpdate();
                        interaction.editReply({
                            embeds: [createEmbed()],
                            components: [row1]
                        });
                    break;
                    case "next":
                        postIndex++;
                        if(postIndex >= posts.length) postIndex = 0;
                        // update the embed
                        i.deferUpdate();
                        interaction.editReply({
                            embeds: [createEmbed()],
                            components: [row1]
                        });
                    break;
                    case "favorite":
                        if(!userData.e621?.auth) {
                            interactionQuickError(i, "You need to set up your e621 account first!", true);
                            break;
                        };
                        var api = new E621Api(userData.e621.auth);
                        api.addFavorite(posts[postIndex].id).then(() => {
                            interactionQuickInfo(i, `Added post ${posts[postIndex].id} to your favorites!`, true, "To remove it, you must go to the website and remove it there. (for now)");
                        })
                    break;
                    case "upvote":
                        if(!userData.e621?.auth) {
                            interactionQuickError(i, "You need to set up your e621 account first!", true);
                            break;
                        };
                        var api = new E621Api(userData.e621.auth);
                        api.voteOnPost(posts[postIndex].id, 1).then(() => {
                            interactionQuickInfo(i, `Upvoted post ${posts[postIndex].id}!`, true);
                        })
                    break;
                    case "downvote":
                        if(!userData.e621?.auth) {
                            interactionQuickError(i, "You need to set up your e621 account first!", true);
                            break;
                        }
                        var api = new E621Api(userData.e621.auth);
                        api.voteOnPost(posts[postIndex].id, -1).then(() => {
                            interactionQuickInfo(i, `Downvoted post ${posts[postIndex].id}!`, true);
                        })
                }
            })

        })
        
        } else interactionQuickError(interaction, `This post's rating is not appropriate for this channel. (${ratingMap[firstPost.rating]})`);
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