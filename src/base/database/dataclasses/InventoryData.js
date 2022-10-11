const TableData = require("../../TableData");

class InventoryData extends TableData {
    constructor(client, inventoryData, lang) {
        super(client, inventoryData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        if (this.data.kasugaiCrow.id !== null) {
            this.data.kasugaiCrow = this.client.RPGAssetsManager.loadKasugaiCrow(this.lang, this.data.kasugaiCrow);
        }
        if (this.data.enchantedGrimoire.id !== null) {
            this.data.enchantedGrimoire = this.client.RPGAssetsManager.loadEnchantedGrimoire(
                this.lang, this.data.enchantedGrimoire,
            );
        }
        this.data.weapon = this.client.RPGAssetsManager.getWeapon(this.lang, this.data.weapon.id, this.data.weapon.rarity);

        const newItems = this.data.items;

        for (const enchantedGrimoireKey in this.data.items.enchantedGrimoires) {
            const enchantedGrimoireAmount = newItems.enchantedGrimoires[enchantedGrimoireKey];
            const enchantedGrimoireList = [];
            for (let i = 0; i < enchantedGrimoireAmount; i++) {
                enchantedGrimoireList.push(this.client.RPGAssetsManager.getEnchantedGrimoire(this.lang, enchantedGrimoireKey));
            }
            newItems.enchantedGrimoires[enchantedGrimoireKey] = { list: enchantedGrimoireList, amount: enchantedGrimoireAmount };
        }

        for (const materialKey in this.data.items.materials) {
            const materialAmount = newItems.materials[materialKey];
            newItems.materials[materialKey] = { material: this.client.RPGAssetsManager.getMaterial(this.lang, materialKey), amount: materialAmount };
        }

        for (const questItemKey in this.data.items.questItems) {
            const questItemAmount = newItems.questItems[questItemKey];
            const questItemList = [];
            for (let i = 0; i < questItemAmount; i++) {
                questItemList.push(this.client.RPGAssetsManager.getQuestItem(this.lang, questItemKey));
            }
            newItems.questItems[questItemKey] = { list: questItemList, amount: questItemAmount };
        }

        for (const weaponKey in this.data.items.weapons) {
            for (const weaponRarityKey in this.data.items.weapons[weaponKey]) {
                const weaponAmount = newItems.weapons[weaponKey][weaponRarityKey];
                const weaponList = [];
                for (let i = 0; i < weaponAmount; i++) {
                    weaponList.push(this.client.RPGAssetsManager.getWeapon(this.lang, weaponKey, weaponRarityKey));
                }

                newItems.weapons[weaponKey][weaponRarityKey] = weaponAmount;

                if ("list" in newItems.weapons) for (const weapon of weaponList) newItems.weapons.list.push(weapon);
                else newItems.weapons.list = weaponList;
            }
        }
        if ("list" in newItems.weapons) newItems.weapons.list = newItems.weapons.list.sort((a, b) => b.rarity - a.rarity);
        newItems.weapons.totalAmount = newItems.weapons?.list?.length || 0;

        this.data.items = newItems;
    }
}

module.exports = InventoryData;