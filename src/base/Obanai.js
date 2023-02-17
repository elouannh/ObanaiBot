/* eslint-disable no-unused-vars */
const {
    Client,
    GatewayIntentBits,
    User,
    EmbedBuilder,
    TextChannel,
    MessagePayload,
    MessageCreateOptions,
} = require("discord.js");
const chalk = require("chalk");
const PlayerDb = require("./database/tables/PlayerDb");
const InventoryDb = require("./database/tables/InventoryDb");
const ActivityDb = require("./database/tables/ActivityDb");
const MapDb = require("./database/tables/MapDb");
const QuestDb = require("./database/tables/QuestDb");
const AdditionalDb = require("./database/tables/AdditionalDb");
const InternalServerManager = require("./InternalServerManager");
const CommandManager = require("./CommandManager");
const EventManager = require("./EventManager");
const CollectionManager = require("./CollectionManager");
const LanguageManager = require("./LanguageManager");
const RPGAssetsManager = require("./RPGAssetsManager");
const Util = require("./Util");
const Enumerations = require("./Enumerations");
const SQLiteTableMerger = require("./SQLiteTableMerger");
const Duration = require("./Duration");
const config = require("../config.json");
const _package = require("../../package.json");
const fs = require("fs");

class Obanai extends Client {
    constructor() {
        super({
            intents: [GatewayIntentBits.Guilds],
            failIfNotExists: false,
        });
        this.chalk = chalk;
        this.util = Util;
        this.util.timelog("Starting bot process...");
        this.printEnv();

        this.env = { ...process.env };
        this.commandManager = new CommandManager(this);
        this.eventManager = new EventManager(this);
        this.languageManager = new LanguageManager(this);
        this.RPGAssetsManager = new RPGAssetsManager(this, "assets");
        this.requestsManager = new CollectionManager(
            this, "requests", this.util.reqCallbackFunction, Date.now,
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

        this.token = require("../token.json").token;
        this.eventManager.loadFiles();

        setInterval(() => {
            this.util.timelog("................", "blackBright");
        }, 900_000);
    }

    printEnv() {
        const envFile = fs.readFileSync("./.env", "utf8");
        const maxLength = envFile.split("\n").map(e => e.length).sort((a, b) => b - a)[0];
        const envLines = envFile.split("\n")
            .map(e =>
                [e.split("=")[0], e.split("=")[1], e.split("=")[0].length],
            )
            .map(e =>
                `  | ${e[0]}${".".repeat(maxLength + 4 - e[2])}${e[1]}`,
            )
            .join("\n");
        this.util.timelog(`Env variables:\n${envLines}`, "yellow");
    }

    envUpdate(key, newValue) {
        const envFile = fs.readFileSync("./.env", "utf8");
        const envFileLines = envFile.split("\n");
        const newEnvFileLines = [];
        for (const line of envFileLines) {
            if (line.startsWith(key)) {
                newEnvFileLines.push(`${key}=${newValue}`);
            }
            else {
                newEnvFileLines.push(line);
            }
        }
        fs.writeFileSync("./.env", newEnvFileLines.join("\n"));
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
        console.log(chalk.redBright(`[${data.month}/${data.day}] [${data.hour}:${data.hour}:${data.sec}]  |  Error: ${error.message}`));
    }

    async throwError(error, origin) {
        const channel = this.guilds.cache.get(this.config.testing).channels.cache.get(this.config.errorsChannel);
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

        if (this?.env?.TEST_MODE === "1") {
            console.log(error);
        }
    }

    /**
     * Returns the user if the id is able to be fetched.
     * @param {String} id The user ID
     * @param {*} secureValue The value to be returned if the user is not found
     * @returns {Promise<User & {cached: Boolean}>}
     */
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

    /**
     * Get the link of the message above the context.
     * @param {TextChannel} channel The channel instance
     * @returns {Promise<String>}
     */
    async getPlaceLink(channel) {
        let link = null;
        try {
            link = `https://discord.com/channels/${channel.guildId}/${channel.id}/${channel.lastMessageId}`;
        }
        catch (err) {
            this.catchError(err);
        }
        return link;
    }

    /**
     * Returns the channel if able to be fetched.
     * @param {String} id The channel ID
     * @param {*} secureValue The value to be returned if the channel is not found
     * @returns {Promise<TextChannel & {cached: Boolean}>}
     */
    async getChannel(id, secureValue) {
        let channel = secureValue;
        let cached = false;

        try {
            if ((await this.channels.fetch(id) instanceof Object)) {
                channel = await this.channels.fetch(id);
                cached = true;
            }
        }
        catch (err) {
            this.catchError(err);
        }

        return Object.assign(channel, { cached });
    }

    /**
     * Notify the user in a specific channel.
     * @param {String} id The user ID
     * @param {MessagePayload|MessageCreateOptions} payload The payload to send
     * @returns {Promise<string>}
     */
    async notify(id, payload) {
        const data = this.additionalDb.get(id);
        let channel = null;
        if (data.notifications.startsWith("last")) {
            channel = await this.client.getChannel(
                this.client.lastChannelsManager.getSub(id, "main")?.id || "0", { id: null },
            );

            if ((!channel || channel.id === null) && data.notifications === "last") {
                channel = await this.getUser(id, { id: null });
            }
        }
        if (data.notifications === "dm") {
            channel = await this.getUser(id, { id: null });

            if (!channel || channel.id === null) {
                channel = await this.client.getChannel(
                    this.client.lastChannelsManager.getSub(id, "main")?.id || "0", { id: null },
                );
            }
        }

        if (channel?.id !== null) await channel.send(payload).catch(this.catchError);
    }

    launch() {
        if (this.env.MERGE_SQLITE_TABLES !== "1") {
            return this.login(this.token);
        }
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
            let evaluated = await eval(code);
            if (typeof evaluated !== "string") evaluated = require("util").inspect(evaluated);

            const cleanEvaluated = clean(evaluated);
            if (cleanEvaluated === "undefined") {
                response += "```cs\n# Voided processus```";
            }
            else {
                response += `\`\`\`xl\n${cleanEvaluated.substring(0, 2000 - response.length - 20)}\`\`\``;
            }
        }
        catch (err) {
            const cleanErr = clean(err.message);
            response += `\`\`\`xl\n${cleanErr.substring(0, 2000 - response.length - 20)}\`\`\``;
        }

        return response;
    }

    async guildsSize() {
        try {
            return (await this.guilds.fetch()).size;
        }
        catch {
            return this.guilds.cache.size;
        }
    }

    async owner(secureValue) {
        const user = await this.getUser("539842701592494111", { id: null });
        if (user?.id === null) return secureValue;
        return user;
    }

    async fooSend(channel, content, author) {
        if (content instanceof String) content = [content];
        for (const message of content) {
            const embed = new EmbedBuilder();
            if (author) {
                embed.setAuthor({
                    name: author.tag,
                    iconURL: author.displayAvatarURL({ format: "png", size: 256, dynamic: true }),
                });
            }

            embed.setDescription(message);
            embed.setColor(this.enums.Colors.DarkGrey);

            await channel.send({
                embeds: [embed],
            }).catch(this.catchError);
        }
    }
}

module.exports = Obanai;