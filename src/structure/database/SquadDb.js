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
            members: [owner],
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

    async ensure(owner) {
        const p = this.model(owner, null, null, null);
        this.db.ensure(owner, p);

        return this.db.get(owner);
    }

    async get(owner) {
        const s = await this.ensure(owner);

        if (s === null || s === undefined) return null;

        function getXp(t, x) { return t.client.playerDb.db.get(x).exp; }
        s.leader = s.members.filter(m => m !== s.right_hand && m !== s.owner)?.sort((a, b) => getXp(this, b) - getXp(this, a))?.at(0) ?? "";

        this.db.set(owner, s.leader, "leader");

        return s;
    }

    async createSquad(squadDatas) {
        this.db.set(squadDatas.owner, squadDatas);
        this.client.inventoryDb.db.math(squadDatas.owner, "-", 10000, "yens");

        return this.get(squadDatas.owner);
    }

    async deleteSquad(owner) {
        this.db.delete(owner);
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
        let s = await this.get(owner);

        const members = s.members.filter(m => m !== user);
        this.db.set(s.owner, members, "members");
        s = await this.get(owner);

        if (s.owner === user) {
            if (s.right_hand !== "") {
                this.db.set(s.right_hand, s);
                this.db.set(s.right_hand, s.right_hand, "owner");
                this.db.set(s.right_hand, "", "right_hand");
            }
            this.db.delete(s.owner);
        }
        if (s.right_hand === user) {
            this.db.set(s.owner, "", "right_hand");
        }
    }

    async hasPlayer(owner, user) {
        const s = await this.get(owner);

        return s.members.includes(user);
    }

    async findUser(id) {
        let correspondingSquad = null;

        for (const squad of Array.from(this.db.values())) {
            if (squad.members.includes(id)) correspondingSquad = squad.owner;
        }

        correspondingSquad = await this.get(correspondingSquad);

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