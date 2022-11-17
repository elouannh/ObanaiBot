const SQLiteTable = require("../../SQLiteTable");
const AdditionalData = require("../dataclasses/AdditionalData");
const { Message, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        demonBlood: 0,
        rpg: {
            commandsAmount: {},
            tutorialProgress: {},
        },
        themes: {
            unlocked: [],
            equipped: {
                profile: "Default",
            },
        },
    };
}

class AdditionalDb extends SQLiteTable {
    constructor(client) {
        super(client, "additional", schema);
    }

    async load(id) {
        return new AdditionalData(this.client, this.get(id));
    }

    /**
     * Increments the count of utilisations of a command.
     * @param {String} id
     * @param {String} commandName
     * @returns {void}
     */
    incrementCommand(id, commandName) {
        this.ensureInDeep(id);
        const data = this.get(id);
        if (commandName in data.rpg.commandsAmount) this.set(id, data.rpg.commandsAmount[commandName] + 1, `rpg.commandsAmount.${commandName}`);
        else this.set(id, 1, `rpg.commandsAmount.${commandName}`);
    }

    /**
     * @typedef {Object} Tutorial
     * @property {String} name The tutorial name
     * @property {TutorialStep} step The tutorial steps
     */
    /**
     * @typedef {Object} TutorialStep
     * @property {String} name The tutorial step name
     * @property {String[]} array The tutorial step array
     */
    /**
     * Get the chosen tutorial text using the user ID language, and returns it.
     * @param {String} id The user ID
     * @param {String} tutorialId The tutorial ID
     * @param {String} tutorialStep The tutorial step
     * @returns {Tutorial|null}
     */
    getTutorial(id, tutorialId, tutorialStep) {
        const lang = this.client.playerDb.getLang(id);
        if (tutorialId in this.client.languageManager.getLang(lang).json.tutorials) {
            const tutorial = this.client.languageManager.getLang(lang).json.tutorials[tutorialId];
            if (tutorialStep in tutorial) {
                return {
                    name: tutorial.name,
                    step: {
                        name: tutorial[tutorialStep].name,
                        array: tutorial[tutorialStep].array,
                    },
                };
            }
        }
        return null;
    }

    /**
     * Get the chosen tutorial text using the user ID language, and returns it. It takes into account the tutorial progress,
     * and if this step is already done or not. It also increments the tutorial progress.
     * @param {String} id The user ID
     * @param {String} tutorialId The tutorial ID
     * @param {String} tutorialStep The tutorial step
     * @returns {Tutorial|null}
     */
    getUserTutorial(id, tutorialId, tutorialStep) {
        const data = this.get(id);
        if (tutorialId in data.rpg.tutorialProgress) {
            const tutorialData = data.rpg.tutorialProgress[tutorialId];
            if (tutorialStep in tutorialData) {
                if (tutorialData[tutorialStep] === true) return null;
            }
        }
        this.set(id, true, `rpg.tutorialProgress.${tutorialId}.${tutorialStep}`);
        return this.getTutorial(id, tutorialId, tutorialStep);
    }

    /**
     * Show the chosen tutorial.
     * @param {String} id The user ID
     * @param {Tutorial|null} tutorial The tutorial array
     * @param {ChatInputCommandInteraction} interaction The command interaction
     * @returns {Promise<void>}
     */
    async showTutorial(id, tutorial, interaction) {
        if (tutorial === null || tutorial.step.array.length === 0) return null;
        const userLang = this.client.languageManager.getLang(this.client.playerDb.getLang(id));

        const components = [
            new ActionRowBuilder()
                .setComponents(
                    new ButtonBuilder()
                        .setCustomId("tutorial_next")
                        .setLabel(userLang.json.systems.tutorialNext)
                        .setStyle(ButtonStyle.Secondary),
                ),
        ];

        let i = 0;
        const message = await interaction.channel.send({
            content: `> <@${id}>, **${tutorial.name} - ${tutorial.step.name}**\n\n\`${i + 1}/${tutorial.step.array.length}\`| ${tutorial.step.array[i]}`,
            components,
        }).catch(this.client.util.catchError);
        const collector = message.createMessageComponentCollector({
            filter: inter => inter.user.id === id,
            idle: 60_000,
        });
        collector.on("collect", async inter => {
            if (inter.customId === "tutorial_next") {
                i++;
                if (i >= tutorial.step.array.length) {
                    await inter.reply({
                        content: `> <@${id}>, **${tutorial.name} - ${tutorial.step.name}**\n\n*${userLang.json.systems.tutorialEnd}*`,
                        ephemeral: true,
                    }).catch(this.client.util.catchError);
                    collector.stop();
                }
                else {
                    await inter.deferUpdate().catch(this.client.util.catchError);
                    await message.edit({
                        content: `> <@${id}>, **${tutorial.name} - ${tutorial.step.name}**\n\n\`${i + 1}/${tutorial.step.array.length}\`| ${tutorial.step.array[i]}`,
                        components,
                    }).catch(this.client.util.catchError);
                }
            }
        });
        collector.on("end", async () => {
            await message.delete().catch(this.client.util.catchError);
        });
    }

    /**
     * Show a step of the beginning tutorial.
     * @param {String} id The user ID
     * @param {String} tutorialStepName The tutorial step name
     * @param {ChatInputCommandInteraction} interaction The command interaction
     * @returns {Promise<void>}
     */
    async showBeginningTutorial(id, tutorialStepName, interaction) {
        await this.showTutorial(id, this.getUserTutorial(id, "beginning", tutorialStepName), interaction);
    }

    /**
     * Get the theme of the user.
     * @param {String} id The user ID
     * @param {String} location The theme ID
     * @returns {String}
     */
    getTheme(id, location) {
        const data = this.get(id);
        return data.themes.equipped[location];
    }

    /**
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {AdditionalData} data The inventory data
     * @param {User} user The user
     * @returns {Promise<EmbedBuilder>}
     */
    async getEmbed(lang, data, user) {
        return new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                + lang.rpgAssets.embeds.additionalTitle.replace("%PLAYER", `\`${user.tag}\``),
            )
            .setColor(this.client.enums.Colors.Blurple);
    }
}

module.exports = AdditionalDb;