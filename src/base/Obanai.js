const { Client } = require("discord.js");
const { PlayerDb } = require("../structure/database/PlayerDb");
const { InventoryDb } = require("../structure/database/InventoryDb");
const { SquadDb } = require("../structure/database/SquadDb");
const { GuildDb } = require("../structure/database/GuildDb");
const { ActivityDb } = require("../structure/database/ActivityDb");
const { MapDb } = require("../structure/database/MapDb");
const { QuestDb } = require("../structure/database/QuestDb");
const { InternalServerManager } = require("../structure/database/InternalServerManager");
const { ExternalServerDb } = require("../structure/database/ExternalServerDb");
const CommandManager = require("./CommandManager");
const config = require("../config.json");

class Obanai extends Client {
    constructor(token) {
        super({
            intents: 1795,
        });

        this.token = token;
        this.commandManager = new CommandManager(this);
        this.config = config;
        this.bitfield = 274878286912n;

        this.prefix = "!";
        this.color = "#2f3136";

        this.playerDb = new PlayerDb(this);
        this.activityDb = new ActivityDb(this);
        this.inventoryDb = new InventoryDb(this);
        this.squadDb = new SquadDb(this);
        this.guildDb = new GuildDb(this);
        this.mapDb = new MapDb(this);
        this.questDb = new QuestDb(this);
        this.externalServerDb = new ExternalServerDb(this);

        const PlayerDbCallback = require("../structure/callbacks/PlayerDbCallback")(this);
        const InventoryDbCallback = require("../structure/callbacks/InventoryDbCallback")(this);
        const MapDbCallback = require("../structure/callbacks/MapDbCallback")(this);
        this.playerDb.db.changed(PlayerDbCallback);
        this.inventoryDb.db.changed(InventoryDbCallback);
        this.mapDb.db.changed(MapDbCallback);


        this.internalServerManager = new InternalServerManager(this);
    }

    launch(token = "") {
        (async () => await this.commandManager.loadFiles())();

        if (token.length > 0) this.login(token);
        else this.login(this.token);
    }
}

module.exports = Obanai;