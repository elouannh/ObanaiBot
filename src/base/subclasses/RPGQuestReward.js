const RPGAssetBase = require("./RPGAssetBase");
const Util = require("../Util");

class RPGQuestReward extends RPGAssetBase {
    constructor(lang, id, rewardData) {
        super(lang, id, rewardData);

        this.items = Object.values(rewardData.data);

        const newItems = [];
        for (const item of this.items) {
            if (item.type === "exp") {
                newItems.push([this.lang.exp.replace("%AMOUNT", Util.intRender(item.data.amount)), item.id, item.data]);
            }
        }
        this.items = newItems;
    }
}

module.exports = RPGQuestReward;