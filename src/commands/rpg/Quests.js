const Command = require("../../base/Command");

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
                cancelDefer: false,
            },
            {
                needToBeStatic: false,
                needToBeInRpg: true,
            },
        );
    }

    async run() {
        const exists = await this.hasAdventure();
        if (!exists) return;

        const quests = await this.client.questDb.load(this.user.id);
        const embedsArray = await this.client.questDb.getEmbeds(this.lang, quests, this.user);

        await this.client.additionalDb.showTutorial(
            this.user.id, "quests", "howItWorks", this.interaction,
        );

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
            let questInteraction = await this.menu(
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
            if (questInteraction === null || questInteraction === lastPanel || questInteraction === "cancel") {
                if (questInteraction === null || questInteraction === "cancel") loop = false;
                continue;
            }
            questInteraction = questInteraction[0];
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
                embeds: [embeds[questInteraction.toLowerCase()]],
                files: attachments[questInteraction.toLowerCase()] === null ?
                    []
                    : [attachments[questInteraction.toLowerCase()]],
            });
            lastPanel = questInteraction;
        }
        return this.end();
    }
}

module.exports = Quests;