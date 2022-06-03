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
        category, weapon, breath, squad, map,
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
            weapon: {
                rarity: 1,
                name:  `${require("../../elements/categories/slayer.json").weaponName} ${require("../../elements/categories/slayer.json").rarityNames[0]}`,
            },
            breath: "water",
            exp: 0,
            squad: null,
            created: Date.now(),
            // grades : vip, tester, vip+
            grades: [],
        };

        if (category !== null) datas.category = category;
        if (weapon !== null) {
            if (weapon.color !== null) datas.weapon.color = weapon.color;
            if (weapon.name !== null) datas.weapon.name = weapon.name;
            if (weapon.rarity !== null) datas.weapon.rarity = weapon.rarity;
        }
        if (breath !== null) datas.breath = breath;
        if (squad !== null) datas.squad = squad;
        if (map !== null) datas.map = map;

        return datas;
    }

    async create(id, category = null, weapon = null, breath = null, squad = null, map = null) {
        const p = this.model(id, category, weapon, breath, squad, map);
        this.db.set(id, p);
        this.db.set(id, true, "started");

        return this.db.get(id);
    }

    async ensure(id) {
        const p = this.model(id, null, null, null, null, null);
        this.db.ensure(id, p);

        return this.db.get(id);
    }

    async get(id) {
        this.ensure(id, null, null, null, null, null);
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
        p.aptitudes[cat.bonus[1]] *= 1 - p.categoryLevel / 20;

        p.aptitudes.agility = Math.ceil(p.aptitudes.agility);
        p.aptitudes.defense = Math.ceil(p.aptitudes.defense);
        p.aptitudes.force = Math.ceil(p.aptitudes.force);
        p.aptitudes.speed = Math.ceil(p.aptitudes.speed);
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

    async gainExp(id, exp, cmd = null) {
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
}

module.exports = { PlayerDb };