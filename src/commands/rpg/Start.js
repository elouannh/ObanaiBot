const Command = require("../../base/Command");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require("discord.js");

class Profile extends Command {
    constructor() {
        super({
            name: "start",
            description: "Commande permettant de commencer votre aventure.",
            descriptionLocalizations: {
                "en-US": "Command to start your journey on the bot.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["start"],
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        if (await this.client.playerDb.exists(this.interaction.user.id)) {
            await this.interaction.reply({ content: this.lang.systems.playerAlreadyExists, ephemeral: true })
                .catch(this.client.catchError);
            return this.end();
        }

        const languagesOptions = this.langManager.languages.map(lang => Object.assign(
            {}, { label: lang.langName, value: lang.lang, emoji: lang.getFlag },
        ));

        const langChoice = await this.interaction.reply({
            content: this.mention + this.lang.commands.start.languageChoice
                + "\n\n"
                + this.langManager.multilang("commands", "start", "languageDemonstration"),
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("languageChoice")
                            .setPlaceholder(this.lang.commands.start.languageMenuPlaceholder)
                            .addOptions(languagesOptions),
                    ),

            ],
        }).catch(this.client.catchError);

        const langResponse = await langChoice.awaitMessageComponent({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 60_000,
        }).catch(this.client.catchError);

        if (!langResponse) {
             await this.interaction.editReply({
                content: this.mention + this.lang.systems.choiceIgnored, components: [],
            }).catch(this.client.catchError);
             return this.end();
        }
        await langResponse.deferUpdate().catch(this.client.catchError);
        const langChoosen = langResponse.values[0];

        const tosAcceptMessage = await this.interaction.editReply({
            content: this.mention + `${this.lang.commands.start.startIntroduction}\n\n`
                + `\`\`\`${this.lang.commands.start.storyIntroduction}\`\`\`\n`
                + `\n> ${this.lang.commands.start.tosAccept}\n`,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("tosAccept")
                            .setMinValues(1)
                            .setMaxValues(3)
                            .setPlaceholder(this.lang.commands.start.tosMenuPlaceholder)
                            .setOptions(
                                {
                                    label: this.lang.commands.start.discordTosAccept,
                                    description: this.lang.commands.start.discordTosDescription,
                                    value: "discordTos",
                                    default: true,
                                },
                                {
                                    label: this.lang.commands.start.botTosAccept,
                                    value: "botTosAccept",
                                },
                                {
                                    label: this.lang.commands.start.botCofAccept,
                                    value: "botCofAccept",
                                },
                            ),
                    ),
            ],
        }).catch(this.client.catchError);

        const tosResponse = await tosAcceptMessage.awaitMessageComponent({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 120_000,
        }).catch(this.client.catchError);

        if (!tosResponse) {
            await this.interaction.editReply({
                content: this.mention + this.lang.systems.choiceIgnored, components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        await tosResponse.deferUpdate().catch(this.client.catchError);

        if (tosResponse.values?.length < 3) {
            await this.interaction.editReply({
                content: this.mention + this.lang.commands.start.tosDeclined, components: [],
            }).catch(this.client.catchError);
            return this.end();
        }

        const firstCharacter = await this.client.RPGAssetsManager.getCharacter(this.lang._id, "0");
        const secondCharacter = await this.client.RPGAssetsManager.getCharacter(this.lang._id, "1");

        const characterChoice = await this.interaction.editReply({
            content: this.mention + this.lang.commands.start.tosAccepted + "\n\n" + this.lang.commands.start.characterChoice,
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId("characterChoice")
                            .setMinValues(1)
                            .setMaxValues(1)
                            .setPlaceholder(this.lang.commands.start.characterMenuPlaceholder)
                            .setOptions(
                                {
                                    label: `(${firstCharacter.gender}) ${firstCharacter.fullName}`,
                                    description: firstCharacter.label,
                                    value: "firstCharacter",
                                },
                                {
                                    label: `(${secondCharacter.gender}) ${secondCharacter.fullName}`,
                                    description: secondCharacter.label,
                                    value: "secondCharacter",
                                },
                            ),
                    ),
            ],
        }).catch(this.client.catchError);

        const choice = await characterChoice.awaitMessageComponent({
            filter: inter => inter.user.id === this.interaction.user.id,
            time: 60_000,
        }).catch(this.client.catchError);

        if (!choice) {
            await this.interaction.editReply({
                content: this.mention + this.lang.systems.choiceIgnored, components: [],
            }).catch(this.client.catchError);
            return this.end();
        }

        await choice.deferUpdate().catch(this.client.catchError);
        const chosen = eval(`${choice.values[0]}`);

        await this.interaction.editReply({
            content: this.mention + this.lang.commands.start.characterChosen.replace("%CHAR", chosen.fullName) + "\n\n" + this.lang.commands.start.joinTheSupport,
            components: [],
        }).catch(this.client.catchError);
        await this.client.playerDb.create(this.interaction.user.id, chosen.id, langChoosen);
    }
}

module.exports = Profile;