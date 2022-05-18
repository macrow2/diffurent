const snek = require("snekfetch");

type Credentials = {
    username: string;
    apikey: string;
}

export type Post = {
    blacklisted: boolean;
    id: number;
    created_at: string;
    updated_at: string;
    file: {
        url: string;
        width: number;
        height: number;
        ext: string;
        md5: string;
        size: number;
    },
    preview: {
        url: string;
        width: number;
        height: number;
    },
    sample: {
        has : boolean;
        url: string | null;
        width: number | null;
        height: number | null;
    },
    score: {
        up: number;
        down: number;
        total: number;
    },
    tags: {
        general: string[];
        species: string[];
        character: string[];
        copyright: string[];
        artist: string[];
        invalid: string[];
        lore: string[];
        meta: string[];
        locked_tags: string[];
        change_seq: number;
    },
    flags: {
        pending: boolean;
        flagged: boolean;
        note_locked: boolean;
        status_locked: boolean;
        rating_locked: boolean;
        deleted: boolean;
    },
    rating: "e" | "q" | "s";
    fav_count: number;
    sources: string[];
    pools: string[];
    relationships: {
        parent_id: number | null;
        has_children: boolean;
        has_active_children: boolean;
        children: number[];
    },
    approver_id: number | null;
    uploader_id: number;
    description: string;
    comment_count: number;
    is_favorited: boolean;
    has_notes: boolean;
    duration: number | null;
}

export class E621Api {
    private credentials: Credentials | undefined;
    constructor(creds?: Credentials) {
        this.credentials = creds || undefined;
    }
    public async getPost(id: number): Promise<Post> {
        const res = await snek.get(`https://e621.net/posts/${id}.json`);
        return res.body;
    }
    public async getPosts(tags: string[], limit?: number, page?: number, blacklist?: string[]): Promise<Post[]> {
        const res = 
        this.credentials ? 
        await snek.get(`https://e621.net/posts.json?tags=${tags.join(" ")}&limit=${limit || 100}&page=${page || 1}`)
        .set("Authorization", `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.apikey}`).toString("base64")}`)
        : await snek.get(`https://e621.net/posts.json?tags=${tags.join(" ")}&limit=${limit || 100}&page=${page || 1}`)
        // messy, but it works
        
        const posts: Post[] = res.body.posts;
        posts.forEach((post: Post) => {
            var blacklisted = false;
            if(!blacklist) return post.blacklisted = false;
            Object.keys(post.tags).forEach((tag: string) => {
                // @ts-ignore
                var tag_list = post.tags[tag];
                blacklist.forEach(
                    (blacklisted_tag: string) => {
                        if (tag_list.includes(blacklisted_tag)) {
                            blacklisted = true;
                        }
                    }
                )
            })
            if(blacklisted) post.blacklisted = true; else post.blacklisted = false;
        });
        return posts;
    }
    public async voteOnPost(id: number, vote: -1 | 1): Promise<void> {
        if(!this.credentials) throw new Error("No credentials provided");
        const res = await snek.post(`https://e621.net/posts/${id}/vote.json?score=${vote}`)
        .set("Authorization", `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.apikey}`).toString("base64")}`)
    }
    public async addFavorite(id: number): Promise<void> {
        if(!this.credentials) throw new Error("No credentials provided");
        const res = await snek.post(`https://e621.net/favorites.json`)
        .set("Authorization", `Basic ${Buffer.from(`${this.credentials.username}:${this.credentials.apikey}`).toString("base64")}`)
        .send({
            "post_id": id
        });
    }
}

export default E621Api;