const RPGBreathingStyle = require("./subclasses/RPGBreathingStyle");
const RPGEnchantedGrimoire = require("./subclasses/RPGEnchantedGrimoire");
const RPGKasugaiCrow = require("./subclasses/RPGKasugaiCrow");
const RPGMapRegion = require("./subclasses/RPGMapRegion");
const RPGMaterial = require("./subclasses/RPGMaterial");
const RPGCharacter = require("./subclasses/RPGCharacter");
const RPGText = require("./subclasses/RPGText");
const RPGWeapon = require("./subclasses/RPGWeapon");
const RPGPlayerLevel = require("./subclasses/RPGPlayerLevel");
const RPGQuestItem = require("./subclasses/RPGQuestItem");

class RPGAssetsManager {
    constructor(client, dir) {
        this.client = client;
        this.dir = dir;

        this.breathingStyles = require(`../${this.dir}/breathingStyles.json`);
        this.enchantedGrimoires = require(`../${this.dir}/enchantedGrimoires.json`);
        this.kasugaiCrows = require(`../${this.dir}/kasugaiCrows.json`);
        this.map = require(`../${this.dir}/map.json`);
        this.materials = require(`../${this.dir}/materials.json`);
        this.characters = require(`../${this.dir}/characters.json`);
        this.texts = require(`../${this.dir}/texts.json`);
        this.weapons = require(`../${this.dir}/weapons.json`);
        this.questItems = require(`../${this.dir}/questItems.json`);
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
        if (!(id in this.breathingStyles)) return "Invalid Breathing Style ID";
        return new RPGBreathingStyle(this.getLangDatas(lang, "breathingStyles"), id);
    }

    getEnchantedGrimoire(lang, id) {
        if (!(id in this.enchantedGrimoires)) return "Invalid Grimoire ID";
        return new RPGEnchantedGrimoire(this.getLangDatas(lang, "enchantedGrimoires"), id, this.enchantedGrimoires[id]);
    }

    loadEnchantedGrimoire(lang, enchantedGrimoireDatas) {
        if (!(enchantedGrimoireDatas.id in this.enchantedGrimoires)) return "Invalid Grimoire ID";
        return new RPGEnchantedGrimoire(
            this.getLangDatas(lang, "enchantedGrimoires"),
            enchantedGrimoireDatas.id,
            Object.assign(this.enchantedGrimoires[enchantedGrimoireDatas.id], { "activeSince": enchantedGrimoireDatas.activeSince }),
        );
    }

    getKasugaiCrow(lang, id) {
        if (!(id in this.kasugaiCrows)) return "Invalid Kasugai Crow ID";
        return new RPGKasugaiCrow(this.getLangDatas(lang, "kasugaiCrows"), id, this.kasugaiCrows[id]);
    }

    loadKasugaiCrow(lang, kasugaiCrowDatas) {
        if (!(kasugaiCrowDatas.id in this.kasugaiCrows)) return "Invalid Kasugai Crow ID";
        return new RPGKasugaiCrow(
            this.getLangDatas(lang, "kasugaiCrows"),
            kasugaiCrowDatas.id,
            Object.assign(this.kasugaiCrows[kasugaiCrowDatas.id], { "exp": kasugaiCrowDatas.exp, "hunger": kasugaiCrowDatas.hunger }),
        );
    }

    getMapRegion(lang, id) {
        if (!(id in this.map.regions)) return "Invalid Map Region ID";
        return new RPGMapRegion(this.getLangDatas(lang, "map"), id, this.map.regions.filter(e => e.id === id)[0]);
    }

    getMaterial(lang, id) {
        if (!(id in this.materials)) return "Invalid Material ID";
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
        if (!(id in this.characters)) return "Invalid Character ID";
        return new RPGCharacter(this.getLangDatas(lang, "characters"), id, this.characters[id]);
    }

    getText(lang, chapterId, questId, type, textId) {
        const fullIds = {
            "chapterId": `chapter${chapterId}`,
            "questId": `quest${questId}`,
        };
        let datas = this.texts;

        if (!(fullIds.chapterId in datas)) return "Invalid Chapter ID";
        datas = datas[fullIds.chapterId];
        if (!(fullIds.questId in datas)) return "Invalid Quest ID";
        datas = datas[fullIds.questId];
        if (!(type in datas)) return "Invalid Text Type";
        datas = datas[type];
        if (!(textId in datas)) return "Invalid Text ID";
        datas = datas[textId];

        return new RPGText(this.getLangDatas(lang, "texts"), datas);
    }

    getPlayerLevel(exp) {
        if (exp < 0) exp = 0;
        return new RPGPlayerLevel(exp);
    }

    getWeapon(lang, weaponId, weaponRarity) {
        if (!(weaponId in this.weapons.types)) return "Invalid Weapon ID";
        if (!(weaponRarity in this.weapons.rarities)) return "Invalid Weapon Rarity ID";
        return new RPGWeapon(this.getLangDatas(lang, "weapons"), weaponId, weaponRarity);
    }

    getQuestItem(lang, id) {
        if (!(id in this.questItems)) return "Invalid Quest Item ID";
        return new RPGQuestItem(this.getLangDatas(lang, "itemQuests"), id);
    }
}

module.exports = RPGAssetsManager;