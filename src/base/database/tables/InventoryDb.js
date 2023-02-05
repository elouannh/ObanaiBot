const SQLiteTable = require("../../SQLiteTable");
const InventoryData = require("../dataclasses/InventoryData");
const InventoryListener = require("../listeners/InventoryListener");
const { EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        wallet: 0,
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
        super(client, "inventory", schema, InventoryListener);
    }

    async load(id) {
        return new InventoryData(this.client, this.get(id), this.client.playerDb.getLang(id));
    }

    get(id) {
        const data = super.get(id, schema);
        data.enchantedGrimoire = this.updateEnchantedGrimoire(id, data.enchantedGrimoire);

        for (const material in data.items.materials) {
            if (data.items.materials[material] <= 0) {
                delete data.items.materials[material];
                this.delete(id, `items.materials.${material}`);
            }
        }
        for (const item in data.items.questItems) {
            if (data.items.questItems[item] <= 0) {
                delete data.items.questItems[item];
                this.delete(id, `items.questItems.${item}`);
            }
        }
        for (const weapon in data.items.weapons) {
            for (const rarity in data.items.weapons[weapon]) {
                if (data.items.weapons[weapon][rarity] <= 0) {
                    delete data.items.weapons[weapon][rarity];
                    this.delete(id, `items.weapons.${weapon}.${rarity}`);
                }
            }
        }
        for (const grimoire in data.items.enchantedGrimoires) {
            if (data.items.enchantedGrimoires[grimoire] <= 0) {
                delete data.items.enchantedGrimoires[grimoire];
                this.delete(id, `items.enchantedGrimoires.${grimoire}`);
            }
        }

        return data;
    }

    /**
     * Removes a defined material amount from the inventory
     * @param {String} id The user ID
     * @param {String} material The material ID
     * @param {Number} amount The amount to remove
     * @returns {Number} The new material amount
     */
    removeMaterial(id, material, amount) {
        const previousAmount = this.get(id).items.materials[material];
        const newAmount = previousAmount - amount;
        this.set(id, newAmount, `items.materials.${material}`);
        return newAmount;
    }

    /**
     * Removes a defined material amount from the inventory
     * @param {String} id The user ID
     * @param {String} material The material ID
     * @param {Number} amount The amount to remove
     * @returns {Number} The new material amount
     */
    addMaterial(id, material, amount) {
        return this.removeMaterial(id, material, -amount);
    }

    /**
     * Removes a defined quest item amount from the inventory
     * @param {String} id The user ID
     * @param {String} questItem The quest item ID
     * @param {Number} amount The amount to remove
     * @returns {Number} The new quest item amount
     */
    removeQuestItem(id, questItem, amount) {
        const previousAmount = this.get(id).items.questItems[questItem];
        const newAmount = previousAmount - amount;
        this.set(id, newAmount, `items.questItems.${questItem}`);
        return newAmount;
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
     * Add money to the wallet of the player
     * @param {String} id The user ID
     * @param {Number} amount The amount to add
     * @returns {Number} The new wallet amount
     */
    addMoney(id, amount) {
        const data = this.get(id);
        let moneyBoost = 1;
        if (data.enchantedGrimoire.id !== null) {
            const grimoire = this.client.RPGAssetsManager.getEnchantedGrimoire(
                this.client.playerDb.getLang(id), data.enchantedGrimoire.id,
            );
            for (const grimoireEffect of grimoire) {
                if (grimoireEffect.id === "moneyBoost") {
                    moneyBoost = this.client.util.round((grimoireEffect.strength / 10) + 1, 2);
                }
            }
        }
        const previousAmount = data.wallet;
        const newAmount = this.client.util.round((previousAmount + amount) * moneyBoost, 0);
        this.set(id, newAmount, "wallet");
        return newAmount;
    }

    /**
     * Add a specific quest item to the inventory of the player
     * @param {String} id The user ID
     * @param {String} questItem The quest item ID
     * @param {Number} amount the amount to add
     * @returns {Number} The new amount of this material
     */
    addQuestItem(id, questItem, amount) {
        const previousAmount = this.get(id).items.questItems[questItem] || 0;
        const newAmount = previousAmount + amount;
        this.set(id, newAmount, `items.questItems.${questItem}`);
        return newAmount;
    }

    /**
     * Add a specific enchanted grimoire to the inventory of the player
     * @param {String} id The user ID
     * @param {String} enchantedGrimoire The quest item ID
     * @param {Number} amount the amount to add
     * @returns {Number} The new amount of this material
     */
    addEnchantedGrimoire(id, enchantedGrimoire, amount) {
        const previousAmount = this.get(id).items.enchantedGrimoires[enchantedGrimoire] || 0;
        const newAmount = previousAmount + amount;
        this.set(id, newAmount, `items.enchantedGrimoires.${enchantedGrimoire}`);
        return newAmount;
    }

    /**
     * Add a specific weapon to the inventory of the player
     * @param {String} id The user ID
     * @param {String} weapon The weapon ID
     * @param {String} rarity The weapon rarity
     * @param {Number} amount the amount to add
     * @returns {Number} The new amount of this material
     */
    addWeapon(id, weapon, rarity, amount) {
        const previousAmount = this.get(id).items.weapons[weapon][rarity] || 0;
        const newAmount = previousAmount + amount;
        this.set(id, newAmount, `items.weapons.${weapon}.${rarity}`);
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
                        .map(g => `x\`${g.amount}\` ${g.instance.name}`)
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
                        .map(g => `x\`${g.amount}\` ${g.instance.name}`)
                        .join("\n") :
                    lang.rpgAssets.embeds.noMaterial,
                inline: true,
            },
            {
                name: lang.rpgAssets.concepts.questItems,
                    value: Object.values(data.items.questItems).length > 0 ?
                Object.values(data.items.questItems)
                    .sort((a, b) => b.amount - a.amount)
                    .map(g => `x\`${g.amount}\` ${g.instance.name}`)
                    .join("\n") :
                lang.rpgAssets.embeds.noQuestItem,
                inline: true,
            },
        );

        return embed;
    }
}

module.exports = InventoryDb;