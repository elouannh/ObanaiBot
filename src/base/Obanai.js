/* eslint-disable no-unused-vars */
const { Client, escapeMarkdown, IntentsBitField } = require("discord.js");
const PlayerDb = require("../structure/database/PlayerDb");
const InventoryDb = require("../structure/database/InventoryDb");
const SquadDb = require("../structure/database/SquadDb");
const GuildDb = require("../structure/database/GuildDb");
const ActivityDb = require("../structure/database/ActivityDb");
const MapDb = require("../structure/database/MapDb");
const QuestDb = require("../structure/database/QuestDb");
const InternalServerManager = require("../structure/database/InternalServerManager");
const ExternalServerDb = require("../structure/database/ExternalServerDb");
const StatusDb = require("../structure/database/StatusDb");
const CommandManager = require("./CommandManager");
const EventManager = require("./EventManager");
const Util = require("./Util");
const config = require("../config.json");
const Package = require("../../package.json");
const CollectionManager = require("./CollectionManager");
const LanguageManager = require("./LanguageManager");
const PasteGGClasses = require("./PasteGGClasses");

class Obanai extends Client {
    constructor(token, registerSlash) {
        super({
            intents: new IntentsBitField().add("GuildMessages", "MessageContent", "GuildMembers", "Guilds"),
            failIfNotExists: false,
        });

        this.token = token;
        this.util = Util(this);
        this.registerSlash = registerSlash;
        this.pasteGGManager = new PasteGGClasses.PasteGGManager(this);
        this.commandManager = new CommandManager(this);
        this.eventManager = new EventManager(this);
        this.languageManager = new LanguageManager(this);
        this.eventManager.loadFiles();
        this.config = config;
        this.bitfield = 274878286912n;

        this.prefix = "!";
        this.color = "#2f3136";
        this.version = Package.version;
        this.maxRequests = 30;

        const callbackFunction = function(manager, key) {
            const map = manager.get(key).entries();
            const finalReq = [];
            for (const [entryKey, entryValue] of map) {
                finalReq.push([entryKey, entryValue]);
            }
            return finalReq.map(e => Object.assign({}, { name: e[0], ts: e[1] }));
        };
        const dateNowFunction = function() { return Date.now(); };

        this.requestsManager = new CollectionManager(
            this,
            "requests",
            callbackFunction,
            dateNowFunction,
            dateNowFunction,
        );
        this.cooldownsManager = new CollectionManager(
            this,
            "cooldowns",
            callbackFunction,
            dateNowFunction,
            () => 0,
        );

        this.playerDb = new PlayerDb(this);
        this.activityDb = new ActivityDb(this);
        this.inventoryDb = new InventoryDb(this);
        this.squadDb = new SquadDb(this);
        this.guildDb = new GuildDb(this);
        this.mapDb = new MapDb(this);
        this.questDb = new QuestDb(this);
        this.externalServerDb = new ExternalServerDb(this);
        this.statusDb = new StatusDb(this);

        const PlayerDbCallback = require("../structure/callbacks/PlayerDbCallback")(this);
        const InventoryDbCallback = require("../structure/callbacks/InventoryDbCallback")(this);
        const MapDbCallback = require("../structure/callbacks/MapDbCallback")(this);
        this.playerDb.db.changed(PlayerDbCallback);
        this.inventoryDb.db.changed(InventoryDbCallback);
        this.mapDb.db.changed(MapDbCallback);

        this.internalServerManager = new InternalServerManager(this);

        setInterval(() => this.log("................"), 900_000);
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

    supportLog(title, description, fields, style) {
        const embed = new SuperEmbed();
        embed.setFields(fields)
             .setStyle(style)
             .setEmoji("📰")
             .setTitle(title)
             .setDescription(description);

        if (this.user.id === "958433246050406440") {
            const channel = this.guilds.cache.get(this.config.support).channels.cache.get(this.config.channels.logs);
            channel.send({ embeds: [embed.embed] });
        }
        else {
            // this.log("[AUTO] supportLog()");
            // this.log(`title: ${escapeMarkdown(title)} | description: ${description.replace("```diff\n", "").replace("```", "").replace("\n", " ⁂ ")}`);
        }
    }

    supportProgress(addOrRemove, guild) {
        const embed = new SuperEmbed();
        embed.setStyle(addOrRemove === "add" ? "success" : "error")
             .setEmoji(addOrRemove === "add" ? "🎉" : "🚪")
             .setTitle(addOrRemove === "add" ? "Un serveur a ajouté le bot !" : "Un serveur a retiré le bot...")
             .setDescription(
                `**Serveur**: \`${escapeMarkdown(guild.name)}\`\n**Membres**: \`${guild.memberCount}\`\n\n`
                +
                `*Stats actuelles:*\n\n**Nombre de serveurs**: \`${this.guilds.cache.size}\``,
             );

        if (this.user.id === "958433246050406440") {
            const channel = this.guilds.cache.get(this.config.support).channels.cache.get(this.config.channels.progress);
            channel.send({ embeds: [embed.embed] });
        }
        else {
            // this.log("[AUTO] supportLog()");
            // this.log(`title: ${escapeMarkdown(title)} | description: ${description.replace("```diff\n", "").replace("```", "").replace("\n", " ⁂ ")}`);
        }
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