const RPGBreathingStyle = require("./subclasses/RPGBreathingStyle");
const RPGEnchantedGrimoire = require("./subclasses/RPGEnchantedGrimoire");
const RPGMapDistrict = require("./subclasses/RPGMapDistrict");
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
const RPGDialogue = require("./subclasses/RPGDialogue");
const RPGInteraction = require("./subclasses/RPGInteraction");
const fs = require("fs");

class RPGAssetsManager {
    constructor(client, dir) {
        this.client = client;
        this.dir = dir;

        this.breathingStyles = require(`../${this.dir}/breathingStyles.json`);
        this.enchantedGrimoires = require(`../${this.dir}/enchantedGrimoires.json`);
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
        this.dialogues = fs.readdirSync(`./src/${this.dir}/dialogues`)
            .map(file => require(`../${this.dir}/dialogues/${file}`));
        this.interactions = fs.readdirSync(`./src/${this.dir}/interactions`)
            .map(file => require(`../${this.dir}/interactions/${file}`));
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

    getMapRegion(lang, id) {
        if (!(id in this.map.regions)) return "Invalid Map District ID";
        return new RPGMapRegion(this.getLangData(lang, "map"), id, this.map.regions[id]);
    }

    getMapDistrict(lang, id) {
        if (!(id in this.map.districts)) return "Invalid Map District ID";

        const langData = this.getLangData(lang, "map");
        const district = new RPGMapDistrict(langData, id, this.map.districts[id]);
        district.region = this.getMapRegion(langData, this.map.districts[id].region);

        return district;
    }

    getDistrictsDistance(departure, destination) {
        // distance between the sector departure and the district gate (the reference sector where the player must go)
        const departureDistrictGate = departure.district.referenceSector;
        const distanceToLeave = this.getSectorsDistance(departure.sector, departureDistrictGate);

        // distance between the sector destination and the district gate (the reference sector where the player must go)
        const destinationDistrictGate = destination.district.referenceSector;
        const distanceToArrive = this.getSectorsDistance(destination.sector, destinationDistrictGate);

        // distance between the districts
        const distanceBetweenDistricts = Math.sqrt(
            (departure.district.x - destination.district.x) ** 2
            + (departure.district.y - destination.district.y) ** 2
            + (departure.district.z - destination.district.z) ** 2,
        );

        // return the sum of the distances
        return distanceToLeave + distanceBetweenDistricts + distanceToArrive;
    }

    getSectorsDistance(departure, reference) {
        return Math.sqrt(
            (departure.x - reference.x) ** 2 + (departure.y - reference.y) ** 2 + (departure.z - reference.z) ** 2,
        );
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
        return new RPGPlayerLevel(exp).data;
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
        blacksmith.resources = {};
        for (const key in blacksmith.res) {
            blacksmith.resources[key] = {
                instance: this.getMaterial(lang, key),
                amount: blacksmith.res[key],
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

    async getDialogue(lang, id, userId) {
        if (!this.dialogues.map(e => e.id).includes(id)) return "Invalid Dialogue ID";
        const dialogue = new RPGDialogue(
            this.client.languageManager.getLang(lang).json.dialogues,
            id,
            this.dialogues.filter(e => e.id === id)?.at(0),
        );

        for (const replica of (await dialogue.read(this.client, userId))) {
            dialogue.content.push(dialogue.lang.contents[id].replicas[replica]);
        }

        return { name: dialogue.lang.names[dialogue.name], id, content: dialogue.content };
    }

    async getInteraction(lang, id) {
        if (!this.interactions.map(e => e.id).includes(id)) return "Invalid Interaction ID";
        return new RPGInteraction(
            this.client.languageManager.getLang(lang).json.interactions,
            id,
            this.interactions.filter(e => e.id === id)?.at(0),
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