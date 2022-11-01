const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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
        await this.interaction.deferReply().catch(this.client.util.catchError);
        const user = await this.getUserFromInteraction(this.interaction.type);
        // if (!(await this.client.playerDb.exists(user.id))) {
        //     if (this.client.playerDb.get(user.id).alreadyPlayed) {
        //         return await this.interaction.reply({
        //             content: this.lang.systems.playerNotFoundAlreadyPlayed,
        //             ephemeral: true,
        //         }).catch(this.client.util.catchError);
        //     }
        //     return await this.interaction.reply({ content: this.lang.systems.playerNotFound, ephemeral: true })
        //         .catch(this.client.util.catchError);
        // }

        const player = await this.client.playerDb.load(user.id);
        const inventory = await this.client.inventoryDb.load(user.id);
        const activity = await this.client.activityDb.load(user.id);
        const map = await this.client.mapDb.load(user.id);
        const additional = await this.client.additionalDb.load(user.id);

        const playerImage = await this.client.playerDb.getImage(player);

        const embeds = {
            playerEmbed: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                    + this.lang.commands.profile.playerTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setDescription(`\`Thème: \`**\`${playerImage.name}\`**`)
                .setImage("attachment://profile-player.png")
                .setColor(this.client.enums.Colors.Blurple),
            inventoryEmbed: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Inventory} ⟫ `
                    + this.lang.commands.profile.inventoryTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setColor(this.client.enums.Colors.Blurple),
            activityEmbed: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Activity} ⟫ `
                    + this.lang.commands.profile.activityTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setColor(this.client.enums.Colors.Blurple),
            mapEmbed: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Map} ⟫ `
                    + this.lang.commands.profile.mapTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setColor(this.client.enums.Colors.Blurple),
            additionalEmbed: new EmbedBuilder()
                .setTitle(
                    `⟪ ${this.client.enums.Rpg.Databases.Additional} ⟫ `
                    + this.lang.commands.profile.additionalTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
                .setColor(this.client.enums.Colors.Blurple),
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

        await this.client.additionalDb.showBeginningTutorial(user.id, "profileCommand", this.interaction);

        const profilePanel = await this.interaction.editReply({
            embeds: [embeds.playerEmbed],
            components: [new ActionRowBuilder().setComponents(buttons)],
            files: [playerImage.attachment],
        }).catch(this.client.util.catchError);

        await this.client.additionalDb.showBeginningTutorial(user.id, "profilePlayer", this.interaction);

        const collector = profilePanel.createMessageComponentCollector({
            filter: interaction => interaction.user.id === this.interaction.user.id,
            idle: 60_000,
        });
        collector.on("collect", async interaction => {
            buttons[buttons.map(e => e.data.custom_id).indexOf(lastPanel)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases[lastPanel])
                .setCustomId(lastPanel);
            buttons[buttons.map(e => e.data.custom_id).indexOf(interaction.customId)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(this.lang.commands.profile[`${interaction.customId.toLowerCase()}Button`])
                .setEmoji(this.client.enums.Rpg.Databases[interaction.customId])
                .setCustomId(interaction.customId);

            lastPanel = interaction.customId;
            await this.client.additionalDb.showBeginningTutorial(user.id, `profile${lastPanel}`, this.interaction);

            await this.interaction.editReply({
                embeds: [embeds[interaction.customId.toLowerCase()]],
                components: [new ActionRowBuilder().setComponents(buttons)],
            }).catch(this.client.util.catchError);

            await interaction.deferUpdate().catch(this.client.util.catchError);
        });
        collector.on("end", async () => {
            await this.interaction.editReply({ components: [] }).catch(this.client.util.catchError);
        });
    }
}

module.exports = Profile;