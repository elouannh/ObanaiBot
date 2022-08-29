const RPGAssetBase = require("./RPGAssetBase");
const RPGGrimoireEffect = require("./RPGGrimoireEffect");
const Util = require("../Util");

class RPGGrimoire extends RPGAssetBase {
    constructor(lang, id, grimoireDatas) {
        super(lang, id);

        const datas = grimoireDatas;
        this.name = this.lang.json.names[this.id];
        this.lifespan = lifespan;
        this.type = this.lang.json.types[datas.type];
        this.effects = datas.effects.map(e => new RPGGrimoireEffect(this, e.id, this.lang.json.effects[e.id]));

        if (typeof datas.lifespan !== "number") this.lifespan = this.lang.json.lifespans.infinite;
        else this.lifespan = new Util(null).convertDate(datas.lifespan * 1000);
    }
}

module.exports = RPGGrimoire;