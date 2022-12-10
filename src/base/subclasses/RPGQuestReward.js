const RPGAssetBase = require("./RPGAssetBase");
const Util = require("../Util");

class RPGQuestReward extends RPGAssetBase {
    constructor(lang, id, rewardData) {
        super(lang, id, rewardData);

        this.items = Object.values(rewardData.data);

        const newItems = [];
        for (const item of this.items) {
            switch (item.type) {
                case "exp":
                    newItems.push(
                        [
                            this.lang.json.rewards.exp.replace("%AMOUNT", Util.intRender(item.data.amount)),
                            item.id,
                            item.data,
                        ],
                    );
                    break;
                case "material":
                    newItems.push(
                        [
                            this.lang.json.rewards.material
                                .replace("%MATERIAL", this.lang.json.materials[item.data.material])
                                .replace("%AMOUNT", Util.intRender(item.data.amount)),
                            item.id,
                            item.data,
                        ],
                    );
                    break;
                case "questItem":
                    newItems.push(
                        [
                            this.lang.json.rewards.questItem
                                .replace("%QUEST_ITEM", this.lang.json.questItems[item.data.questItem])
                                .replace("%AMOUNT", Util.intRender(item.data.amount)),
                            item.id,
                            item.data,
                        ],
                    );
                    break;
                case "money":
                    newItems.push(
                        [
                            this.lang.json.rewards.money.replace("%AMOUNT", Util.intRender(item.data.amount)),
                            item.id,
                            item.data,
                        ],
                    );
                    break;
                case "enchantedGrimoire":
                    newItems.push(
                        [
                            this.lang.json.rewards.enchantedGrimoire
                                .replace(
                                    "%ENCHANTED_GRIMOIRE",
                                    this.lang.json.enchantedGrimoires.names[item.data.enchantedGrimoire],
                                )
                                .replace("%AMOUNT", Util.intRender(item.data.amount)),
                            item.id,
                            item.data,
                        ],
                    );
                    break;
                case "weapon":
                    newItems.push(
                        [
                            this.lang.json.rewards.weapon
                                .replace("%WEAPON", this.lang.json.weapons.types[item.data.weapon])
                                .replace("%RARITY", this.lang.json.weapons.rarities[item.data.rarity])
                                .replace("%AMOUNT", Util.intRender(item.data.amount)),
                            item.id,
                            item.data,
                        ],
                    );
                    break;
                case "theme":
                    newItems.push(
                        [
                            this.lang.json.rewards.theme.replace("%THEME", this.lang.json.themes[item.data.theme]),
                            item.id,
                            item.data,
                        ],
                    );
                    break;
                default:
                    break;
            }

        }
        this.items = newItems;
    }
}

module.exports = RPGQuestReward;