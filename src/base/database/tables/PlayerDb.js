const SQLiteTable = require("./SQLiteTable");
const PlayerDatas = require("../subclasses/PlayerDatas");

function schema(id) {
    return {
        started: false,
        id: id,
        lang: "fr",
        stats: {
            agility: 1,
            defense: 1,
            strength: 1,
            speed: 1,
        },
        breathingStyle: "water",
        exp: 0,
        created: Date.now(),
    };
}

class PlayerDb extends SQLiteTable {
    constructor(client) {
        super(client, "playerDb", schema);
    }

    async load(id) {
        return new PlayerDatas(this.client, this.get(id), this.client.inventoryDb.db.get(id));
    }

    async createAdventure(id) {
        await this.client.activityDb.ensure(id);
        await this.client.inventoryDb.ensure(id);
        await this.client.mapDb.ensure(id);
        await this.ensure(id);
        await this.client.questDb.ensure(id);
        await this.client.externalServerDb.ensure(id);

        this.db.set(id, true, "started");
    }

    async deleteAdventure(id) {
        const p = this.model(id);
        this.db.set(id, p);
        this.db.set(id, false, "started");

        return this.db.get(id);
    }

    async changeLang(id, lang) {
        const p = this.model(id);
        this.db.ensure(id, p);
        await this.db.set(id, lang, "lang");
    }

    async getLang(id) {
        return (await this.get(id)).lang;
    }

    async started(id) {
        return this.db.has(id) && (await this.get(id)).started;
    }

    async earnExp(id, exp, cmd = null) {
        const p = await this.get(id);
        const i = await this.client.inventoryDb.get(id);

        const beforeLevel = calcPlayerLevel(p.exp).level;

        let coeff = 1;

        const crow = i.kasugai_crow === null ? null : require(`../../../elements/kasugai_crows/${i.kasugai_crow}.json`);
        const crowLevel = calcCrowLevel(i.kasugai_crow_exp);

        if (crow !== null) {
            if (crow.bonus.includes("experience_gain")) {
                const crowBoost = crowLevel.level * 2.5;
                coeff += crowBoost / 100;
            }
        }

        const grim = i.active_grimoire === null ? null : require(`../../../elements/grimoires/${i.active_grimoire}.json`);
        if (grim !== null) {
            if (grim.benefits.includes("experience_gain")) {
                coeff += grim.boost - 1;
            }
        }

        const afterLevel = calcPlayerLevel(p.exp + Math.ceil(exp * coeff)).level;

        let str = `Vous venez de gagner **${Math.ceil(exp * coeff)}** points d'expérience.`;
        if (beforeLevel < afterLevel) str += `\n\nVous passez au niveau **${afterLevel}** !`;
        if (cmd !== null) await cmd.ctx.reply("Gain d'expérience !", str, "⭐", "65ffe8", null);

        this.db.math(id, "+", Math.ceil(exp * coeff), "exp");
        return Math.ceil(exp * coeff);
    }

    async hasSquad(id) {
        return (await this.get(id)).squad !== null;
    }

    async changeCategory(id, label, breath) {
        const p = await this.client.inventoryDb.get(id);

        this.db.set(id, label, "category");
        this.db.set(id, 1, "categoryLevel");
        this.db.set(id, breath, "breath");
        this.client.inventoryDb.changeWeapon(id, {
            rarity: 1,
            name:  `${require(`../../../elements/categories/${label}.json`).weaponName}`
                   +
                   `${require(`../../../elements/categories/${label}.json`).rarityNames[0]}`,
            label:  `${require(`../../../elements/categories/${label}.json`).weapon}`,
        });
        this.client.inventoryDb.db.set(id, p.grimoires.mastery - 1, "grimoires.mastery");
    }

    async upgradeCategory(id, catLevel) {
        const p = await this.client.inventoryDb.get(id);

        this.db.set(id, catLevel + 1, "categoryLevel");
        this.client.inventoryDb.db.set(id, p.grimoires.mastery - 1, "grimoires.mastery");
    }
}

module.exports = PlayerDb;