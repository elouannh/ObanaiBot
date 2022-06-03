const Enmap = require("enmap");

class GuildDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "guildDb" });
    }

    model(
        // obligatoire
        guild,
        // optionnel
        prefix,
    ) {
        const datas = {
            id: guild,
            prefix: "d!",
        };

        if (prefix !== null) datas.prefix = prefix;

        return datas;
    }

    async validPrefix(prefix = "") {
        let r = prefix.match(new RegExp("[a-z]{0,1}?[!?.:;,]", "dg"));
        if (r !== null) if (r.length > 0) r = r[0];
        return r;
    }

    async create(guild, prefix = null) {
        const p = this.model(guild, prefix);
        this.db.set(guild, p);

        return this.db.get(guild);
    }

    async ensure(guild) {
        const p = this.model(guild, null);
        this.db.ensure(guild, p);

        return this.db.get(guild);
    }

    async get(guild) {
        this.ensure(guild);

        return this.db.get(guild);
    }

    async changePrefix(guild, prefix) {
        const p = this.model(guild, null);
        this.db.ensure(guild, p);
        await this.db.set(guild, prefix, "prefix");
    }
}

module.exports = { GuildDb };