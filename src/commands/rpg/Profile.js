const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");

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
                return await this.interaction.reply({
                    content: this.lang.systems.playerNotFoundAlreadyPlayed,
                    ephemeral: true,
                }).catch(this.client.util.catchError);
            }
            return await this.interaction.reply({ content: this.lang.systems.playerNotFound, ephemeral: true })
                .catch(this.client.util.catchError);
        }
        await this.interaction.deferReply().catch(this.client.util.catchError);

        const player = await this.client.playerDb.load(user.id);
        const inventory = await this.client.inventoryDb.load(user.id);
        const activity = await this.client.activityDb.load(user.id);
        const map = await this.client.mapDb.load(user.id);
        const additional = await this.client.additionalDb.load(user.id);

        console.log(inventory);

        const playerImage = await this.client.playerDb.getImage(player);

        const embeds = {
            player: await this.client.playerDb.getEmbed(this.lang, player, playerImage.name, user),
            inventory: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Inventory} ⟫ `
                    + this.lang.commands.profile.inventoryTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setDescription(`${this.lang.commands.profile.wallet}: \`${inventory.wallet}\`¥`)
                .addFields(
                    {
                        name: this.lang.rpgAssets.concepts.kasugaiCrow,
                        value: inventory.kasugaiCrow.id === null ?
                            this.lang.commands.profile.noCrow : inventory.kasugaiCrow.name,
                        inline: true,
                    },
                    {
                        name: this.lang.rpgAssets.concepts.enchantedGrimoire,
                        value: inventory.enchantedGrimoire.id === null ?
                            this.lang.commands.profile.noGrimoire
                            : (`${inventory.enchantedGrimoire.name} | ${this.lang.commands.profile.remainingTime} `
                            + `${inventory.enchantedGrimoire.lifespan}\n`
                            + `__${this.lang.rpgAssets.concepts.enchantedGrimoireEffects}:__`
                            + `\n${inventory.enchantedGrimoire.effects.map((effect) => `• ${effect}`).join("\n")}`),
                        inline: true,
                    },
                    {
                        name: this.lang.commands.profile.activeSince,
                        value: inventory.enchantedGrimoire.id === null ? this.lang.commands.profile.noGrimoire
                            : `<t:${inventory.activeSinceString}:R>`,
                        inline: true,
                    },
                )
                .setColor(this.client.enums.Colors.Blurple),
            activity: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Activity} ⟫ `
                    + this.lang.commands.profile.activityTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setColor(this.client.enums.Colors.Blurple),
            map: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Map} ⟫ `
                    + this.lang.commands.profile.mapTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setColor(this.client.enums.Colors.Blurple),
            additional: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Additional} ⟫ `
                    + this.lang.commands.profile.additionalTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setColor(this.client.enums.Colors.Blurple),
        };
        const attachments = {
            // player: playerImage.attachment,
            player: null,
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
        }).catch(this.client.util.catchError);

        if (this.interaction.user.id === user.id) {
            await this.client.additionalDb.showBeginningTutorial(user.id, "profilePlayer", this.interaction);
        }
        const collector = profilePanel.createMessageComponentCollector({
            filter: interaction => interaction.user.id === this.interaction.user.id,
            idle: 60_000,
        });
        collector.on("collect", async interaction => {
            const embedAttachment = profilePanel.embeds[0]?.data?.image?.url;
            await profilePanel.removeAttachments().catch(this.client.util.catchError);
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

            await interaction.deferUpdate().catch(this.client.util.catchError);

            // update the panel
            await this.interaction.editReply({
                embeds: [embeds[interaction.customId.toLowerCase()]],
                components: [new ActionRowBuilder().setComponents(buttons)],
                files: attachments[interaction.customId.toLowerCase()] === null ? [] : [attachments[interaction.customId.toLowerCase()]],
            }).catch(this.client.util.catchError);

            lastPanel = interaction.customId;
        });
        collector.on("end", async () => {
            await this.interaction.editReply({ components: [] }).catch(this.client.util.catchError);
        });
    }
}

module.exports = Profile;