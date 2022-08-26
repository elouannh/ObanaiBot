const fs = require("fs");
const RPGBreathBase = require("./subclasses/RPGBreathBase");
const RPGMovementBase = require("./subclasses/RPGMovementBase");

class RPGAssets {
    constructor(dir) {
        this.dir = dir;

        this.breaths = fs.readdirSync(`./src/${this.dir}/breaths`).map(e => require(`../${this.dir}/breaths/${e}`));
        this.categories = fs.readdirSync(`./src/${this.dir}/categories`).map(e => require(`../${this.dir}/categories/${e}`));
        this.grimoires = fs.readdirSync(`./src/${this.dir}/grimoires`).map(e => require(`../${this.dir}/grimoires/${e}`));
        this.kasugaiCrows = fs.readdirSync(`./src/${this.dir}/kasugai_crows`).map(e => require(`../${this.dir}/kasugai_crows/${e}`));
        this.map = {
            regions: fs.readdirSync(`./src/${this.dir}/map`).map(r => require(`../${this.dir}/map/${r}`)),
        };
        this.materials = fs.readdirSync(`./src/${this.dir}/materials`).map(e => require(`../${this.dir}/materials/${e}`));
        this.pnjs = fs.readdirSync(`./src/${this.dir}/pnjs`).map(e => require(`../${this.dir}/pnjs/${e}`));
        this.texts = fs.readdirSync(`./src/${this.dir}/texts`).map(e => require(`../${this.dir}/texts/${e}`));
    }

    getBreath(id) {
        if (id in this.breaths) {
            return this.breaths[id];
        }
        return 0;
    }
}

module.exports = RPGAssets;