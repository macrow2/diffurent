import {SlashCommandBuilder} from '@discordjs/builders';
import {MessageEmbed, Interaction} from 'discord.js';
import { SlashCommand } from '../modules/Types';
import { getUserData, interactionQuickError } from '../modules/UtilFunctions';
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

const exec = async (interaction: Interaction, client: Client) => {
    // typegaurds to make sure the data is the right type (so typescript doesn't yell at me)
    if(!interaction.isCommand()) return;
    if(!interaction.channel) return;
    if(interaction.channel.type !== "GUILD_TEXT") return;

    const tags = interaction.options.getString("tags") || ""
    const page = interaction.options.getInteger("page")
    let userData = getUserData(interaction.user, client);

    const api = new E621Api(userData.e621 ? {
        username: userData.e621.username,
        apikey: userData.e621.apikey
    } : undefined);

    try {
        const posts = await api.getPosts(tags.split(" "), 25, page || 1);
        var postIndex = 0;
        const post = posts[postIndex];
        const ratingMap = {
            "e": "Explicit",
            "q": "Questionable",
            "s": "Safe"
        }
        const embed = new MessageEmbed()
            .setTitle('E621')
            .setDescription(`https://e621.net/posts/${post.id}`)
            .setImage(post.file.url)
            .setFooter({
                text: `Page ${page || 1}. Post ${postIndex + 1} of ${posts.length}`,
            })
            // first 10 tags in a field
            .addField('Tags', post.tags.general.slice(0, 10).join(', '), true)
            .addField('Rating', ratingMap[post.rating], true)
            .addField('Score', `${post.score.up} ↑ | ${Number(post.score.down) * -1} ↓ | ${post.score.total} Total`, true)
            if(post.tags.artist.length > 0) embed.addField(post.tags.artist.length == 1 ? "Artist" : "Artists", post.tags.artist.join(', '), true)
            if(post.tags.character.length > 0) embed.addField(post.tags.character.length == 1 ? "Character" : "Characters", post.tags.character.join(', '), true);
            if(post.tags.species.length > 0) embed.addField("Species", post.tags.species.join(', '), true);

        if(((post.rating == "e" || post.rating == "q") && interaction.channel.nsfw) || post.rating == "s") {
        interaction.reply({
            ephemeral: false,
            embeds: [embed]
        });
        } else interactionQuickError(interaction, `This post's rating is not appropriate for this channel. (${ratingMap[post.rating]})`);
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