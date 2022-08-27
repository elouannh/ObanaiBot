const RPGTechniqueBase = require("./RPGTechniqueBase");

class RPGBreathBase {
    constructor(lang, id) {
        this.lang = lang;
        this.id = id;

        const datas = this.lang.json[this.id];
        this.name = datas.name;
        this.techniques = Object.entries(datas.techniques).map(e => new RPGTechniqueBase(this, e[0], e[1]));

        console.log(this.techniques);
    }
}

module.exports = RPGBreathBase;