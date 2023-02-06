const Command = require("../../base/Command");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class Quests extends Command {
    constructor() {
        super(
            {
                name: "quests",
                description: "Permet à l’utilisateur de voir sa quête principale, sa quête quotidienne et sa possible quête secondaire.",
                descriptionLocalizations: {
                    "en-US": "Allows the user to see their main quest, daily quest and possible side quest.",
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
                completedRequests: ["quests"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read"],
            },
        );
    }

    async run() {
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            return await this.return(
                this.client.playerDb.get(user.id).alreadyPlayed ?
                    this.lang.systems.playerNotFoundAlreadyPlayed
                    : this.lang.systems.playerNotFound,
                true,
            );
        }
        await this.interaction.deferReply().catch(this.client.catchError);

        const quests = await this.client.questDb.load(user.id);
        const embedsArray = await this.client.questDb.getEmbeds(this.lang, quests, user);

        const embeds = {
            slayer: embedsArray[0],
            side: embedsArray[1],
            daily: embedsArray[2],
        };
        const attachments = {
            slayer: null,
            side: null,
            daily: null,
        };

        const options = [
            {
                label: this.lang.rpgAssets.concepts.slayerQuest,
                emoji: this.client.enums.Rpg.Concepts.SlayerQuest,
                value: "Slayer",
            },
            {
                label: this.lang.rpgAssets.concepts.sideQuest,
                emoji: this.client.enums.Rpg.Concepts.SideQuest,
                value: "Side",
            },
            {
                label: this.lang.rpgAssets.concepts.dailyQuest,
                emoji: this.client.enums.Rpg.Concepts.DailyQuest,
                value: "Daily",
            },
        ];
        let lastPanel = "Slayer";
        let loop = true;
        while (loop) {
            let interaction = await this.menu(
                {
                    embeds: [embeds[lastPanel.toLowerCase()]],
                    files: attachments[lastPanel.toLowerCase()] === null ?
                        []
                        : [attachments[lastPanel.toLowerCase()]],
                },
                options,
                null,
                null,
                false,
                true,
            );
            if (interaction === null || interaction === lastPanel || interaction === "cancel") {
                if (interaction === null || interaction === "cancel") loop = false;
                continue;
            }
            interaction = interaction[0];
            const embedAttachment = (await this.message())?.embeds[0]?.data?.image?.url;
            await (await this.message())?.removeAttachments().catch(this.client.catchError);
            if (
                typeof attachments[lastPanel.toLowerCase()] !== "string"
                && attachments[lastPanel.toLowerCase()] !== null
            ) {
                attachments[lastPanel.toLowerCase()] = null;
                embeds[lastPanel.toLowerCase()].setImage(embedAttachment);
            }

            await this.editContent({
                embeds: [embeds[interaction.toLowerCase()]],
                files: attachments[interaction.toLowerCase()] === null ?
                    []
                    : [attachments[interaction.toLowerCase()]],
            });
            lastPanel = interaction;
        }
        return this.end();
    }
}

module.exports = Quests;