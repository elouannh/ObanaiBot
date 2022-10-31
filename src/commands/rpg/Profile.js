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
        if (!(await this.client.playerDb.exists(user.id))) await this.client.playerDb.create(user.id);

        const activity = await this.client.activityDb.load(user.id);
        const additional = await this.client.additionalDb.load(user.id);
        const inventory = await this.client.inventoryDb.load(user.id);
        const map = await this.client.mapDb.load(user.id);
        const player = await this.client.playerDb.load(user.id);

        const activityEmbed = new EmbedBuilder()
            .setTitle("embed de test - activité")
            .setColor(this.client.enums.Colors.Blurple);
        const additionalEmbed = new EmbedBuilder()
            .setTitle("embed de test - activité")
            .setColor(this.client.enums.Colors.Blurple);
        const inventoryEmbed = new EmbedBuilder()
            .setTitle("embed de test - activité")
            .setColor(this.client.enums.Colors.Blurple);
        const mapEmbed = new EmbedBuilder()
            .setTitle("embed de test - activité")
            .setColor(this.client.enums.Colors.Blurple);
        const playerEmbed = new EmbedBuilder()
            .setTitle("embed de test - activité")
            .setColor(this.client.enums.Colors.Blurple);

        const buttons = [
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setLabel("Activité")
                    .setEmoji(this.client.enums.Rpg.Databases.Activity)
                    .setCustomId("activity"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(this.client.enums.Rpg.Databases.Additional)
                    .setCustomId("additional"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(this.client.enums.Rpg.Databases.Inventory)
                    .setCustomId("inventory"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(this.client.enums.Rpg.Databases.Map)
                    .setCustomId("map"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(this.client.enums.Rpg.Databases.Player)
                    .setCustomId("player"),
            ];

        let lastPanel = "activity";
        const profilePanel = await this.interaction.reply({
            embeds: [activityEmbed],
            components: [new ActionRowBuilder().setComponents(buttons)],
        }).catch(this.client.util.catchError);
        const collector = profilePanel.createMessageComponentCollector({
            filter: interaction => interaction.user.id === this.interaction.user.id,
            idle: 60000,
        });
        collector.on("collect", async interaction => {
            await interaction.deferUpdate().catch(this.client.util.catchError);
            buttons[["activity", "additional", "inventory", "map", "player"].indexOf(lastPanel)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(this.client.enums.Rpg.Databases[this.client.util.capitalize(lastPanel)])
                .setCustomId(lastPanel);
            buttons[["activity", "additional", "inventory", "map", "player"].indexOf(interaction.customId)] = new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setLabel(this.client.util.capitalize(interaction.customId))
                .setEmoji(this.client.enums.Rpg.Databases[this.client.util.capitalize(interaction.customId)])
                .setCustomId(interaction.customId);
            lastPanel = interaction.customId;
            await this.interaction.editReply({
                embeds: [eval(`${interaction.customId}Embed`)],
                components: [new ActionRowBuilder().setComponents(buttons)],
            }).catch(this.client.util.catchError);
        });
    }
}

module.exports = Profile;