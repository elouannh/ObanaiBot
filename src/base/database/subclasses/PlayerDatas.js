class PlayerDatas {
    constructor(client, playerDatas, inventoryDatas) {
        this.client = client;
        this.playerDatas = playerDatas;
        this.inventoryDatas = inventoryDatas;

        this.lang = this.playerDatas.lang;

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
            const grimoire = this.client.RPGAssetsManager.getGrimoire(this.lang, this.inventoryDatas.active_grimoire);

            for (const grimoireEffect of grimoire.effects) {
                if (grimoireEffect === "statsBoost") {
                    for (const stat in this.playerDatas.statsLevel) {
                        this.playerDatas.grimBoosts[stat] = [
                            this.client.util.round(this.playerDatas.stats[stat] * (grimoireEffect.strength - 1)),
                            this.client.util.round((grimoireEffect.strength - 1) * 100),
                        ];
                    }
                }
            }
        }

        this.playerDatas.finalStats = { ...this.playerDatas.stats };
        for (const stat in this.playerDatas.finalStats) {
            const sum = this.playerDatas.finalStats[stat] + this.playerDatas.grimBoosts[stat][0];
            this.playerDatas.finalStats[stat] = this.client.util.round(sum);
        }

        this.playerDatas.tournamentStats = { ...this.playerDatas.finalStats };
        for (const stat in this.playerDatas.tournamentStats) {
            this.playerDatas.tournamentStats[stat] = this.client.util.round(
                this.client.util.round(this.playerDatas.finalStats[stat] / 30, 0) * 10,
                0,
            );
        }

        this.playerDatas.level = this.client.RPGAssetsManager.getPlayerLevel(this.playerDatas.exp);
        this.playerDatas.date = `${(this.playerDatas.created / 1000).toFixed(0)}`;
        this.playerDatas.breath = this.client.RPGAssetsManager.getBreathingStyle(this.playerDatas.lang, this.playerDatas.breath);

        this.client.util.ensureObj(this.playerDatas, this);

        return this.playerDatas;
    }
}

module.exports = PlayerDatas;