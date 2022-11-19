const RPGAssetBase = require("./RPGAssetBase");
const RPGGrimoireEffect = require("./RPGEnchantedGrimoireEffect");
const Util = require("../Util");
const Duration = require("../Duration");

class RPGEnchantedGrimoire extends RPGAssetBase {
    constructor(lang, id, grimoireData) {
        super(lang, id);

        const data = grimoireData;
        this.name = this.lang.json.rpgAssets.enchantedGrimoires.names[this.id];
        this.lifespan = data.lifespan;
        this.type = this.lang.json.rpgAssets.enchantedGrimoires.types[data.type];
        this.effects = data.effects.map(e => new RPGGrimoireEffect(this, e, this.lang.json.rpgAssets.enchantedGrimoires.effects[e.id]));

        if (typeof data.lifespan !== "number") this.lifespan = this.lang.json.rpgAssets.enchantedGrimoires.lifespans.infinite;
        else this.lifespan = new Duration(data.lifespan * 1000, this.lang.json.systems.timeUnits).convert("long", true);

        if ("activeSince" in data) this.activeSince = (data.activeSince / 1000).toFixed(0);
        else this.activeSince = null;
    }
}

module.exports = RPGEnchantedGrimoire;