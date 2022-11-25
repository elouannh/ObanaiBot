const SQLiteTable = require("../../SQLiteTable");
const InventoryData = require("../dataclasses/InventoryData");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        wallet: 0,
        kasugaiCrow: {
            id: null,
            hunger: 100,
            lastFeeding: Date.now(),
            lastHungerGenerated: Date.now(),
        },
        enchantedGrimoire: {
            id: null,
            activeSince: 0,
        },
        weapon: {
            id: "katana",
            rarity: "3",
        },
        items: {
            enchantedGrimoires: {},
            materials: {},
            questItems: {},
            weapons: {},
        },
    };
}

class InventoryDb extends SQLiteTable {
    constructor(client) {
        super(client, "inventory", schema);
    }

    async load(id) {
        return new InventoryData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

    get(id) {
        const data = super.get(id, schema);

        data.enchantedGrimoire = this.updateEnchantedGrimoire(id, data.enchantedGrimoire);

        if (data.kasugaiCrow.id !== null) {
            const lastHungerGenerated = data.kasugaiCrow.lastHungerGenerated;
            const elapsedTime = Math.floor((Date.now() - lastHungerGenerated) / 1000 / 900);


            if (elapsedTime > 0) {
                let hungerGenerated = data.kasugaiCrow.hunger - elapsedTime;
                if (hungerGenerated < 0) hungerGenerated = 0;
                else if (hungerGenerated > 100) hungerGenerated = 100;

                if (hungerGenerated > 0 && data.kasugaiCrow.hunger !== hungerGenerated) {
                    this.generateKasugaiCrowHunger(id, hungerGenerated);
                }
                data.kasugaiCrow.hunger = hungerGenerated;
                data.kasugaiCrow.lastHungerGenerated = Date.now();
            }
        }

        return data;
    }

    /**
     * @typedef {Object} GrimoireObject
     * @property {String|null} id The grimoire ID
     * @property {Number} activeSince The timestamp when the grimoire was activated
     */
    /**
     * Check if the active grimoire is expired. Removes it if it is, and returns the grimoire stored in the inventory.
     * @param {String} id The user ID
     * @param {GrimoireObject} grimoireObject The grimoire store
     * @returns {GrimoireObject} The grimoire stored in the inventory
     */
    updateEnchantedGrimoire(id, grimoireObject) {
        if (grimoireObject.id !== null) {
            const grimoireInstance = this.client.RPGAssetsManager.loadEnchantedGrimoire(
                this.client.playerDb.getLang(id), grimoireObject,
            );
            const expirationDate = Math.floor(Number(grimoireInstance.expirationDate) * 1000);

            if (expirationDate < Date.now()) {
                this.set(id, null, "enchantedGrimoire.id");
                this.set(id, 0, "enchantedGrimoire.activeSince");
                return { id: null, activeSince: 0 };
            }
        }
        return grimoireObject;
    }

    /**
     * Generate hunger for the Kasugai Crow.
     * @param {String} id The player ID
     * @param {Number} amount The amount of hunger to generate
     * @returns {void}
     */
    generateKasugaiCrowHunger(id, amount) {
        if (amount < 0) amount = 0;
        else if (amount > 100) amount = 100;
        this.set(id, Math.floor(amount), "kasugaiCrow.hunger");
        this.set(id, Date.now(), "kasugaiCrow.lastHungerGenerated");
    }

    /**
     * Feed the crow to increase its effects bonuses.
     * @param {String} id The player ID
     * @param {Number} amount The amount of hunger to decrease
     * @returns {void}
     */
    feedKasugaiCrow(id, amount) {
        if (amount < 0) amount = 0;
        else if (amount > 100) amount = 100;
        this.set(id, Math.floor(amount), "kasugaiCrow.hunger");
        this.set(id, Date.now(), "kasugaiCrow.lastFeeding");
    }

    /**
     * Add money to the wallet of the player
     * @param {String} id The user ID
     * @param {Number} amount The amount to add
     * @returns {Number} The new wallet amount
     */
    addMoney(id, amount) {
        const previousAmount = this.get(id).wallet;
        const newAmount = previousAmount + amount;
        this.set(id, newAmount, "wallet");
        return newAmount;
    }

    /**
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {InventoryData} data The inventory data
     * @param {User} user The user
     * @returns {Promise<EmbedBuilder>}
     */
    async getEmbed(lang, data, user) {
        const embed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                + lang.rpgAssets.embeds.inventoryTitle.replace("%PLAYER", `\`${user.tag}\``),
            )
            .addFields(
                {
                    name: lang.rpgAssets.embeds.wallet,
                    value: ` ¥ ${this.client.util.intRender(data.wallet, ".")}`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.weapon,
                    value: `${data.weapon.name} - **${data.weapon.rarityName}**`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: false },
            )
            .setColor(this.client.enums.Colors.Blurple);

        if (data.kasugaiCrow.id !== null) {
            embed.addFields(
                {
                    name: lang.rpgAssets.concepts.kasugaiCrow,
                    value: data.kasugaiCrow.name,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.kasugaiCrowHunger,
                    value: `\`${data.kasugaiCrow.hunger}\`% - `
                        + `${lang.rpgAssets.concepts.kasugaiCrowLastFeeding}: <t:${data.kasugaiCrow.lastFeeding}:R>`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.kasugaiCrowEffects,
                    value: data.kasugaiCrow.effects
                        .map(e => `${e.name} - \`${e.maxStrength * data.kasugaiCrow.hunger / 100}\`% `
                            + `(${lang.rpgAssets.embeds.maxPercent}: \`${e.maxStrength}\`%)`)
                        .join("\n"),
                    inline: true,
                },
            );
        }
        else {
            embed.addFields(
                {
                    name: lang.rpgAssets.concepts.kasugaiCrow,
                    value: lang.rpgAssets.embeds.noCrow,
                    inline: true,
                },
            );
        }

        if (data.enchantedGrimoire.id !== null) {
            embed.addFields(
                {
                    name: lang.rpgAssets.concepts.enchantedGrimoire,
                    value: data.enchantedGrimoire.name,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.embeds.lifespan,
                    value: `${data.enchantedGrimoire.lifespan} |`
                        + ` ${lang.rpgAssets.embeds.expirationDate}: <t:${data.enchantedGrimoire.expirationDate}:D>`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.enchantedGrimoireEffects,
                    value: data.enchantedGrimoire.effects.map(e => `${e.name} - \`${e.strength}\`%`).join("\n"),
                    inline: true,
                },
            );
        }
        else {
            embed.addFields(
                {
                    name: lang.rpgAssets.concepts.enchantedGrimoire,
                    value: lang.rpgAssets.embeds.noGrimoire,
                    inline: true,
                },
            );
        }

        embed.addFields(
            { name: "\u200b", value: "\u200b", inline: false },
            {
                name: lang.rpgAssets.embeds.grimoireStock,
                value: Object.keys(data.items.enchantedGrimoires).length > 0 ?
                    Object.values(data.items.enchantedGrimoires)
                        .sort((a, b) => b.amount - a.amount)
                        .map(g => `x\`${g.amount}\` ${g.list[0].name}`)
                        .join("\n") :
                    lang.rpgAssets.embeds.noGrimoire,
                inline: true,
            },
            {
                name: lang.rpgAssets.embeds.weaponStock,
                value: data.items.weapons.totalAmount > 0 ?
                    data.items.weapons.list.map(g => `${g.name} - **${g.rarityName}**`).join("\n") :
                    lang.rpgAssets.embeds.noWeapon,
                inline: true,
            },
            { name: "\u200b", value: "\u200b", inline: false },
            {
                name: lang.rpgAssets.concepts.materials,
                value: Object.values(data.items.materials).length > 0 ?
                    Object.values(data.items.materials)
                        .sort((a, b) => b.amount - a.amount)
                        .map(g => `x\`${g.amount}\` ${g.list[0].name}`)
                        .join("\n") :
                    lang.rpgAssets.embeds.noMaterial,
                inline: true,
            },
            {
                name: lang.rpgAssets.concepts.questItems,
                    value: Object.values(data.items.questItems).length > 0 ?
                Object.values(data.items.questItems)
                    .sort((a, b) => b.amount - a.amount)
                    .map(g => `x\`${g.amount}\` ${g.list[0].name}`)
                    .join("\n") :
                lang.rpgAssets.embeds.noQuestItem,
                inline: true,
            },
        );

        return embed;
    }
}

module.exports = InventoryDb;