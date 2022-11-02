const SQLiteTable = require("../../SQLiteTable");
const PlayerData = require("../dataclasses/PlayerData");
const Canvas = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");

function schema(id) {
    return {
        alreadyPlayed: false,
        id: id,
        lang: "fr",
        characterId: null,
        statistics: {
            defense: 1,
            strength: 1,
        },
        hp: 100,
        lastHeal: Date.now(),
        breathingStyle: null,
        exp: 0,
        creationDate: Date.now(),
    };
}

class PlayerDb extends SQLiteTable {
    constructor(client) {
        super(client, "player", schema);
    }

    async load(id) {
        return new PlayerData(this.client, this.get(id), this.client.inventoryDb.get(id));
    }

    get(id) {
        const data = super.get(id, schema);

        if (data.hp < 100) {
            const lastHeal = Math.floor((Date.now() - data.lastHeal));
            const amountToHeal = Math.floor(lastHeal / 1000 / 60 / 5);
            if (amountToHeal > 0) this.heal(id, amountToHeal);
        }

        return data;
    }

    /**
     * Heal a player directly in the database
     * @param {String} id The player ID
     * @param {Number} amount The amount of HP to heal
     * @returns {void}
     */
    heal(id, amount) {
        let newAmount = this.get(id).hp + amount;
        if (newAmount > 100) newAmount = 100;
        this.set(id, newAmount, "hp");
        this.set(id, Date.now(), "lastHeal");
    }

    /**
     * Create a new player in all the databases.
     * @param {String} id The player ID
     * @param {String} characterId The pnj ID of the user for the RPG game
     * @returns {Promise<void>}
     */
    async create(id, characterId = "0") {
        await this.client.activityDb.ensureInDeep(id);
        await this.client.additionalDb.ensureInDeep(id);
        await this.client.inventoryDb.ensureInDeep(id);
        await this.client.mapDb.ensureInDeep(id);
        await this.client.questDb.ensureInDeep(id);
        await this.client.squadDb.ensureInDeep(id);
        await this.set(id, characterId, "characterId");
    }

    /**
     * Returns if a player exists in the database.
     * @param {String} id The player ID
     * @returns {Promise<boolean>}
     */
    async exists(id) {
        for (const db of [
            this,
            this.client.activityDb,
            this.client.additionalDb,
            this.client.inventoryDb,
            this.client.mapDb,
            this.client.questDb,
            this.client.squadDb,
        ]) {
            if ((await db.get(id))?.schemaInstance) return false;
        }
        return true;
    }

    /**
     * Get the language of the player.
     * @param {String} id The player ID
     * @returns {String}
     */
    getLang(id) {
        return this.get(id).lang;
    }

    /**
     * @typedef {Object} ThemeAttachment
     * @property {String} name The theme name
     * @property {Buffer} buffer The canvas Buffer
     * @property {AttachmentBuilder} attachment The theme attachment
     */
    /**
     * Get the player image attachment.
     * @param {PlayerData} playerData The player data
     * @returns {Promise<ThemeAttachment>}
     */
    async getImage(playerData) {
        const profileThemeData = this.client.additionalDb.getTheme(playerData.id, "profile");
        const theme = this.client.enums.Themes[profileThemeData];

        Canvas.GlobalFonts.registerFromPath("./assets/fonts/BreeSerif-Regular.ttf", "Bree");

        const canvas = Canvas.createCanvas(800, 450);
        const context = canvas.getContext("2d");

        context.filter = "blur(10px)";
        const background = await Canvas.loadImage(theme.BackgroundImage);
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.filter = "none";
        const avatar = (await this.client.getUser(playerData.id, {}))?.avatarURL()
            ?? theme[`Default${this.client.util.capitalize(playerData.character.gender)}`];
        const userAvatar = await Canvas.loadImage(await this.client.util.getRoundImage(avatar));
        context.drawImage(userAvatar, 12, 16, 119, 119);

        const cleanKnyLogo = await Canvas.loadImage(theme.Border);
        context.drawImage(cleanKnyLogo, 0, 0, 150, 150);


        const progressBar = await Canvas.loadImage(
            await this.client.util.getProgressBar(
                (playerData.hp - 50) / 100, 500, 50, theme.Accent, theme.BackgroundColor, theme.BackgroundColor,
            ),
        );
        context.drawImage(progressBar, 250, 50, 500, 50);

        const buffer = await canvas.encode("png");
        return {
            name: profileThemeData,
            buffer,
            attachment: new AttachmentBuilder(buffer, { name: "profile-player.png" }),
        };
    }
}

module.exports = PlayerDb;