const Command = require("../../base/Command");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

class Delete extends Command {
    constructor() {
        super({
            name: "delete",
            description: "Permet à l’utilisateur de supprimer son aventure s' il en possède une.",
            descriptionLocalizations: {
                "en-US": "Allows the user to delete their adventure if they have one.",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["delete"],
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

        const firstWarning = await this.interaction.reply({
            content: this.mention,
            embeds: [
                new EmbedBuilder()
                    .setColor(this.client.enums.Colors.Red)
                    .setTitle(this.lang.commands.delete.areYouSure)
                    .setDescription(this.lang.commands.delete.firstWarning),
            ],
            components: [
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder()
                            .setLabel(this.lang.commands.delete.deleteButton)
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("delete"),
                        new ButtonBuilder()
                            .setLabel(this.lang.commands.delete.cancelButton)
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId("cancel"),
                    ),
            ],
        }).catch(this.client.catchError);

        const firstResponse = await firstWarning.awaitMessageComponent({
            filter: inter => inter.user.id === user.id,
            time: 60_000,
        }).catch(this.client.catchError);

        if (!firstResponse) {
            await this.interaction.editReply({
                content: this.mention + this.lang.systems.choiceIgnored,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        await firstResponse.deferUpdate().catch(this.client.catchError);

        if (firstResponse.customId === "cancel") {
            await this.interaction.editReply({
                content: this.mention + this.lang.commands.delete.deletionCanceled,
                embeds: [],
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }

        const secondWarning = await this.interaction.editReply({
            content: this.mention,
            embeds: [
                new EmbedBuilder()
                    .setColor(this.client.enums.Colors.Red)
                    .setTitle(this.lang.commands.delete.definitiveAction)
                    .setDescription(this.lang.commands.delete.secondWarning),
            ],
            components: [
                new ActionRowBuilder()
                    .setComponents(
                        new ButtonBuilder()
                            .setLabel(this.lang.commands.delete.deleteButton)
                            .setStyle(ButtonStyle.Danger)
                            .setCustomId("delete"),
                        new ButtonBuilder()
                            .setLabel(this.lang.commands.delete.cancelButton)
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId("cancel"),
                    ),
            ],
        }).catch(this.client.catchError);

        const secondResponse = await secondWarning.awaitMessageComponent({
            filter: inter => inter.user.id === user.id,
            time: 60_000,
        }).catch(this.client.catchError);

        if (!secondResponse) {
            await this.interaction.editReply({
                content: this.mention + this.lang.systems.choiceIgnored,
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        await secondResponse.deferUpdate().catch(this.client.catchError);

        if (secondResponse.customId === "cancel") {
            await this.interaction.editReply({
                content: this.mention + this.lang.commands.delete.deletionCanceled,
                embeds: [],
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
        else {
            await this.client.playerDb.remove(user.id);
            await this.interaction.editReply({
                content: this.mention,
                embeds: [
                    new EmbedBuilder()
                        .setColor(this.client.enums.Colors.Red)
                        .setTitle(this.lang.commands.delete.bye)
                        .setDescription(this.lang.commands.delete.adventureDeleted),
                ],
                components: [],
            }).catch(this.client.catchError);
            return this.end();
        }
    }
}

module.exports = Delete;