const Enmap = require("enmap");
const calcCrowLevel = require("../../elements/calcCrowLevel");

class InventoryDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "inventoryDb" });
    }

    model(id) {
        const datas = {
            id: id,
            yens: 0,
            kasugai_crow: null,
            kasugai_crow_exp: 0,
            active_grimoire: null,
            active_grimoire_since: 0,
            grimoires: {},
            materials: {},
            weapons: {},
            tools: {},
        };

        return datas;
    }

    async create(id) {
        const p = this.model(id);
        this.db.set(id, p);

        return this.db.get(id);
    }

    async ensure(id) {
        const p = this.model(id);
        this.db.ensure(id, p);

        return this.db.get(id);
    }

    async get(id) {
        this.ensure(id);
        const p = this.db.get(id);

        for (const mat in p.materials) {
            const q = mat in p.materials ? p.materials[mat] : 0;

            if (q <= 0) {
                this.db.delete(id, `materials.${mat}`);
            }
        }

        return this.db.get(id);
    }

    async addGrimoire(id, grimoire) {
        const p = await this.get(id);

        if (!p.grimoires[grimoire]) this.db.set(id, 1, `grimoires.${grimoire}`);
        else this.db.math(id, "+", 1, `grimoires.${grimoire}`);

        return this.db.get(id);
    }

    async removeGrimoire(id, grimoire) {
        const p = await this.get(id);

        if (p.grimoires[grimoire] <= 1) this.db.delete(id, `grimoires.${grimoire}`);
        else if (p.grimoires[grimoire] > 1) this.db.math(id, "-", 1, `grimoires.${grimoire}`);

        return this.db.get(id);
    }

    async equipGrimoire(id, grimoire) {
        const p = await this.get(id);

        if (p.grimoires[grimoire] > 0) {
            this.db.set(id, grimoire, "active_grimoire");
            this.db.set(id, Date.now(), "active_grimoire_since");
        }

        if (p.grimoires[grimoire] <= 1) this.db.delete(id, `grimoires.${grimoire}`);
        else if (p.grimoires[grimoire] > 1) this.db.math(id, "-", 1, `grimoires.${grimoire}`);

        return this.db.get(id);
    }

    async unequipGrimoire(id, cmd = null) {
        const p = await this.get(id);

        const grimoire = p.active_grimoire;

        if (grimoire === "eternal") {
            this.db.set(id, null, "active_grimoire");
            this.db.set(id, 0, "active_grimoire_since");
            if (!p.grimoires["eternal"]) this.db.set(id, 0, "grimoires.eternal");
            this.db.math(id, "+", 1, "grimoires.eternal");
        }
        else {
            const grim = require(`../../elements/grimoires/${grimoire}.json`);
            const timeLeft = (grim.expiration * 1000) - (Date.now() - p.active_grimoire_since);
            const yensToEarn = await this.earnYens(id, Math.ceil(Math.ceil(timeLeft / 3_600_000) * 150));

            if (cmd !== null) await cmd.ctx.reply("Gain de yens !", `Vous avez obtenu **${yensToEarn}** grâce à la vente de votre grimoire.`, "💰", "fff665", null);

            this.db.math(id, "+", yensToEarn, "yens");
            this.db.set(id, null, "active_grimoire");
            this.db.set(id, 0, "active_grimoire_since");
        }

        return this.db.get(id);
    }

    async earnYens(id, amount) {
        const p = await this.get(id);

        let coeff = 1;

        const crow = p.kasugai_crow === null ? null : require(`../../elements/kasugai_crows/${p.kasugai_crow}.json`);
        const crowLevel = calcCrowLevel(p.kasugai_crow_exp);

        if (crow !== null) {
            if (crow.bonus.includes("yens_gain")) {
                const crowBoost = crowLevel.level * 5;
                coeff += crowBoost / 100;
            }
        }

        const grim = p.active_grimoire === null ? null : require(`../../elements/grimoires/${p.active_grimoire}.json`);
        if (grim !== null) {
            if (grim.benefits.includes("yens_gain")) {
                coeff += grim.boost - 1;
            }
        }

        return Math.ceil(amount * coeff);
    }

    async changeCrow(id, crow) {
        const p = await this.get(id);

        if (p.kasugai_crow_exp > 0) this.db.set(id, 0, "kasugai_crow_exp");
        this.db.set(id, crow, "kasugai_crow");
    }

    async feedCrow(id, foodType, quantity) {
        const p = await this.get(id);

        const quantities = {
            "worm": 10,
            "seed": 1,
        };

        const newXp = p.kasugai_crow_exp + (quantities[foodType] ?? 1) * quantity;
        this.db.set(id, newXp, "kasugai_crow_exp");
    }
}

module.exports = { InventoryDb };