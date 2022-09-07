const TableDatas = require("./TableDatas");

class ActivityDatas extends TableDatas {
    constructor(client, activityDatas) {
        super(client, activityDatas);

        this.lang = this.datas.lang;

        this.load();
        this.overwrite();
    }

    load() {
        if (this.datas.training.currentlyTraining) {
            this.datas
        }
        for (const forgeId in this.datas.forge.forgingSlots) {
            const forge = this.datas.forge.forgingSlots[forgeId];
            if (forge.weapon.id !== null) {
                const weapon = this.client.RPGAssetsManager.getWeapon(this.lang, forge.weapon.id, forge.weapon.rarity);
                forge.weapon.rarity = weapon.rarity;
            }
        }
    }
}

module.exports = ActivityDatas;