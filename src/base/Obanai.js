const { Client, GatewayIntentBits, User, EmbedBuilder } = require("discord.js");
const chalk = require("chalk");
const PlayerDb = require("./database/tables/PlayerDb");
const InventoryDb = require("./database/tables/InventoryDb");
const SquadDb = require("./database/tables/SquadDb");
const ActivityDb = require("./database/tables/ActivityDb");
const MapDb = require("./database/tables/MapDb");
const QuestDb = require("./database/tables/QuestDb");
const AdditionalDb = require("./database/tables/AdditionalDb");
const InternalServerManager = require("./InternalServerManager");
const CommandManager = require("./CommandManager");
const EventManager = require("./EventManager");
const CollectionManager = require("./CollectionManager");
const LanguageManager = require("./LanguageManager");
const { PasteGGManager } = require("./PasteGGManager");
const RPGAssetsManager = require("./RPGAssetsManager");
const Util = require("./Util");
const Enumerations = require("./Enumerations");
const SQLiteTableMerger = require("./SQLiteTableMerger");
const Duration = require("./Duration");
const config = require("../config.json");
const _package = require("../../package.json");

class Obanai extends Client {
    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds],
            failIfNotExists: false,
        });
        this.chalk = chalk;
        this.util = Util;
        this.util.timelog("Starting bot process...");

        this.env = { ...process.env };

        this.pasteGGManager = new PasteGGManager(this);
        this.commandManager = new CommandManager(this);
        this.eventManager = new EventManager(this);
        this.languageManager = new LanguageManager(this);
        this.RPGAssetsManager = new RPGAssetsManager(this, "assets");
        this.requestsManager = new CollectionManager(
            this, "requests", this.util.callbackFunction, Date.now,
        );
        this.cooldownsManager = new CollectionManager(
            this, "cooldowns", this.util.callbackFunction, () => 0,
        );
        this.lastChannelsManager = new CollectionManager(
            this, "lastChannels", this.util.callbackFunction, () => null,
        );

        this.mainLanguage = this.languageManager.getLang("fr");

        this.playerDb = new PlayerDb(this);
        this.activityDb = new ActivityDb(this);
        this.inventoryDb = new InventoryDb(this);
        this.squadDb = new SquadDb(this);
        this.mapDb = new MapDb(this);
        this.questDb = new QuestDb(this);
        this.additionalDb = new AdditionalDb(this);
        this.internalServerManager = new InternalServerManager(this);

        this.SQLiteTableMerger = new SQLiteTableMerger(
            this,
            "activityDb",
            "playerDb",
            "inventoryDb",
            "squadDb",
            "mapDb",
            "questDb",
            "externalServerDb",
            "internalServerManager",
        );

        this.duration = Duration;
        this.enums = Enumerations;
        this.config = config;
        this.bitfield = 274878286912n;
        this.version = _package.version;
        this.maxRequests = 30;

        this.token = require("../../token.json").token;
        this.eventManager.loadFiles();

        setInterval(() => {
            this.util.timelog("................", "blackBright");
        }, 900_000);
    }

    /**
     * Catch an error and log it (in a beautiful bright red).
     * @param {Error} error The error instance
     * @returns {void}
     */
    catchError(error) {
        const date = new Date();
        const data = {
            day: String(date.getDate()),
            month: String(date.getMonth() + 1),
            hour: String(date.getHours()),
            min: String(date.getMinutes()),
            sec: String(date.getSeconds()),
        };
        if (data.day.length < 2) data.day = "0" + data.day;
        if (data.month.length < 2) data.month = "0" + data.month;
        if (data.hour.length < 2) data.hour = "0" + data.hour;
        if (data.min.length < 2) data.min = "0" + data.min;
        if (data.sec.length < 2) data.sec = "0" + data.sec;
        console.log(chalk.redBright(`[${data.month}/${data.day}] [${data.hour}:${data.hour}:${data.sec}]  |  Error: ${error.stack}`));

        if (this.env.TEST_MODE === "1") {
            console.log(error);
        }
    }

    async throwError(error, origin) {
        const channel = this.guilds.cache.get(this.config.testing).channels.cache.get(this.config.channels.errors);
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`❌ ${
                        this.mainLanguage.json.systems.errorOccurred
                    } - \`${origin}\``)
                    .setDescription(`\`\`\`xl\n\n${error.stack.substring(0, 3982)}\`\`\``)
                    .setColor("#FF0000")
                    .setTimestamp(),
            ],
        }).catch(this.catchError);

        if (this.env.TEST_MODE === "1") {
            console.log(error);
        }
    }

    async getUser(id, secureValue) {
        let user = secureValue;
        let cached = false;

        try {
            if ((await this.users.fetch(id) instanceof User)) {
                user = await this.users.fetch(id);
                cached = true;
            }
        }
        catch (err) {
            this.catchError(err);
        }

        return Object.assign(user, { cached });
    }

    launch() {
        return this.login(this.token);
    }

    async evalCode(code) {
        code = `(async () => {\n${code}\n})();`;
        const clean = text => {
            if (typeof text === "string") {
                return text.replace(/`/g, "`" + String.fromCharCode(8203))
                    .replace(/@/g, "@" + String.fromCharCode(8203));
            }
            else {
                return text;
            }
        };
        let response = `📥 **Input**\n\`\`\`js\n${clean(code)}\n\`\`\`\n📤 **Output**\n`;
        try {
            let evaled = await eval(code);
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

            const cleanEvaled = clean(evaled);
            if (cleanEvaled === "undefined") {
                response += "```cs\n# Voided processus```";
            }
            else {
                response += `\`\`\`xl\n${cleanEvaled.substring(0, 2000 - response.length - 20)}\`\`\``;
            }
        }
        catch (err) {
            const cleanErr = clean(err.message);
            response += `\`\`\`xl\n${cleanErr.substring(0, 2000 - response.length - 20)}\`\`\``;
        }

        return response;
    }
}

module.exports = Obanai;