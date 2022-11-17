const SQLiteTable = require("../../SQLiteTable");
const PlayerData = require("../dataclasses/PlayerData");
const Canvas = require("canvas");
const { AttachmentBuilder, EmbedBuilder, User } = require("discord.js");
const StackBlur = require("stackblur-canvas");

function schema(id) {
    return {
        alreadyPlayed: false,
        id: id,
        lang: "fr",
        characterId: null,
        statistics: {
            defense: 1,
            strength: 1,
            weaponControl: 1,
            smartness: 1,
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
            const amountToHeal = Math.floor(lastHeal / 1000 / 60 / 5 + data.hp);
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
        if (amount > 100) amount = 100;
        this.set(id, Math.ceil(amount), "hp");
        this.set(id, Date.now(), "lastHeal");
    }

    /**
     * Create a new player in all the databases.
     * @param {String} id The player ID
     * @param {String} characterId The pnj ID of the user for the RPG game
     * @returns {Promise<void>}
     */
    async create(id, characterId = "0", lang = "fr") {
        this.ensureInDeep(id);
        this.client.activityDb.ensureInDeep(id);
        this.client.additionalDb.ensureInDeep(id);
        this.client.inventoryDb.ensureInDeep(id);
        this.client.mapDb.ensureInDeep(id);
        this.client.questDb.ensureInDeep(id);
        this.set(id, characterId, "characterId");
        this.set(id, lang, "lang");
    }

    /**
     * Delete the player from all the databases.
     * @param {String} id The player ID
     */
    async delete(id) {
        await this.client.activityDb.delete(id);
        await this.client.additionalDb.delete(id);
        await this.client.inventoryDb.delete(id);
        await this.client.mapDb.delete(id);
        await this.client.questDb.delete(id);
        await this.delete(id);
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
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {PlayerData} data The player data
     * @param {User} user The user
     * @param {String} playerImageName The theme attachment
     * @returns {Promise<EmbedBuilder>}
     */
    async getEmbed(lang, data, user, playerImageName) {
        return new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                + lang.rpgAssets.embeds.playerTitle.replace("%PLAYER", `\`${user.tag}\``),
            )
            .setDescription(`\`Thème: \`**\`${playerImageName}\`**`)
            .addFields(
                {
                    name: lang.rpgAssets.embeds.breathingStyle,
                    value: data.breathingStyle === null ? lang.rpgAssets.embeds.anyStyle
                        : `${data.breathingStyle.name}, ${data.breathingStyle.techniques.length} ${lang.rpgAssets.embeds.techniques}`,
                },
                {
                    name: lang.rpgAssets.embeds.lifeRegeneration,
                    value: (data.health.lastRegen === data.health.fullRegen ?
                            lang.rpgAssets.embeds.finishedAt : lang.rpgAssets.embeds.remaining)
                        + `<t:${data.health.fullRegenString}:R>`,
                },
            )
            .setImage("attachment://profile-player.png")
            .setColor(this.client.enums.Colors.Blurple);
    }

    /**
     * Get the player image attachment.
     * @param {PlayerData} playerData The player data
     * @returns {Promise<ThemeAttachment>}
     */
    async getImage(playerData) {
        const lang = this.client.RPGAssetsManager.getLangData(this.getLang(playerData.id)).json;
        const profileThemeData = this.client.additionalDb.getTheme(playerData.id, "profile");
        const theme = this.client.enums.Themes[profileThemeData];

        Canvas.registerFont(theme.SoftFont, { family: "Soft" });
        Canvas.registerFont(theme.MainFont, { family: "Main" });
        Canvas.registerFont(theme.DisplayFont, { family: "Display" });

        const canvas = Canvas.createCanvas(800, 450);
        const context = canvas.getContext("2d");

        const background = await Canvas.loadImage(theme.BackgroundImage);
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        StackBlur.canvasRGBA(canvas, 0, 0, canvas.width, canvas.height, theme.BackgroundBlur);
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(canvas.width, 0);
        context.lineTo(canvas.width, canvas.height);
        context.lineTo(0, canvas.height);
        context.closePath();
        context.lineWidth = 10;
        context.strokeStyle = theme.SafeColor;
        context.stroke();
        context.restore();

        const avatar = (await this.client.getUser(playerData.id, {}))?.avatarURL({ format: "png" })
            ?? theme[`Default${this.client.util.capitalize(playerData.character.gender)}`];

        const userAvatar = await Canvas.loadImage(await this.client.util.getRoundImage(avatar));
        context.drawImage(userAvatar, 37, 46, 129, 129);

        const border = await Canvas.loadImage(theme.AvatarBorder);
        context.drawImage(border, 25, 30, 160, 160);

        const progressBar = await Canvas.loadImage(
            await this.client.util.getProgressBar(
                playerData.health.amount / 100, 500, 50, theme.HPColor, theme.NotFilledColor, theme.BorderColor,
            ),
        );
        context.drawImage(progressBar, 250, 50, 500, 50);
        const heartImage = await Canvas.loadImage(theme.HeartImage);
        const heartSize = 75;
        context.drawImage(heartImage, 210, 50 - ((heartSize - 50) / 2), heartSize, heartSize);
        const hpText1 = `${playerData.health.amount}/100 `;
        const hpText2 = `${lang.concepts.hp}`;
        context.textBaseline = "middle";
        context.fillStyle = theme.Color;
        context.font = "25px Main";
        context.fillText(hpText1, 270, 115);
        const hpText1Length = context.measureText(hpText1).width;
        context.font = "27px Display";
        context.fillText(hpText2, 270 + hpText1Length, 114);

        const expPercent = playerData.level.reached / playerData.level.required;
        const xpProgressBar = await Canvas.loadImage(
            await this.client.util.getProgressBar(
                expPercent, 500, 50, theme.XPColor, theme.NotFilledColor, theme.BorderColor,
            ),
        );
        context.drawImage(xpProgressBar, 250, 150, 500, 50);
        const maskImage = await Canvas.loadImage(theme.MaskImage);
        const maskSize = 75;
        context.drawImage(maskImage, 210, 150 - ((maskSize - 50) / 2), maskSize, maskSize);
        const xpText1 = `${lang.concepts.level} `;
        const xpText2 = `${playerData.level.level}`;
        const xpText3 = `${playerData.level.reached}/${playerData.level.required}`;
        context.fillStyle = theme.Color;
        context.font = "25px Display";
        context.fillText(xpText1, 270, 215);
        const xpText11Length = context.measureText(xpText1).width;
        context.font = "30px Main";
        context.fillText(xpText2, 270 + xpText11Length, 215);
        context.font = "25px Main";
        context.textAlign = "right";
        context.fillText(xpText3, 750, 215);

        const statsImage = await Canvas.loadImage(theme.StatsImage);
        const statsSize = 30;
        context.drawImage(statsImage, 200, 260, statsSize, statsSize);
        const statsText1 = `${lang.concepts.stats}`;
        this.client.util.text3D(context, statsText1, theme.Accent, theme.Color, "Display", 35, 240, 275);

        const separator = await Canvas.loadImage(
            await this.client.util.verticalBar(
                10, 120, theme.Accent, theme.BorderColor, 2,
            ),
        );
        context.drawImage(separator, 200, 310, 10, 120);

        const statText1_0 = `${lang.statistics.names.strength}: `;
        const statText1_1 = `${playerData.statistics.strength.amount} `;
        const statText1_2 = `- ${lang.concepts.level} `;
        const statText1_3 = `${playerData.statistics.strength.level}`;
        const statText2_0 = `${lang.statistics.names.defense}: `;
        const statText2_1 = `${playerData.statistics.defense.amount} `;
        const statText2_2 = `- ${lang.concepts.level} `;
        const statText2_3 = `${playerData.statistics.defense.level}`;
        const statText3_0 = `${lang.statistics.names.weaponControl}: `;
        const statText3_1 = `${playerData.statistics.weaponControl.amount} `;
        const statText3_2 = `- ${lang.concepts.level} `;
        const statText3_3 = `${playerData.statistics.weaponControl.level}`;
        const statText4_0 = `${lang.statistics.names.smartness}: `;
        const statText4_1 = `${playerData.statistics.smartness.amount} `;
        const statText4_2 = `- ${lang.concepts.level} `;
        const statText4_3 = `${playerData.statistics.smartness.level}`;
        context.fillStyle = theme.Color;
        context.textBaseline = "bottom";
        context.font = "22px Display";
        const placement = 29;
        context.fillText(statText1_0, 230, 308 + placement);
        context.fillText(statText2_0, 230, 308 + placement * 2);
        context.fillText(statText3_0, 230, 308 + placement * 3);
        context.fillText(statText4_0, 230, 308 + placement * 4);
        const s1_0Length = context.measureText(statText1_0).width;
        const s2_0Length = context.measureText(statText2_0).width;
        const s3_0Length = context.measureText(statText3_0).width;
        const s4_0Length = context.measureText(statText4_0).width;
        this.client.util.text3D(context, statText1_1, theme.Accent, theme.Color, "Main", 28, 235 + s1_0Length, 308 + placement);
        this.client.util.text3D(context, statText2_1, theme.Accent, theme.Color, "Main", 28, 235 + s2_0Length, 308 + placement * 2);
        this.client.util.text3D(context, statText3_1, theme.Accent, theme.Color, "Main", 28, 235 + s3_0Length, 308 + placement * 3);
        this.client.util.text3D(context, statText4_1, theme.Accent, theme.Color, "Main", 28, 235 + s4_0Length, 308 + placement * 4);
        const s1_1Length = context.measureText(statText1_1).width;
        const s2_1Length = context.measureText(statText2_1).width;
        const s3_1Length = context.measureText(statText3_1).width;
        const s4_1Length = context.measureText(statText4_1).width;
        context.fillStyle = theme.Color;
        context.font = "15px Soft";
        context.fillText(statText1_2, 240 + s1_0Length + s1_1Length, 308 + placement);
        context.fillText(statText2_2, 240 + s2_0Length + s2_1Length, 308 + placement * 2);
        context.fillText(statText3_2, 240 + s3_0Length + s3_1Length, 308 + placement * 3);
        context.fillText(statText4_2, 240 + s4_0Length + s4_1Length, 308 + placement * 4);
        const s1_2Length = context.measureText(statText1_2).width;
        const s2_2Length = context.measureText(statText2_2).width;
        const s3_2Length = context.measureText(statText3_2).width;
        const s4_2Length = context.measureText(statText4_2).width;
        context.fillText(statText1_3, 240 + s1_0Length + s1_1Length + s1_2Length, 308 + placement);
        context.fillText(statText2_3, 240 + s2_0Length + s2_1Length + s2_2Length, 308 + placement * 2);
        context.fillText(statText3_3, 240 + s3_0Length + s3_1Length + s3_2Length, 308 + placement * 3);
        context.fillText(statText4_3, 240 + s4_0Length + s4_1Length + s4_2Length, 308 + placement * 4);

        const maxValue = Math.max(
            playerData.statistics.strength.amount,
            playerData.statistics.defense.amount,
            playerData.statistics.weaponControl.amount,
            playerData.statistics.smartness.amount,
        );
        const minValue = Math.min(
            playerData.statistics.strength.amount,
            playerData.statistics.defense.amount,
            playerData.statistics.weaponControl.amount,
            playerData.statistics.smartness.amount,
        );

        const percent = 1 / (playerData.statistics.strength.amount + playerData.statistics.defense.amount + playerData.statistics.weaponControl.amount + playerData.statistics.smartness.amount);
        const graph = await Canvas.loadImage(
            await this.client.util.polarGraph(
                [
                    playerData.statistics.strength.amount * percent,
                    playerData.statistics.defense.amount * percent,
                    playerData.statistics.weaponControl.amount * percent,
                    playerData.statistics.smartness.amount * percent,
                ],
                [
                    playerData.statistics.strength.amount,
                    playerData.statistics.defense.amount,
                    playerData.statistics.weaponControl.amount,
                    playerData.statistics.smartness.amount,
                ],
                theme.PolarGraphFill,
                150,
                theme.BorderColor,
                Math.min(Math.max(3, ((maxValue - minValue) / 15)), 5),
                theme.PolarGraphForm,
                theme.PolarGraphLabelShadow,
            ),
        );
        context.drawImage(graph, 570, 270, 150, 150);
        context.fillStyle = theme.Color;
        context.font = "15px Soft";
        context.textBaseline = "middle";
        context.textAlign = "left";
        context.fillText(lang.statistics.abbreviations.strength, 725, 340);
        context.textAlign = "right";
        context.fillText(lang.statistics.abbreviations.weaponControl, 565, 340);
        context.textAlign = "center";
        context.fillText(lang.statistics.abbreviations.smartness, 645, 430);
        context.fillText(lang.statistics.abbreviations.defense, 645, 260);

        const mascot = await Canvas.loadImage(theme.MascotImage);
        context.drawImage(mascot, 0, 230, 190, 220);

        const buffer = canvas.toBuffer();
        return {
            name: profileThemeData,
            buffer,
            attachment: new AttachmentBuilder(buffer, { name: "profile-player.png" }),
        };
    }
}

module.exports = PlayerDb;