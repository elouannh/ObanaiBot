const Enmap = require("enmap");
const fs = require("fs");
const calcCrowLevel = require("../../elements/calcCrowLevel");
const calcPlayerLevel = require("../../elements/calcPlayerLevel");

class PlayerDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "playerDb" });
    }

    model(
        // obligatoire
        id,
        // optionnel
        category, breath, squad,
    ) {
        const datas = {
            started: false,
            id: id,
            lang: "fr",
            stats: {
                agility: 1,
                defense: 1,
                force: 1,
                speed: 1,
            },
            category: "slayer",
            categoryLevel: 1,
            breath: "water",
            exp: 0,
            created: Date.now(),
            // grades : vip, tester, vip+
            grades: [],
            badges: [],
        };

        if (category !== null) datas.category = category;
        if (breath !== null) datas.breath = breath;
        if (squad !== null) datas.squad = squad;

        return datas;
    }

    async create(id) {
        const p = this.model(id);
        this.db.set(id, p);
        this.db.set(id, true, "started");

        return this.db.get(id);
    }

    async ensure(id) {
        const p = this.model(id, null, null, null);
        this.db.ensure(id, p);

        return this.db.get(id);
    }

    async get(id) {
        this.ensure(id, null, null, null);
        const p = await this.db.get(id);
        const i = await this.client.inventoryDb.get(id);


        for (const grimoire of fs.readdirSync("./src/elements/grimoires")) {
            const gr = require(`../../elements/grimoires/${grimoire}`);

            if (gr.benefits.includes("stats_boost") && i.active_grimoire === grimoire.split(".")[0]) {
                p.stats = {
                    agility: p.stats.agility * gr.boost,
                    defense: p.stats.defense * gr.boost,
                    force: p.stats.force * gr.boost,
                    speed: p.stats.speed * gr.boost,
                };
            }
        }

        p.aptitudes = {
            agility: p.stats.agility * 10,
            defense: p.stats.defense * 10,
            force: p.stats.force * 10,
            speed: p.stats.speed * 10,
        };

        p.stats = {
            agility: p.stats.agility,
            defense: p.stats.defense,
            force: p.stats.force,
            speed: p.stats.speed,
        };

        const cat = require(`../../elements/categories/${p.category}`);
        p.aptitudes[cat.bonus[0]] *= 1 + p.categoryLevel / 20;
        p.aptitudes[cat.bonus[1]] *= 1 - p.categoryLevel / 50;

        p.aptitudes.agility = Math.ceil(p.aptitudes.agility);
        p.aptitudes.defense = Math.ceil(p.aptitudes.defense);
        p.aptitudes.force = Math.ceil(p.aptitudes.force);
        p.aptitudes.speed = Math.ceil(p.aptitudes.speed);

        p.squad = await this.client.squadDb.findUser(p.id);

        return p;
    }

    async deleteAdventure(id) {
        const p = this.model(id, null, null, null, null, null);
        this.db.set(id, p);
        this.db.set(id, false, "started");

        return this.db.get(id);
    }

    async changeLang(id, lang) {
        const p = this.model(id, null, null, null, null, null);
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

        const crow = i.kasugai_crow === null ? null : require(`../../elements/kasugai_crows/${i.kasugai_crow}.json`);
        const crowLevel = calcCrowLevel(i.kasugai_crow_exp);

        if (crow !== null) {
            if (crow.bonus.includes("experience_gain")) {
                const crowBoost = crowLevel.level * 5;
                coeff += crowBoost / 100;
            }
        }

        const grim = i.active_grimoire === null ? null : require(`../../elements/grimoires/${i.active_grimoire}.json`);
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
        this.client.inventoryDb.db.set(id, {
            rarity: 1,
            name:  `${require(`../../elements/categories/${label}.json`).weaponName} ${require(`../../elements/categories/${label}.json`).rarityNames[0]}`,
            label:  `${require(`../../elements/categories/${label}.json`).weapon}`,
        }, "weapon");
        this.client.inventoryDb.db.set(id, p.grimoires.mastery - 1, "grimoires.mastery");
    }

    async upgradeCategory(id, catLevel) {
        const p = await this.client.inventoryDb.get(id);

        this.db.set(id, catLevel + 1, "categoryLevel");
        this.client.inventoryDb.db.set(id, p.grimoires.mastery - 1, "grimoires.mastery");
    }
}

module.exports = { PlayerDb };