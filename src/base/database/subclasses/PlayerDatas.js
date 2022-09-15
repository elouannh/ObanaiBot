const TableDatas = require("./TableDatas");

class PlayerDatas extends TableDatas {
    constructor(client, playerDatas, inventoryDatas) {
        super(client, playerDatas);

        this.inventoryDatas = inventoryDatas;
        this.lang = this.datas.lang;

        this.load();
        this.overwrite();
    }

    load() {
        for (const stat in this.datas.statistics) {
            this.datas.statistics[stat] = this.client.RPGAssetsManager.getStatistic(this.datas.lang, stat, this.datas.statistics[stat]);
        }

        if (this.inventoryDatas.enchantedGrimoire.id !== null) {
            const grimoire = this.client.RPGAssetsManager.getEnchantedGrimoire(this.lang, this.inventoryDatas.enchantedGrimoire.id);

            for (const grimoireEffect of grimoire.effects) {
                if (grimoireEffect !== "statisticsBoost") break;
                for (const stat in this.datas.statistics) stat.setGrimoireBoost(grimoire.strength);
            }
        }

        this.datas.level = this.client.RPGAssetsManager.getPlayerLevel(this.datas.exp);
        this.datas.date = `${(this.datas.creationDate / 1000).toFixed(0)}`;
        this.datas.breath = this.client.RPGAssetsManager.getBreathingStyle(this.datas.lang, this.datas.breathingStyle);
        delete this.datas.exp;
        delete this.datas.creationDate;
        delete this.datas.breathingStyle;
    }
}

module.exports = PlayerDatas;