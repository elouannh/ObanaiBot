const fs = require("fs");
const RPGBreath = require("./subclasses/RPGBreath");
const RPGGrimoire = require("./subclasses/RPGGrimoire");
const RPGKasugaiCrow = require("./subclasses/RPGKasugaiCrow");
const RPGMapRegion = require("./subclasses/RPGMapRegion");
const RPGMaterial = require("./subclasses/RPGMaterial");
const RPGCharacter = require("./subclasses/RPGCharacter");

class RPGAssetsManager {
    constructor(client, dir) {
        this.client = client;
        this.dir = dir;

        this.breathingStyles = require(`../${this.dir}/breathingStyles.json`);
        this.grimoires = require(`../${this.dir}/grimoires.json`);
        this.kasugaiCrows = require(`../${this.dir}/kasugaiCrows.json`);
        this.map = require(`../${this.dir}/map.json`);
        this.materials = require(`../${this.dir}/materials.json`);
        this.characters = require(`../${this.dir}/characters.json`);
        // this.texts = fs.readdirSync(`./src/${this.dir}/texts`).map(e => require(`../${this.dir}/texts/${e}`));
    }

    getLangDatas(lang, file = null) {
        const langFile = this.client.languageManager.getLang(lang).json.rpgAssets;
        const datas = {
            id: lang,
            json: langFile,
        };

        if (file !== null && file in langFile) datas.json = langFile[file];

        return datas;
    }

    getBreathingStyle(lang, id) {
        if (!(id in this.breathingStyles)) return null;
        return new RPGBreath(this.getLangDatas(lang, "breathingStyles"), id);
    }

    getGrimoire(lang, id) {
        if (!(id in this.grimoires)) return null;
        return new RPGGrimoire(this.getLangDatas(lang, "grimoires"), id, this.grimoires[id]);
    }

    getKasugaiCrow(lang, id) {
        if (!(id in this.kasugaiCrows)) return null;
        return new RPGKasugaiCrow(this.getLangDatas(lang, "kasugaiCrows"), id, this.kasugaiCrows[id]);
    }

    getMapRegion(lang, id) {
        if (!(id in this.map.regions)) return null;
        return new RPGMapRegion(this.getLangDatas(lang, "map"), id, this.map.regions.filter(e => e.id === id)[0]);
    }

    getMaterial(lang, id) {
        if (!(id in this.materials)) return null;
        return new RPGMaterial(
            this,
            {
                materials: this.getLangDatas(lang, "materials"),
                biomes: {
                    json: this.getLangDatas(lang, "map").json.biomes,
                },
                _id: lang,
            },
            id,
            this.materials[id],
        );
    }

    getCharacter(lang, id) {
        if (!(id in this.characters)) return null;
        return new RPGCharacter(this.getLangDatas(lang, "characters"), id, this.characters[id]);
    }
}

module.exports = RPGAssetsManager;