class SuperEmbed {
    constructor() {
        this.emoji = null;

        this.author = {};
        this.color = 0x000000;
        this.description = "";
        this.fields = [],
        this.title = "";
        this.image = { url: null, proxy_url: null, height: null, width: null };
    }


    setAuthor(user) {
        this.author = { username: user.username, avatar: user.displayAvatarURL({ extensions: "webp", forceStatic: true, size: 512 }) };
        return this;
    }

    setColor(color) {
        this.color = Number(`0x${color}`);
        return this;
    }

    setDescription(description) {
        this.description = description;
        return this;
    }

    setEmoji(emoji) {
        this.emoji = emoji;
        return this;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    setFields(fields) {
        this.fields = fields.map(e => Object.assign({ name: "Vide.", value: "\u200b", inline: false }, { name: e[0], value: e[1], inline: e[2] }));
        return this;
    }

    setImage(image = { url: null, proxy_url: null, height: null, width: null }) {
        if (image.url !== null) this.image.url = image.url;
        if (image.proxy_url !== null) this.image.proxy_url = image.proxy_url;
        if (image.height !== null) this.image.height = image.height;
        if (image.width !== null) this.image.width = image.width;
        return this;
    }

    setStyle(style) {
        const allStyles = {
            "error": ["#ff2323", "❌"],
            "info": ["#5865f2", "ℹ️"],
            "outline": ["#2f3136", "💭"],
            "normal": ["#36393f", "💭"],
            "outage": ["#ff8016", "🟠"],
            "timeout": ["#fff399", "⏳"],
            "warning": ["#ffcf1b", "⚠️"],
            "success": ["#1bff3a", "✅"],
        };

        this.setColor(allStyles[style][0].replace("#", ""));
        this.setEmoji(allStyles[style][1]);
        return this;
    }

    get embed() {
        const toReturn = {
            author: {
                name: this.author.username,
                icon_url: this.author.avatar,
            },
            color: this.color,
            fields: this.fields,
        };

        if (this.title) toReturn.title = `${this.emoji} — ${this.title}`;
        if (this.description.length > 0) toReturn.description = this.description;
        if (this.image.url !== null) toReturn.image = this.image;
        return toReturn;
    }
}

module.exports = SuperEmbed;