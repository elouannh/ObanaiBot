const Command = require("../../base/Command");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class Quests extends Command {
    constructor() {
        super({
            name: "quests",
            description: "Commande permettant d'afficher les quêtes d'un joueur.",
            descriptionLocalizations: {
                "en-US": "Command to display player quests.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 15,
            completedRequests: ["quests"],
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            if (this.client.playerDb.get(user.id).alreadyPlayed) {
                await this.interaction.reply({
                    content: this.lang.systems.playerNotFoundAlreadyPlayed,
                    ephemeral: true,
                }).catch(this.client.catchError);
                return this.end();
            }
            await this.interaction.reply({ content: this.lang.systems.playerNotFound, ephemeral: true })
                .catch(this.client.catchError);
            return this.end();
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

        const buttons = [
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setEmoji(this.client.enums.Rpg.Concepts.SlayerQuest)
                .setLabel(this.lang.rpgAssets.concepts.slayerQuest)
                .setCustomId("Slayer"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Concepts.SideQuest)
                .setCustomId("Side"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Concepts.DailyQuest)
                .setCustomId("Daily"),
        ];

        let lastPanel = "Slayer";

        const questsPanel = await this.interaction.editReply(
            {
                embeds: [embeds.slayer],
                components: [new ActionRowBuilder().setComponents(buttons)],
                files: attachments.slayer === null ? [] : [attachments.slayer],
            },
        ).catch(this.client.catchError);
        const collector = questsPanel.createMessageComponentCollector({
            filter: interaction => interaction.user.id === this.interaction.user.id,
            idle: 60_000,
        });
        collector.on("collect", async interaction => {
            const embedAttachment = questsPanel.embeds[0]?.data?.image?.url;
            await questsPanel.removeAttachments().catch(this.client.catchError);
            // register the attachment URL in the attachments object
            if (typeof attachments[lastPanel.toLowerCase()] !== "string" && attachments[lastPanel.toLowerCase()] !== null) {
                attachments[lastPanel.toLowerCase()] = null;
                embeds[lastPanel.toLowerCase()].setImage(embedAttachment);
            }

            // update the buttons (blurple animation)
            buttons[buttons.map(e => e.data.custom_id).indexOf(lastPanel)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Concepts[`${lastPanel}Quest`])
                .setCustomId(lastPanel);
            buttons[buttons.map(e => e.data.custom_id).indexOf(interaction.customId)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(this.lang.rpgAssets.concepts[`${interaction.customId.toLowerCase()}Quest`])
                .setEmoji(this.client.enums.Rpg.Concepts[`${interaction.customId}Quest`])
                .setCustomId(interaction.customId);

            await interaction.deferUpdate().catch(this.client.catchError);

            // update the panel
            await this.interaction.editReply({
                embeds: [embeds[interaction.customId.toLowerCase()]],
                components: [new ActionRowBuilder().setComponents(buttons)],
                files: attachments[interaction.customId.toLowerCase()] === null ? [] : [attachments[interaction.customId.toLowerCase()]],
            }).catch(this.client.catchError);

            lastPanel = interaction.customId;
        });
        collector.on("end", async () => {
            await this.interaction.editReply({ components: [] }).catch(this.client.catchError);
            return this.end();
        });
    }
}

module.exports = Quests;