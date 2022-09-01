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
        for (const stat in this.datas.stats) {
            if (typeof this.datas.statsLevel === "undefined") this.datas.statsLevel = {};
            this.datas.statsLevel[stat] = this.datas.stats[stat];
            this.datas.stats[stat] = this.client.util.round(this.datas.stats[stat] * 10);
        }

        this.datas.grimBoosts = {
            strength: [0, 0],
            defense: [0, 0],
            agility: [0, 0],
            speed: [0, 0],
        };
        if (this.inventoryDatas.enchantedGrimoire.id !== null) {
            const grimoire = this.client.RPGAssetsManager.getEnchantedGrimoire(this.lang, this.inventoryDatas.enchantedGrimoire.id);

            for (const grimoireEffect of grimoire.effects) {
                if (grimoireEffect === "statsBoost") {
                    for (const stat in this.datas.statsLevel) {
                        this.datas.grimBoosts[stat] = [
                            this.client.util.round(this.datas.stats[stat] * (grimoireEffect.strength - 1)),
                            this.client.util.round((grimoireEffect.strength - 1) * 100),
                        ];
                    }
                }
            }
        }

        this.datas.finalStats = { ...this.datas.stats };
        for (const stat in this.datas.finalStats) {
            const sum = this.datas.finalStats[stat] + this.datas.grimBoosts[stat][0];
            this.datas.finalStats[stat] = this.client.util.round(sum);
        }

        this.datas.arenaStats = { ...this.datas.finalStats };
        for (const stat in this.datas.arenaStats) {
            this.datas.arenaStats[stat] = this.client.util.round(
                this.client.util.round(this.datas.finalStats[stat] / 30, 0) * 10,
                0,
            );
        }

        this.datas.level = this.client.RPGAssetsManager.getPlayerLevel(this.datas.exp);
        this.datas.date = `${(this.datas.created / 1000).toFixed(0)}`;
        this.datas.breath = this.client.RPGAssetsManager.getBreathingStyle(this.datas.lang, this.datas.breathingStyle);
    }
}

module.exports = PlayerDatas;