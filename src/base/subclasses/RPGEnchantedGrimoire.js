const RPGAssetBase = require("./RPGAssetBase");
const RPGGrimoireEffect = require("./RPGEnchantedGrimoireEffect");
const Util = require("../Util");

class RPGEnchantedGrimoire extends RPGAssetBase {
    constructor(lang, id, grimoireData) {
        super(lang, id);

        const data = grimoireData;
        this.name = this.lang.json.names[this.id];
        this.lifespan = data.lifespan;
        this.type = this.lang.json.types[data.type];
        this.effects = data.effects.map(e => new RPGGrimoireEffect(this, e, this.lang.json.effects[e.id]));

        if (typeof data.lifespan !== "number") this.lifespan = this.lang.json.lifespans.infinite;
        else this.lifespan = Util.convertDate(data.lifespan * 1000);

        if ("activeSince" in data) this.activeSince = String(Util.round(data.activeSince / 1000, 0));
    }
}

module.exports = RPGEnchantedGrimoire;