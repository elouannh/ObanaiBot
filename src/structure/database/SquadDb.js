const Enmap = require("enmap");

class SquadDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "squadDb" });
    }

    model(
        // obligatoire
        owner,
        // optionnel
        right_hand, name, quote,
    ) {
        const datas = {
            owner: owner,
            right_hand: "",
            leader: "",
            members: [],
            name: "Escouade sans nom",
            quote: "*Cette escouade n'a pas de citation.*",
            created: Date.now(),
            id: Number((Date.now() / 1000).toFixed(0)).toString(20),
        };

        if (right_hand !== null) datas.right_hand = right_hand;
        if (name !== null) datas.name = name;
        if (quote !== null) datas.quote = quote;

        return datas;
    }

    async create(owner, right_hand = null, name = null, quote = null) {
        const p = this.model(owner, right_hand, name, quote);
        this.db.set(owner, p);

        return this.db.get(owner);
    }

    async ensure(owner) {
        const p = this.model(owner, null, null, null);
        this.db.ensure(owner, p);

        return this.db.get(owner);
    }

    async get(owner, user = null) {
        this.ensure(owner);
        const s = await this.db.get(owner);

        function getXp(t, x) { return t.client.playerDb.db.get(x).exp; }
        s.leader = s.members.filter(m => m !== s.right_hand && m !== s.owner)?.sort((a, b) => getXp(this, b) - getXp(this, a))?.at(0) ?? "";

        this.db.set(owner, s.leader, "leader");

        for (const member of s.members) {
            if ((await this.client.playerDb.get(member)).squad === null) this.client.playerDb.db.set(member, s.owner, "squad");
        }

        if (user !== null) {
            if (!s.members.includes(owner)) {
                if (user === s.right_hand) {
                    this.db.push(owner, user, "members");
                }
                else if (user === s.owner) {
                    this.db.push(owner, user, "members");
                }
                else {
                    this.client.playerDb.db.set(user, null, "squad");
                }
            }
        }

        if (s.members.length > 8) {
            const users = [s.owner, s.right_hand];
            const kicked = [];

            for (const member of s.members) {
                if (users.length < 8) users.push(member);
                else kicked.push(member);
            }

            this.db.set(owner, users, "members");
            for (const kickedUser of kicked) {
                this.client.db.set(kickedUser, null, "squad");
            }
        }

        return s;
    }

    async createSquad(squadDatas) {
        this.db.set(squadDatas.owner, squadDatas);
        this.client.inventoryDb.db.math(squadDatas.owner, "-", 10000, "yens");
        this.client.playerDb.db.set(squadDatas.owner, squadDatas.owner, "squad");
        this.db.push(squadDatas.owner, squadDatas.owner, "members");

        return this.get(squadDatas.owner);
    }

    async deleteSquad(owner) {
        const s = await this.get(owner);

        s.members.forEach(async m => await this.client.playerDb.db.set(m, null, "squad"));
        this.db.set(owner, {});
    }

    async joinSquad(owner, user) {
        const s = await this.get(owner);

        this.db.push(s.owner, user, "members");
    }

    async isFull(owner) {
        const s = await this.get(owner);

        return s.members.length >= 8;
    }

    async leaveSquad(owner, user) {
        const s = await this.get(owner);

        const members = s.members.filter(m => m !== user);
        this.db.set(s.owner, members, "members");
    }

    async hasPlayer(owner, user) {
        const s = await this.get(owner);

        return s.members.includes(user);
    }

    async findUser(id) {
        let correspondingSquad = null;

        for (const squad of Array.from(this.db.values())) {
            if (squad.members.includes(id)) correspondingSquad = squad;
        }

        return correspondingSquad;
    }

    async promote(owner, user) {
        this.db.set(owner, user, "right_hand");

        return await this.get(owner);
    }

    async demote(owner) {
        this.db.set(owner, "", "right_hand");

        return await this.get(owner);
    }

    async rename(owner, name) {
        this.db.set(owner, name, "name");

        return await this.get(owner);
    }

    async changeQuote(owner, quote) {
        this.db.set(owner, quote, "quote");

        return await this.get(owner);
    }
}

module.exports = { SquadDb };