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
            cooldown: 5,
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

        const player = await this.client.playerDb.load(user.id);
        const inventory = await this.client.inventoryDb.load(user.id);
        const activity = await this.client.activityDb.load(user.id);
        const map = await this.client.mapDb.load(user.id);
        const additional = await this.client.additionalDb.load(user.id);

        console.log(this.lang.rpgAssets);

        const playerEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Player} ⟫ `
                + this.lang.commands.profile.playerTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
            .setDescription(
                this.lang.commands.profile.characterChosen
                    .replace("%CHARACTER", `**${player.character.fullName}** (${player.character.label})`),
                )
            .setFields(
                {
                    name: `> ${this.lang.commands.profile.statisticsName}`,
                    value:
                        `${this.client.enums.Rpg.Statistics.Strength} ${this.lang.rpgAssets.statistics.names.strength} `
                        + `**\`${player.statistics.strength.amount}\`**`
                        + `\n${this.client.enums.Rpg.Statistics.Defense} ${this.lang.rpgAssets.statistics.names.defense} `
                        + `**\`${player.statistics.defense.amount}\`**`,
                    inline: true,
                },
            )
            .setColor(this.client.enums.Colors.Blurple);
        const inventoryEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Inventory} ⟫ `
                + this.lang.commands.profile.inventoryTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
            .setColor(this.client.enums.Colors.Blurple);
        const activityEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Activity} ⟫ `
                + this.lang.commands.profile.activityTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
            .setColor(this.client.enums.Colors.Blurple);
        const mapEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Map} ⟫ `
                + this.lang.commands.profile.mapTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
            .setColor(this.client.enums.Colors.Blurple);
        const additionalEmbed = new EmbedBuilder()
            .setTitle(
                `⟪ ${this.client.enums.Rpg.Databases.Additional} ⟫ `
                + this.lang.commands.profile.additionalTitle.replace("%PLAYER", `\`${user.tag}\``),
                )
            .setColor(this.client.enums.Colors.Blurple);

        const buttons = [
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setEmoji(this.client.enums.Rpg.Databases.Player)
                .setLabel(this.lang.commands.profile.playerButton)
                .setCustomId("player"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases.Inventory)
                .setCustomId("inventory"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases.Activity)
                .setCustomId("activity"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases.Map)
                .setCustomId("map"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases.Additional)
                .setCustomId("additional"),
        ];

        let lastPanel = "player";
        const profilePanel = await this.interaction.reply({
            embeds: [eval(`${lastPanel}Embed`)],
            components: [new ActionRowBuilder().setComponents(buttons)],
        }).catch(this.client.util.catchError);
        const collector = profilePanel.createMessageComponentCollector({
            filter: interaction => interaction.user.id === this.interaction.user.id,
            idle: 60000,
        });
        collector.on("collect", async interaction => {
            console.log(buttons);

            buttons[buttons.map(e => e.data.custom_id).indexOf(lastPanel)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases[this.client.util.capitalize(lastPanel)])
                .setCustomId(lastPanel);
            buttons[buttons.map(e => e.data.custom_id).indexOf(interaction.customId)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(this.lang.commands.profile[`${interaction.customId}Button`])
                .setEmoji(this.client.enums.Rpg.Databases[this.client.util.capitalize(interaction.customId)])
                .setCustomId(interaction.customId);

            lastPanel = interaction.customId;

            await this.interaction.editReply({
                embeds: [eval(`${interaction.customId}Embed`)],
                components: [new ActionRowBuilder().setComponents(buttons)],
            }).catch(this.client.util.catchError);
            await interaction.deferUpdate().catch(this.client.util.catchError);
        });
    }
}

module.exports = Profile;