const Command = require("../../base/Command");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class Profile extends Command {
    constructor() {
        super({
            name: "profile",
            description: "Commande permettant d'afficher les informations d'un joueur.",
            descriptionLocalizations: {
                "en-US": "Command to display player informations.",
            },
            options: [
                {
                    type: 6,
                    name: "user",
                    description: "Joueur dont vous souhaitez afficher les informations.",
                    descriptionLocalizations: {
                        "en-US": "Player whose informations you want to display.",
                    },
                    required: false,
                },
            ],
            type: [1, 2],
            dmPermission: true,
            category: "RPG",
            cooldown: 15,
            completedRequests: ["profile"],
            authorizationBitField: 0b000,
            permissions: 0n,
        });
    }

    async run() {
        const user = await this.getUserFromInteraction(this.interaction.type);
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

        const player = await this.client.playerDb.load(user.id);
        const inventory = await this.client.inventoryDb.load(user.id);
        const activity = await this.client.activityDb.load(user.id);
        const map = await this.client.mapDb.load(user.id);
        const additional = await this.client.additionalDb.load(user.id);

        const playerImage = await this.client.playerDb.getImage(player);

        const embeds = {
            player: await this.client.playerDb.getEmbed(
                this.lang, player, user, this.client.additionalDb.getThemeName(this.lang, playerImage.name),
            ),
            inventory: await this.client.inventoryDb.getEmbed(this.lang, inventory, user),
            activity: await this.client.activityDb.getEmbed(this.lang, activity, user),
            map: await this.client.mapDb.getEmbed(this.lang, map, user),
            additional: await this.client.additionalDb.getEmbed(this.lang, additional, user),
        };
        const attachments = {
            player: playerImage.attachment,
            inventory: null,
            activity: null,
            map: null,
            additional: null,
        };

        const buttons = [
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setEmoji(this.client.enums.Rpg.Databases.Player)
                .setLabel(this.lang.commands.profile.playerButton)
                .setCustomId("Player"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases.Inventory)
                .setCustomId("Inventory"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases.Activity)
                .setCustomId("Activity"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases.Map)
                .setCustomId("Map"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases.Additional)
                .setCustomId("Additional"),
        ];

        let lastPanel = "Player";

        if (this.interaction.user.id === user.id) {
            await this.client.additionalDb.showBeginningTutorial(user.id, "profileCommand", this.interaction);
        }

        const profilePanel = await this.interaction.editReply({
            embeds: [embeds.player],
            components: [new ActionRowBuilder().setComponents(buttons)],
            files: attachments.player === null ? [] : [attachments.player],
        }).catch(this.client.catchError);

        if (this.interaction.user.id === user.id) {
            await this.client.additionalDb.showBeginningTutorial(user.id, "profilePlayer", this.interaction);
        }
        const collector = profilePanel.createMessageComponentCollector({
            filter: interaction => interaction.user.id === this.interaction.user.id,
            idle: 60_000,
        });
        collector.on("collect", async interaction => {
            const embedAttachment = profilePanel.embeds[0]?.data?.image?.url;
            await profilePanel.removeAttachments().catch(this.client.catchError);
            // register the attachment URL in the attachments object
            if (typeof attachments[lastPanel.toLowerCase()] !== "string" && attachments[lastPanel.toLowerCase()] !== null) {
                attachments[lastPanel.toLowerCase()] = null;
                embeds[lastPanel.toLowerCase()].setImage(embedAttachment);
            }

            // update the buttons (blurple animation)
            buttons[buttons.map(e => e.data.custom_id).indexOf(lastPanel)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases[lastPanel])
                .setCustomId(lastPanel);
            buttons[buttons.map(e => e.data.custom_id).indexOf(interaction.customId)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(this.lang.commands.profile[`${interaction.customId.toLowerCase()}Button`])
                .setEmoji(this.client.enums.Rpg.Databases[interaction.customId])
                .setCustomId(interaction.customId);

            // show the tutorial

            if (this.interaction.user.id === user.id) {
                await this.client.additionalDb.showBeginningTutorial(user.id, `profile${interaction.customId}`, this.interaction);
            }

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
        });
    }
}

module.exports = Profile;