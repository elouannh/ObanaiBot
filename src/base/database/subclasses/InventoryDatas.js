const TableDatas = require("./TableDatas");

class InventoryDatas extends TableDatas {
    constructor(client, inventoryDatas, lang) {
        super(client, inventoryDatas);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        const kasugaiCrow = this.client.RPGAssetsManager.getKasugaiCrow(this.lang, this.datas.kasugaiCrow.id);
        kasugaiCrow["exp"] = this.datas.kasugaiCrow.exp;
        kasugaiCrow["hunger"] = this.datas.kasugaiCrow.hunger;
        this.datas.kasugaiCrow = kasugaiCrow;

        const enchantedGrimoire = this.client.RPGAssetsManager.getEnchantedGrimoire(this.lang, this.datas.enchantedGrimoire.id);
        enchantedGrimoire["activeSince"] = this.datas.enchantedGrimoire.activeSince;
        this.datas.enchantedGrimoire = enchantedGrimoire;

        this.datas.weapon = this.client.RPGAssetsManager.getWeapon(this.lang, this.datas.weapon.id, this.datas.weapon.rarity);
    }
}

module.exports = InventoryDatas;