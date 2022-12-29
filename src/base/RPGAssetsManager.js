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
const RPGPlayerRank = require("./subclasses/RPGPlayerRank");
const RPGProbability = require("./subclasses/RPGProbability");
const RPGBlacksmith = require("./subclasses/RPGBlacksmith");

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
        this.ranks = require(`../${this.dir}/ranks.json`);
        this.probabilities = require(`../${this.dir}/probabilities.json`);
        this.blacksmiths = require(`../${this.dir}/blacksmiths.json`);
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

        const grimoireData = this.enchantedGrimoires[enchantedGrimoireData.id];
        const grimoire = this.getEnchantedGrimoire(lang, grimoireData.id);
        grimoire["activeSince"] = (enchantedGrimoireData.activeSince / 1000).toFixed(0);
        if (grimoireData.lifespan === "infinite") {
            grimoire["expirationDate"] = "1671490";
        }
        else {
            grimoire["expirationDate"] = ((enchantedGrimoireData.activeSince + (grimoireData.lifespan * 1000)) / 1000).toFixed(0);
        }

        return grimoire;
    }

    getKasugaiCrow(lang, id) {
        if (!(id in this.kasugaiCrows)) return "Invalid Kasugai Crow ID";
        return new RPGKasugaiCrow(this.getLangData(lang, "kasugaiCrows"), id, this.kasugaiCrows[id]);
    }

    loadKasugaiCrow(lang, kasugaiCrowData) {
        if (!(kasugaiCrowData.id in this.kasugaiCrows)) return "Invalid Kasugai Crow ID";

        const crowData = this.kasugaiCrows[kasugaiCrowData.id];
        const crow = this.getKasugaiCrow(lang, crowData.id);
        crow["hunger"] = kasugaiCrowData.hunger;
        crow["lastFeeding"] = (kasugaiCrowData.lastFeeding / 1000).toFixed(0);

        return crow;
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

    getPlayerRank(lang, rankId) {
        if (!(rankId in this.ranks)) return "Invalid Rank ID";
        return new RPGPlayerRank(this.getLangData(lang, "ranks"), rankId, this.ranks[rankId]);
    }

    getBlacksmith(lang, blacksmithRankId) {
        if (!(blacksmithRankId in this.blacksmiths)) return "Invalid Blacksmith ID";
        const blacksmith = new RPGBlacksmith(
            this.getLangData(lang, "blacksmiths"), blacksmithRankId, this.blacksmiths[blacksmithRankId],
        );
        for (const key in blacksmith.resources) {
            blacksmith.resources[key] = {
                instance: this.getMaterial(lang, key),
                amount: blacksmith.resources[key],
            };
        }
        return blacksmith;
    }

    loadBlacksmith(lang, blacksmithData) {
        if (!(blacksmithData.rank in this.blacksmiths)) return "Invalid Blacksmith ID";

        const blacksmith = this.getBlacksmith(lang, blacksmithData.rank);
        blacksmith["forgedWeapons"] = blacksmithData.forgedWeapons;

        return blacksmith;
    }

    getQuest(lang, id) {
        const questType = `${id.split(".")[0]}Quests`;
        if (!(questType in this.quests)) return "Invalid Quest Type";
        if (!(id in this.quests[questType])) return "Invalid Quest ID";

        return new RPGQuest(
            this.getLangData(lang),
            id,
            this.quests[questType][id],
        );
    }

    randomQuest(type) {
        const questType = `${type}Quests`;
        if (!(questType in this.quests)) return "Invalid Quest Type";
        const quests = Object.keys(this.quests[questType]);
        return quests[Math.floor(Math.random() * quests.length)];
    }

    loadQuest(lang, id, questData) {
        const questType = `${id.split(".")[0]}Quests`;
        if (!(questType in this.quests)) return "Invalid Quest Type";
        if (!(id in this.quests[questType])) return "Invalid Quest ID";

        const langData = this.getLangData(lang);
        const quest = new RPGQuest(
            langData,
            id,
            this.quests[questType][id],
        );
        for (const objId in questData.objectives) {
            if (!(objId in quest.objectives)) continue;
            quest.objectives[objId].progress = questData.objectives[objId].completed
                ? this.client.enums.Systems.Symbols.Check
                : this.client.enums.Systems.Symbols.Cross;
            quest.objectives[objId].completed = questData.objectives[objId].completed;
        }

        return quest;
    }

    getSlayerQuestsIds() {
        return ["slayer.0.0.0.null"].concat(Object.keys(this.quests.slayerQuests));
    }

    getProbability(...path) {
        let objectFocused = this.probabilities;
        let probability = "Invalid Probability ID";
        for (const p of path) {
            if (!(p in objectFocused)) {
                probability = "Invalid Probability ID";
                break;
            }
            if (objectFocused[p]?.length) {
                probability = new RPGProbability(objectFocused[p], objectFocused.labels);
            }
            else {
                objectFocused = objectFocused[p];
            }
        }
        return probability;
    }

}

module.exports = RPGAssetsManager;