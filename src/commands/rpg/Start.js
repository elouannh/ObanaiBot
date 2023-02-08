const Command = require("../../base/Command");

class Start extends Command {
    constructor() {
        super(
            {
                name: "start",
                description: "Permet à l’utilisateur de commencer son aventure si il ne l’a pas encore fait.",
                descriptionLocalizations: {
                    "en-US": "Allows the user to start their adventure if they have not already done so.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Quests",
                dmPermission: true,
            },
            {
                trad: "quests",
                type: [1],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["adventure"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read", "write"],
            },
            {
        });
    }

    async run() {
        await this.interaction.deferReply().catch(this.client.catchError);
        if (await this.client.playerDb.exists(this.interaction.user.id)) {
            return await this.return(this.lang.systems.playerAlreadyExists, true);
        }

        const languagesOptions = this.langManager.languages.map(lang => Object.assign(
            {}, { label: lang.langName, value: lang.lang, emoji: lang.getFlag },
        ));

        const lang = await this.menu(
            {
                content: this.mention + this.trad.languageChoice
                    + "\n\n"
                    + this.langManager.multilang("commands", "start", "languageDemonstration"),
            },
            languagesOptions,
        );
        if (lang === null) return this.end();
        const langChosen = lang[0];

        const tos = await this.menu(
            {
                content: this.mention + `${this.trad.startIntroduction}\n\n`
                    + `\`\`\`${this.trad.storyIntroduction}\`\`\`\n`
                    + `\n> ${this.trad.tosAccept}\n\n**${this.trad.links}**`,
            },
            [
                {
                    label: this.trad.discordTosAccept,
                    description: this.trad.discordTosDescription,
                    value: "discordTos",
                    default: true,
                },
                {
                    label: this.trad.botTosAccept,
                    value: "botTosAccept",
                },
                {
                    label: this.trad.botCofAccept,
                    value: "botCofAccept",
                },
            ],
            3, 3,
        );
        if (tos === null) return this.end();

        if (tos?.length < 3) return await this.return(this.trad.tosDeclined);

        const firstCharacter = await this.client.RPGAssetsManager.getCharacter(this.lang._id, "0");
        const secondCharacter = await this.client.RPGAssetsManager.getCharacter(this.lang._id, "1");

        const choice = await this.menu(
            {
                content: this.mention
                    + this.trad.tosAccepted
                    + "\n\n"
                    + this.trad.characterChoice,
            },
            [
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
            ],
        );
        if (choice === null) return this.end();

        const chosen = eval(`${choice[0]}`);
        await this.client.playerDb.create(this.interaction.user.id, chosen.id, langChosen);

        return await this.return(
            this.mention
            + this.trad.characterChosen.replace("%CHAR", chosen.fullName)
            + "\n\n"
            + this.trad.joinTheSupport,
        );
    }
}

module.exports = Start;