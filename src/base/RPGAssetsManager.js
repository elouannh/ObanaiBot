const RPGBreathingStyle = require("./subclasses/RPGBreathingStyle");
const RPGEnchantedGrimoire = require("./subclasses/RPGEnchantedGrimoire");
const RPGKasugaiCrow = require("./subclasses/RPGKasugaiCrow");
const RPGMapRegion = require("./subclasses/RPGMapRegion");
const RPGMaterial = require("./subclasses/RPGMaterial");
const RPGCharacter = require("./subclasses/RPGCharacter");
const RPGWeapon = require("./subclasses/RPGWeapon");
const RPGPlayerLevel = require("./subclasses/RPGPlayerLevel");
const RPGQuestItem = require("./subclasses/RPGQuestItem");
const RPGStatistic = require("./subclasses/RPGStatistic");
const RPGQuest = require("./subclasses/RPGQuest");
const RPGPlayerHealth = require("./subclasses/RPGPlayerHealth");

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
        this.weapons = require(`../${this.dir}/weapons.json`);
        this.questItems = require(`../${this.dir}/questItems.json`);
        this.statistics = require(`../${this.dir}/statistics.json`);
        this.quests = require(`../${this.dir}/quests.json`);
    }

    getLangData(lang, file = null) {
        const langFile = this.client.languageManager.getLang(lang).json.rpgAssets;
        const data = {
            id: lang,
            json: langFile,
        };

        if (file !== null && file in langFile) data.json = langFile[file];

        return data;
    }

    getBreathingStyle(lang, id) {
        if (!(id in this.breathingStyles)) return "Invalid Breathing Style ID";
        return new RPGBreathingStyle(this.getLangData(lang, "breathingStyles"), id);
    }

    getEnchantedGrimoire(lang, id) {
        if (!(id in this.enchantedGrimoires)) return "Invalid Grimoire ID";
        return new RPGEnchantedGrimoire(
            { json: this.client.languageManager.getLang(lang).json, id: lang },
            id,
            this.enchantedGrimoires[id],
        );
    }

    loadEnchantedGrimoire(lang, enchantedGrimoireData) {
        if (!(enchantedGrimoireData.id in this.enchantedGrimoires)) return "Invalid Grimoire ID";
        return new RPGEnchantedGrimoire(
            { json: this.client.languageManager.getLang(lang).json, id: lang },
            enchantedGrimoireData.id,
            Object.assign(this.enchantedGrimoires[enchantedGrimoireData.id], { "activeSince": enchantedGrimoireData.activeSince }),
        );
    }

    getKasugaiCrow(lang, id) {
        if (!(id in this.kasugaiCrows)) return "Invalid Kasugai Crow ID";
        return new RPGKasugaiCrow(this.getLangData(lang, "kasugaiCrows"), id, this.kasugaiCrows[id]);
    }

    loadKasugaiCrow(lang, kasugaiCrowData) {
        if (!(kasugaiCrowData.id in this.kasugaiCrows)) return "Invalid Kasugai Crow ID";
        return new RPGKasugaiCrow(
            this.getLangData(lang, "kasugaiCrows"),
            kasugaiCrowData.id,
            Object.assign(this.kasugaiCrows[kasugaiCrowData.id], { "exp": kasugaiCrowData.exp, "hunger": kasugaiCrowData.hunger }),
        );
    }

    getMapRegion(lang, id) {
        if (!(id in this.map.regions)) return "Invalid Map Region ID";
        return new RPGMapRegion(this.getLangData(lang, "map"), id, this.map.regions[id]);
    }

    getMaterial(lang, id) {
        if (!(id in this.materials)) return "Invalid Material ID";
        return new RPGMaterial(
            this,
            {
                materials: this.getLangData(lang, "materials"),
                biomes: {
                    json: this.getLangData(lang, "map").json.biomes,
                },
                _id: lang,
            },
            id,
            this.materials[id],
        );
    }

    getCharacter(lang, id) {
        if (!(id in this.characters)) return "Invalid Character ID";
        return new RPGCharacter(this.getLangData(lang, "characters"), id, this.characters[id]);
    }

    getPlayerLevel(exp) {
        if (exp < 0) exp = 0;
        return new RPGPlayerLevel(exp);
    }

    getPlayerHealth(amount, lastHealing) {
        return new RPGPlayerHealth(amount, lastHealing);
    }

    getWeapon(lang, weaponId, weaponRarity) {
        if (!(weaponId in this.weapons.types)) return "Invalid Weapon ID";
        if (!(weaponRarity in this.weapons.rarities)) return "Invalid Weapon Rarity ID";
        return new RPGWeapon(this.getLangData(lang, "weapons"), weaponId, weaponRarity);
    }

    getQuestItem(lang, id) {
        if (!(id in this.questItems)) return "Invalid Quest Item ID";
        return new RPGQuestItem(this.getLangData(lang, "itemQuests"), id);
    }

    getStatistic(lang, statisticId, statisticLevel) {
        if (!(statisticId in this.statistics.names)) return "Invalid Statistic ID";
        if (Number(statisticLevel) < 0 || Number(statisticLevel) > 100) return "Invalid Statistic Level";
        return new RPGStatistic(
            this.getLangData(lang, "statistics"),
            statisticId,
            statisticLevel,
            this.statistics.trainingTimes[String(statisticLevel + (statisticLevel === 100 ? 0 : 1))],
        );
    }

    getQuest(lang, id, questData = null) {
        if (id.startsWith("slayer")) {
            const [tome, arc, quest] = id.split(".").slice(1);
            if (!(tome in this.quests.slayerQuests)) return "Invalid Slayer Quest Tome ID";
            if (!(arc in this.quests.slayerQuests[tome])) return "Invalid Slayer Quest Arc ID";
            if (!(quest in this.quests.slayerQuests[tome][arc])) return "Invalid Slayer Quest ID";

            return new RPGQuest(
                this.getLangData(lang, "quests"),
                id,
                Object.assign(this.quests.slayerQuests[tome][arc][quest], { tome, arc, quest }),
                questData,
            );
        }
        else if (id.startsWith("daily")) {
            const questId = id.split(".")[1];

            return new RPGQuest(
                this.getLangData(lang, "quests"),
                id,
                this.quests.dailyQuests[questId],
                questData,
            );
        }
    }
}

module.exports = RPGAssetsManager;