/* eslint-disable no-case-declarations */
const Enmap = require("enmap");
const Command = require("../../base/Command");
const badgesObjectives = require("../../elements/badgesObjectives.json");
const intRender = require("../../utils/intRender");

class ExternalServerDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "externalServerDb" });
    }

    model(id) {
        const datas = {
            id: id,
            grades: [],
            badges: {
                farmer: {
                    value: 0,
                    tier: "0",
                },
                adventurer: {
                    value: 0,
                    tier: "0",
                },
                domineering: {
                    value: 0,
                    tier: "0",
                },
                warChief: {
                    value: 0,
                    tier: "0",
                },
                archaeologist: {
                    value: 0,
                    tier: "0",
                },
                masterFalconer: {
                    value: 0,
                    tier: "0",
                },
            },
            daily: 0,
            claimed: [],
        };

        return datas;
    }

    async ensure(id) {
        const p = this.model(id, null);
        this.db.ensure(id, p);

        return this.db.get(id);
    }

    async get(id) {
        this.ensure(id);

        return this.db.get(id);
    }

    async addGrade(id, grade) {
        this.db.push(id, grade, "grades");
    }

    async checkBadges(id, type, value) {
        const p = await this.get(id);
        const oldValue = p.badges[type];
        const newValue = {
            value: oldValue.value,
            tier: "0",
        };

        switch (type) {
            case "farmer":
                newValue.value = oldValue.value + value;
                newValue.tier = this.getObjective(badgesObjectives.objectives.farmer, newValue.value);
                break;
            case "adventurer":
                newValue.value = oldValue.value + value;
                newValue.tier = this.getObjective(badgesObjectives.objectives.adventurer, newValue.value);
                break;
            case "domineering":
                newValue.value = oldValue.value + value;
                newValue.tier = this.getObjective(badgesObjectives.objectives.domineering, newValue.value);
                break;
            case "warChief":
                newValue.value = oldValue.value + value;
                newValue.tier = this.getObjective(badgesObjectives.objectives.warChief, newValue.value);
                break;
            case "archaeologist":
                newValue.value = oldValue.value + value;
                newValue.tier = this.getObjective(badgesObjectives.objectives.archaeologist, newValue.value);
                break;
            case "masterFalconer":
                newValue.value = oldValue.value + value;
                newValue.tier = this.getObjective(badgesObjectives.objectives.masterFalconer, newValue.value);
                break;
        }

        if (oldValue.value < newValue.value) {
            this.db.set(id, newValue, `badges.${type}`);
            if (oldValue.tier !== newValue.tier) {
                try {
                    const cmd = new Command();
                    cmd.init(this.client,
                        {
                            author: this.client.users.cache.get(id),
                            channel: this.client.lastChannel.get(id),
                        },
                    []);
                    await cmd.ctx.reply(
                        "Badge obtenu !",
                        `Passage du badge \`${this.getBadge(type)}\` au tier: **\`${this.getTier(newValue.tier)}\`**`,
                        "⭐",
                        null,
                        "outline",
                    );
                }
                catch (err) {
                    return;
                }
            }
        }
    }

    getObjective(obj, v) {
        const tier = Object.entries(obj).filter(e => Number(e[1]) <= v)?.at(-1)?.at(0) ?? "0";
        return tier;
    }

    getTier(tier) {
        return {
            "0": "I",
            "1": "II",
            "2": "III",
            "3": "IV",
        }[tier];
    }

    getBadge(type) {
        return {
            "farmer": "Fermier",
            "adventurer": "Aventurier",
            "domineering": "Dominateur",
            "warChief": "Chef de guerre",
            "archaeologist": "Archéologue",
            "lasterFalconer": "Maître fauconnier",
        }[type];
    }

    getProgress(type, quantity, mode) {
        const tier = this.getObjective(badgesObjectives.objectives[type], quantity);
        const indexOfTier = Number(tier);
        const actualTier = this.getTier(tier);
        let progress = "";

        if (mode === "minimal") {
            progress = `\`${actualTier}\``;
        }
        else if (mode === "maximal") {
            progress = `${badgesObjectives.descriptions[type]}\n» Actuel: \`tier ${actualTier}\``;

            if (indexOfTier === 3) {
                progress = "`- (terminé) -`";
            }
            else {
                const afterIndex = indexOfTier + 1;
                const afterTier = ["0", "1", "2", "3"][afterIndex];
                progress += `\n» Prochain: \`tier ${this.getTier(afterTier)}\`: **${intRender(quantity, " ")}**/${badgesObjectives.objectives[type][afterTier]}`;
            }
        }

        return progress;
    }

    async addVip(user, mode) {
        switch (mode) {
            case "support":
                const serv = this.client.guilds.cache.get(this.client.config.support);
                try {
                    this.client.addRole(user, serv, this.client.config.roles.vip);
                }
                catch {
                    "que dalle";
                }
                break;
            case "bdd":
                const userGrades = await this.get(user);
                if (!userGrades.grades.includes("vip")) this.db.push(user, "vip", "grades");
                break;
            default:
                break;
        }
    }

    async addVipplus(user, mode) {
        switch (mode) {
            case "support":
                const serv = this.client.guilds.cache.get(this.client.config.support);
                try {
                    this.client.addRole(user, serv, this.client.config.roles["vip+"]);
                }
                catch {
                    "que dalle";
                }
                break;
            case "bdd":
                const userGrades = await this.get(user);
                if (!userGrades.grades.includes("vip+")) this.db.push(user, "vip+", "grades");
                break;
            default:
                break;
        }
    }

    async removeVip(user, mode) {
        switch (mode) {
            case "support":
                const serv = this.client.guilds.cache.get(this.client.config.support);
                try {
                    this.client.removeRole(user, serv, this.client.config.roles.vip);
                }
                catch {
                    "que dalle";
                }
                break;
            case "bdd":
                const userGrades = await this.get(user);
                if (!userGrades.claimed.includes("vip")) {
                    if (userGrades.grades.includes("vip")) this.db.set(user, userGrades.grades.filter(gr => gr !== "vip"), "grades");
                }
                else {
                    if (userGrades.grades.includes("vip")) this.db.set(user, userGrades.grades.filter(gr => gr !== "vip"), "grades");
                    await this.client.playerDb.db.math(user, "-", 2, "stats.force");
                    await this.client.playerDb.db.math(user, "-", 2, "stats.agility");
                    await this.client.playerDb.db.math(user, "-", 2, "stats.speed");
                    await this.client.playerDb.db.math(user, "-", 2, "stats.defense");
                    await this.client.inventoryDb.db.math(user, "-", 50000, "yens");
                    await this.client.inventoryDb.removeGrimoire(user, "mastery");

                    const inventory = await this.client.inventoryDb.get(user);

                    if (inventory.active_grimoire === "eternal") {
                        this.client.inventoryDb.db.set(user, null, "active_grimoire");
                        this.client.inventoryDb.db.set(user, 0, "active_grimoire_since");
                    }
                    else {
                        this.client.inventoryDb.db.delete(user, "grimoires.eternal");
                    }
                }
                break;
            default:
                break;
        }
    }


    async removeVipplus(user, mode) {
        switch (mode) {
            case "support":
                const serv = this.client.guilds.cache.get(this.client.config.support);
                try {
                    this.client.removeRole(user, serv, this.client.config.roles["vip+"]);
                }
                catch {
                    "que dalle";
                }
                break;
            case "bdd":
                const userGrades = await this.get(user);
                if (!userGrades.claimed.includes("vip+")) {
                    if (userGrades.grades.includes("vip+")) this.db.set(user, userGrades.grades.filter(gr => gr !== "vip+"), "grades");
                }
                else {
                    if (userGrades.grades.includes("vip+")) this.db.set(user, userGrades.grades.filter(gr => gr !== "vip+"), "grades");
                    this.client.playerDb.db.math(user, "-", 5, "stats.force");
                    this.client.playerDb.db.math(user, "-", 5, "stats.agility");
                    this.client.playerDb.db.math(user, "-", 5, "stats.speed");
                    this.client.playerDb.db.math(user, "-", 5, "stats.defense");
                    if (this.client.playerDb.db.get(user).category === "moon_tamer") await this.client.playerDb.changeCategory(user, "slayer", "water");
                    this.client.inventoryDb.db.math(user, "-", 100000, "yens");
                    await this.client.inventoryDb.removeGrimoire(user, "mastery");
                }
                break;
            default:
                break;
        }
    }
}

module.exports = { ExternalServerDb };