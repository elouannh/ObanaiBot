/* eslint-disable no-unused-vars */
const { Client, escapeMarkdown, IntentsBitField, User, Snowflake, Collection, EmbedBuilder } = require("discord.js");
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
const config = require("../config.json");
const Package = require("../../package.json");
const CollectionManager = require("./CollectionManager");
const LanguageManager = require("./LanguageManager");
const PasteGGClasses = require("./PasteGGManager");
const RPGAssetsManager = require("./RPGAssetsManager");
const ProcessManager = require("./ProcessManager");
const SQLiteTableMerger = require("./SQLiteTableMerger");

class Obanai extends Client {
    constructor() {
        super({
            intents: new IntentsBitField().add("GuildMessages", "GuildMembers", "Guilds"),
            failIfNotExists: false,
        });
        this.processManager = new ProcessManager();
        this.token = require("../../token.json").token;
        this.util = new Util(this);
        this.log("Starting bot process...");
        this.constants = Constants;
        this.registerSlash = this.processManager.getArgv("registerSlash");
        this.renderTranslations = this.processManager.getArgv("renderTranslations");
        this.mergeSQLiteTables = this.processManager.getArgv("mergeSQLiteTables");
        this.pasteGGManager = new PasteGGClasses.PasteGGManager(this);
        this.commandManager = new CommandManager(this);
        this.eventManager = new EventManager(this);
        this.languageManager = new LanguageManager(this);
        this.RPGAssetsManager = new RPGAssetsManager(this, "assets");
        this.eventManager.loadFiles();
        this.config = config;
        this.bitfield = 274878286912n;

        this.prefix = "!";
        this.color = "#2f3136";
        this.version = Package.version;
        this.maxRequests = 30;

        this.requestsManager = new CollectionManager(this, "requests", this.util.callbackFunction, Date.now, Date.now);
        this.cooldownsManager = new CollectionManager(this, "cooldowns", this.util.callbackFunction, Date.now, () => 0);

        this.playerDb = new PlayerDb(this);
        this.activityDb = new ActivityDb(this);
        this.inventoryDb = new InventoryDb(this);
        this.squadDb = new SquadDb(this);
        this.mapDb = new MapDb(this);
        this.questDb = new QuestDb(this);

        const PlayerDbCallback = require("./database/callbacks/PlayerDbCallback")(this);
        const InventoryDbCallback = require("./database/callbacks/InventoryDbCallback")(this);
        const MapDbCallback = require("./database/callbacks/MapDbCallback")(this);
        // this.playerDb.db.changed(PlayerDbCallback);
        // this.inventoryDb.db.changed(InventoryDbCallback);
        // this.mapDb.db.changed(MapDbCallback);

        this.internalServerManager = new InternalServerManager(this);
        this.SQLiteTableMerger = new SQLiteTableMerger(this, "activityDb", "playerDb", "inventoryDb", "squadDb", "mapDb", "questDb");
        this.lastChannels = new Collection();

        const dbs = Object.values(this).map(e => e?.constructor?.name).filter(e => typeof e === "string").filter(e => e.endsWith("Db"));
        const dbslist = {};
        for (const db of dbs) {
            dbslist[this.util.camelCase(db)] = this[this.util.camelCase(db)];
        }
        this.dbs = dbslist;

        setInterval(() => this.log("................"), 900_000);
        this.launch();
    }

    async throwError(error, origin) {
        const channel = this.guilds.cache.get(this.config.testing).channels.cache.get(this.config.channels.errors);
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`❌ An error occured ! - \`${origin}\``)
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
        if (token.length > 0) this.login(token);
        else this.login(this.token);
    }

    addRole(id, serv, roleId) {
        if (this.user.id === "958433246050406440") {
            try {
                serv.members.cache.get(id)?.roles?.add(roleId);
            }
            catch {
                "que dalle";
            }
        }
        else {
            // this.log("[AUTO] addRole()");
            // this.log(`user: ${id} | serv: ${serv} | roleId: ${roleId}`);
        }
    }

    removeRole(id, serv, roleId) {
        if (this.user.id === "958433246050406440") {
            try {
                serv.members.cache.get(id)?.roles?.remove(roleId);
            }
            catch {
                "que dalle";
            }
        }
        else {
            // this.log("[AUTO] removeRole()");
            // this.log(`user: ${id} | serv: ${serv} | roleId: ${roleId}`);
        }
    }


}

module.exports = Obanai;