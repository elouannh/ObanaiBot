const SQLiteTable = require("../../SQLiteTable");
const AdditionalData = require("../dataclasses/AdditionalData");
const AdditionalListener = require("../listeners/AdditionalListener");
// eslint-disable-next-line no-unused-vars
const { ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

function schema(id) {
    return {
        id: id,
        demonBlood: 0,
        rpg: {
            commandsAmount: {},
            tutorialProgress: {},
        },
        themes: {
            unlocked: ["Default"],
            equipped: {
                profile: "Default",
            },
        },
        notifications: "dm",
    };
}

class AdditionalDb extends SQLiteTable {
    constructor(client) {
        super(client, "additional", schema, AdditionalListener);
    }

    async load(id) {
        return new AdditionalData(
            this.client, this.get(id), this.client.languageManager.getLang(this.client.playerDb.getLang(id)).json,
        );
    }

    /**
     * Set notification settings of the user
     * @param {String} id The user ID
     * @param {String} value The value to set
     */
    setNotification(id, value) {
        this.set(id, value, "notifications");
    }

    /**
     * Unlock a theme for the user
     * @param {String} id The user ID
     * @param {String} theme The theme ID
     * @returns {void}
     */
    unlockTheme(id, theme) {
        const themes = this.get(id).themes.unlocked;
        if (!themes.includes(theme)) themes.push(theme);
        this.set(id, themes, "themes.unlocked");
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
                        .setCustomId("tutorial_skip")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji(this.client.enums.Systems.Symbols.GreenCross),
                ),
        ];
        if (tutorial.step.array.length > 1) {
            components[0].setComponents(
                new ButtonBuilder()
                    .setCustomId("tutorial_next")
                    .setLabel(userLang.json.systems.tutorialNext)
                    .setStyle(ButtonStyle.Secondary),
                components[0].components[0],
            );
        }

        let i = 0;
        const message = await interaction.channel.send({
            content: `> <@${id}>, **${tutorial.name} - ${tutorial.step.name}**`
                + `\n\n\`${i + 1}/${tutorial.step.array.length}\`| ${tutorial.step.array[i]}`,
            components,
        }).catch(this.client.catchError);
        const collector = message.createMessageComponentCollector({
            filter: inter => inter.user.id === id,
            idle: 60_000,
        });
        collector.on("collect", async inter => {
            if (inter.customId === "tutorial_next") {
                i++;
                if (i >= tutorial.step.array.length) {
                    collector.stop();
                }
                else {
                    await inter.deferUpdate().catch(this.client.catchError);
                    await message.edit({
                        content: `> <@${id}>, **${tutorial.name} - ${tutorial.step.name}**\n\n`
                            + `\`${i + 1}/${tutorial.step.array.length}\`| ${tutorial.step.array[i]}`,
                        components,
                    }).catch(this.client.catchError);
                }
            }
            else if (inter.customId === "tutorial_skip") {
                collector.stop();
            }
        });
        collector.on("end", async () => {
            await message.delete().catch(this.client.catchError);
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
     * Get the theme name of the given user
     * @param {Object} lang The language object
     * @param {String} theme The theme ID
     * @returns {String}
     */
    getThemeName(lang, theme) {
        return lang.rpgAssets.themes[theme];
    }

    /**
     * @typedef {Object} TutorialProgress
     * @property {Number} completed The number of completed tutorials
     * @property {Number} notCompleted The total number of not completed tutorials
     * @property {Number} completedPercent The percent of tutorials completed
     */
    /**
     * Get the tutorial progress of the given user
     * @param {Object} lang The language object
     * @param {String} id The user ID
     * @returns {TutorialProgress}
     */
    getTutorialProgress(lang, id) {
        const totalTutorials = { completed: 0, notCompleted: 0, completedPercent: 0 };
        for (const key in lang.tutorials) {
            const tutos = lang.tutorials[key];
            for (const tutoKey in tutos) {
                if (tutoKey === "name") continue;
                const tutoFocused = tutos[tutoKey];
                if (this.get(id)?.["rpg"]?.["tutorialProgress"]?.[key]?.[tutoKey] === true) {
                    totalTutorials.completed += tutoFocused.array.length;
                }
                else {
                    totalTutorials.notCompleted += tutoFocused.array.length;
                }
            }
        }
        totalTutorials.completedPercent = Math.ceil(
            (totalTutorials.completed / (totalTutorials.completed + totalTutorials.notCompleted)) * 100,
        );

        return totalTutorials;
    }

    /**
     * Get the embed of the player profile.
     * @param {Object} lang The language object
     * @param {AdditionalData} data The inventory data
     * @param {User} user The user
     * @returns {Promise<EmbedBuilder>}
     */
    async getEmbed(lang, data, user) {
        const themesAmount = Object.keys(data.themes.equipped).length;
        const unlockedThemesAmount = data.themes.unlocked.length;

        const embed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                + lang.rpgAssets.embeds.additionalTitle.replace("%PLAYER", `\`${user.tag}\``),
            )
            .setDescription(
                `__${lang.rpgAssets.concepts.demonBlood}:__ `
                + `\`${this.client.util.intRender(data.demonBlood, " ")}\``
                + `${this.client.enums.Rpg.Concepts.DemonBlood}`,
            )
            .setColor(this.client.enums.Colors.Blurple)
            .addFields(
                {
                    name: lang.rpgAssets.concepts.themes,
                    value: `__${lang.rpgAssets.embeds.unlockedThemes}:__`
                        + ` (\`${unlockedThemesAmount}\`) ${data.themes.unlocked.map(
                        t => `\`${this.getThemeName(lang, t)}\``,
                    ).join(", ")}`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.embeds.lockedThemes,
                    value: `\`${themesAmount - unlockedThemesAmount}\` `
                        + `(${Math.floor(unlockedThemesAmount / themesAmount * 100)}% `
                        + `${lang.rpgAssets.embeds.percentUnlocked})`,
                    inline: true,
                },
                { name: "\u200b", value: "\u200b", inline: false },
                {
                    name: lang.rpgAssets.embeds.executedCommands,
                    value: `${Object.values(data.rpg.commandsAmount).reduce((a, b) => a + b, 0)}`,
                    inline: true,
                },
                {
                    name: lang.rpgAssets.concepts.tutorialProgress,
                    value: `\`${data.rpg.tutorialProgressStats.completedPercent}\`% `
                        + `(**${data.rpg.tutorialProgressStats.completed}**/`
                        + `${data.rpg.tutorialProgressStats.completed + data.rpg.tutorialProgressStats.notCompleted})`,
                    inline: true,
                },
            );

        return embed;
    }
}

module.exports = AdditionalDb;