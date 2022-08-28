const fs = require("fs");
const RPGBreathBase = require("./subclasses/RPGBreathBase");
const RPGTechniqueBase = require("./subclasses/RPGTechniqueBase");

class RPGAssets {
    constructor(client, dir) {
        this.client = client;
        this.dir = dir;

        this.breaths = require(`../${this.dir}/breathingStyles.json`);
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

    getLangDatas(lang, file = null) {
        const langFile = this.client.languageManager.getLang(lang).json;
        const datas = {
            id: lang,
            json: langFile.rpgAssets,
        };

        if (file !== null && file in langFile) datas.json = langFile[file];

        return datas;
    }

    getBreath(lang, id) {
        return new RPGBreathBase(this.getLangDatas(lang, "breathingStyles"), id);
    }
}

module.exports = RPGAssets;