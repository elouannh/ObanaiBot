class PlayerValue {
    constructor(client, playerDatas, inventoryDatas) {
        this.client = client;
        this.playerDatas = playerDatas;
        this.inventoryDatas = inventoryDatas;
        this.datas = this.load();
    }

    load() {
        for (const stat in this.playerDatas.stats) {
            if (typeof this.playerDatas.statsLevel === "undefined") this.playerDatas.statsLevel = {};
            this.playerDatas.statsLevel[stat] = this.playerDatas.stats[stat];
            this.playerDatas.stats[stat] = this.client.util.round(this.playerDatas.stats[stat] * 10);
        }

        this.playerDatas.grimBoosts = {
            strength: [0, 0],
            defense: [0, 0],
            agility: [0, 0],
            speed: [0, 0],
        };
        if (this.inventoryDatas.active_grimoire !== null) {
            const gr = require(`../../../elements/grimoires/${this.inventoryDatas.active_grimoire}.json`);

            if (gr.benefits.includes("stats_boost")) {
                for (const stat in this.playerDatas.statsLevel) {
                    this.playerDatas.grimBoosts[stat] = [
                        this.client.util.round(this.playerDatas.stats[stat] * (gr.boost - 1)),
                        this.client.util.round((gr.boost - 1) * 100),
                    ];
                }
            }
        }

        const cat = require(`../../../elements/categories/${this.playerDatas.category}`);
        this.playerDatas.catBoosts = {
            [cat.bonus[0]]: [0, 0],
            [cat.bonus[1]]: [0, 0],
        };
        this.playerDatas.catBoosts[cat.bonus[0]] = [
            this.client.util.round(this.playerDatas.stats[cat.bonus[0]] * (this.playerDatas.categoryLevel / 20)),
            this.client.util.round((this.playerDatas.categoryLevel / 20) * 100),
        ];
        this.playerDatas.catBoosts[cat.bonus[1]] = [
            this.client.util.round(this.playerDatas.stats[cat.bonus[1]] * (-this.playerDatas.categoryLevel / 50)),
            this.client.util.round((-this.playerDatas.categoryLevel / 50) * 100),
        ];

        this.playerDatas.finalStats = { ...this.playerDatas.stats };
        for (const stat in this.playerDatas.finalStats) {
            let sum = this.playerDatas.finalStats[stat] + this.playerDatas.grimBoosts[stat][0];
            if (stat in this.playerDatas.catBoosts) sum += this.playerDatas.catBoosts[stat][0];
            this.playerDatas.finalStats[stat] = this.client.util.round(sum);
        }

        this.playerDatas.tournamentStats = { ...this.playerDatas.finalStats };
        for (const stat in this.playerDatas.tournamentStats) {
            this.playerDatas.tournamentStats[stat] = this.client.util.round(
                this.client.util.round(this.playerDatas.finalStats[stat] / 30, 0) * 10,
                0,
            );
        }

        this.playerDatas.level = this.client.assetsManager.getPlayerLevel(this.playerDatas.exp);
        this.playerDatas.date = `${(this.playerDatas.created / 1000).toFixed(0)}`;

        this.playerDatas.category = require(`../../../elements/categories/${this.playerDatas.category}.json`);
        this.playerDatas.breath = this.client.RPGAssetsManager.getBreathingStyle(this.playerDatas.lang, this.playerDatas.breath);

        this.client.util.ensureObj(this.playerDatas, this);

        return this.playerDatas;
    }
}

module.exports = PlayerValue;