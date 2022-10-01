const { Client, IntentsBitField, User, EmbedBuilder } = require("discord.js");
const PlayerDb = require("./database/tables/PlayerDb");
const InventoryDb = require("./database/tables/InventoryDb");
const SquadDb = require("./database/tables/SquadDb");
const ActivityDb = require("./database/tables/ActivityDb");
const MapDb = require("./database/tables/MapDb");
const QuestDb = require("./database/tables/QuestDb");
const InternalServerManager = require("./InternalServerManager");
const CommandManager = require("./CommandManager");
const EventManager = require("./EventManager");
const Util = require("./Util");
const Constants = require("./Constants");
const CollectionManager = require("./CollectionManager");
const LanguageManager = require("./LanguageManager");
const { PasteGGManager } = require("./PasteGGManager");
const RPGAssetsManager = require("./RPGAssetsManager");
const ProcessManager = require("./ProcessManager");
const SQLiteTableMerger = require("./SQLiteTableMerger");
const Duration = require("./Duration");
const config = require("../config.json");
const _package = require("../../package.json");

class Obanai extends Client {
    constructor() {
        super({
            intents: new IntentsBitField().add("Guilds"),
            failIfNotExists: false,
        });
        this.util = new Util(this);
        this.log("Starting bot process...");

        this.processManager = new ProcessManager(this);
        this.registerSlash = this.processManager.getArgv("registerSlash");
        this.renderTranslations = this.processManager.getArgv("renderTranslations");
        this.mergeSQLiteTables = this.processManager.getArgv("mergeSQLiteTables");
        this.internalServerManager = new InternalServerManager(this);
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
        this.constants = Constants;
        this.config = config;
        this.bitfield = 274878286912n;
        this.version = _package.version;
        this.maxRequests = 30;

        this.token = require("../../token.json").token;
        this.eventManager.loadFiles();
        void this.launch();

        setInterval(() => this.log("................"), 900_000);
    }

    async throwError(error, origin) {
        const channel = this.guilds.cache.get(this.config.testing).channels.cache.get(this.config.channels.errors);
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`❌ ${
                        this.languageManager.getLang("fr").json.systems.client.errorOccurred
                    } - \`${origin}\``)
                    .setDescription(`\`\`\`xl\n\n${error.stack.substring(0, 3982)}\`\`\``)
                    .setColor("#FF0000")
                    .setTimestamp(),
            ],
        }).catch(this.util.catchError);
    }

    async getUser(id, secureValue) {
        let user = secureValue;
        let cached = true;

        try {
            if (!((await this.users.fetch(id)) instanceof User)) {
                cached = false;
            }
            else {
                user = await this.users.fetch(id);
            }
        }
        catch {
            cached = false;
        }

        return { user, cached, userId: user?.id };
    }

    log(message, ...args) {
        const time = this.util.dateRender(new Date(), true);
        console.log(`${time} || ${message}`);
        for (const arg of args) {
            console.log(arg);
        }
    }

    launch(token = "") {
        if (token.length > 0) return this.login(token);
        else return this.login(this.token);
    }
}

module.exports = Obanai;