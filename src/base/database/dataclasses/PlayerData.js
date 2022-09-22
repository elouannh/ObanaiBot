const TableData = require("../../TableData");

class PlayerData extends TableData {
    constructor(client, playerData, inventoryData) {
        super(client, playerData);

        this.inventoryData = inventoryData;
        this.lang = this.data.lang;

        this.load();
        this.overwrite();
    }

    load() {
        for (const stat in this.data.statistics) {
            this.data.statistics[stat] = this.client.RPGAssetsManager.getStatistic(this.data.lang, stat, this.data.statistics[stat]);
        }

        if (this.inventoryData.enchantedGrimoire.id !== null) {
            const grimoire = this.client.RPGAssetsManager.getEnchantedGrimoire(this.lang, this.inventoryData.enchantedGrimoire.id);

            for (const grimoireEffect of grimoire.effects) {
                if (grimoireEffect !== "statisticsBoost") break;
                for (const stat in this.data.statistics) stat.setGrimoireBoost(grimoire.strength);
            }
        }

        this.data.level = this.client.RPGAssetsManager.getPlayerLevel(this.data.exp);
        this.data.date = `${(this.data.creationDate / 1000).toFixed(0)}`;
        this.data.breath = this.client.RPGAssetsManager.getBreathingStyle(this.data.lang, this.data.breathingStyle);
        delete this.data.exp;
        delete this.data.creationDate;
        delete this.data.breathingStyle;
    }
}

module.exports = PlayerData;