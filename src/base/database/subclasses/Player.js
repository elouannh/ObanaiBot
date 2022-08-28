const calcPlayerLevel = require("../../../elements/calcPlayerLevel");

class Player {
    constructor(client, playerDatas, inventoryDatas) {
        this.datas = (async () => await this.load(client, { playerDatas, inventoryDatas }))();
    }

    async load(client, rawDatas) {
        for (const stat in rawDatas.playerDatas.stats) {
            if (typeof rawDatas.playerDatas.statsLevel === "undefined") rawDatas.playerDatas.statsLevel = {};
            rawDatas.playerDatas.statsLevel[stat] = rawDatas.playerDatas.stats[stat];
            rawDatas.playerDatas.stats[stat] = client.util.round(rawDatas.playerDatas.stats[stat] * 10);
        }

        rawDatas.playerDatas.grimBoosts = {
            strength: [0, 0],
            defense: [0, 0],
            agility: [0, 0],
            speed: [0, 0],
        };
        if (rawDatas.inventoryDatas.active_grimoire !== null) {
            const gr = require(`../../../elements/grimoires/${rawDatas.inventoryDatas.active_grimoire}.json`);

            if (gr.benefits.includes("stats_boost")) {
                for (const stat in rawDatas.playerDatas.statsLevel) {
                    rawDatas.playerDatas.grimBoosts[stat] = [
                        client.util.round(rawDatas.playerDatas.stats[stat] * (gr.boost - 1)),
                        client.util.round((gr.boost - 1) * 100),
                    ];
                }
            }
        }

        const cat = require(`../../../elements/categories/${rawDatas.playerDatas.category}`);
        rawDatas.playerDatas.catBoosts = {
            [cat.bonus[0]]: [0, 0],
            [cat.bonus[1]]: [0, 0],
        };
        rawDatas.playerDatas.catBoosts[cat.bonus[0]] = [
            client.util.round(rawDatas.playerDatas.stats[cat.bonus[0]] * (rawDatas.playerDatas.categoryLevel / 20)),
            client.util.round((rawDatas.playerDatas.categoryLevel / 20) * 100),
        ];
        rawDatas.playerDatas.catBoosts[cat.bonus[1]] = [
            client.util.round(rawDatas.playerDatas.stats[cat.bonus[1]] * (-rawDatas.playerDatas.categoryLevel / 50)),
            client.util.round((-rawDatas.playerDatas.categoryLevel / 50) * 100),
        ];

        rawDatas.playerDatas.finalStats = { ...rawDatas.playerDatas.stats };
        for (const stat in rawDatas.playerDatas.finalStats) {
            let sum = rawDatas.playerDatas.finalStats[stat] + rawDatas.playerDatas.grimBoosts[stat][0];
            if (stat in rawDatas.playerDatas.catBoosts) sum += rawDatas.playerDatas.catBoosts[stat][0];
            rawDatas.playerDatas.finalStats[stat] = client.util.round(sum);
        }

        rawDatas.playerDatas.tournamentStats = { ...rawDatas.playerDatas.finalStats };
        for (const stat in rawDatas.playerDatas.tournamentStats) {
            rawDatas.playerDatas.tournamentStats[stat] = client.util.round(
                client.util.round(rawDatas.playerDatas.finalStats[stat] / 30, 0) * 10,
                0,
            );
        }

        rawDatas.playerDatas.level = calcPlayerLevel(rawDatas.playerDatas.exp);
        rawDatas.playerDatas.date = `${(rawDatas.playerDatas.created / 1000).toFixed(0)}`;

        rawDatas.playerDatas.category = require(`../../../elements/categories/${rawDatas.playerDatas.category}.json`);
        rawDatas.playerDatas.breath = client.RPGAssets.getBreath(rawDatas.playerDatas.lang, rawDatas.playerDatas.breath);

        client.util.ensureObj(rawDatas.playerDatas, this);

        return rawDatas.playerDatas;
    }
}

module.exports = Player;