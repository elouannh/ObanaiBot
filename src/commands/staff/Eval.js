const Command = require("../../base/Command");
const {
    ActionRowBuilder,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder,
} = require("discord.js");

class Base extends Command {
    constructor() {
        super(
            {
                name: "eval",
                description: "Commande permettant de tester un script.",
                descriptionLocalizations: {
                    "en-US": "Command to test a script.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Eval",
            },
            {
                trad: "eval",
                type: [1],
                category: "Staff",
                cooldown: 10,
                completedRequests: [],
                authorizationBitField: 0b100,
                permissions: 0n,
                targets: [],
                cancelDefer: true,
            },
            {
                needToBeStatic: false,
                needToBeInRpg: false,
            },
        );
    }

    async run() {
        const modal = new ModalBuilder()
            .setTitle(this.lang.commands.eval.modalTitle)
            .setCustomId("modalCodeExecute")
            .setComponents(
                new ActionRowBuilder().setComponents(
                    new TextInputBuilder()
                        .setLabel(this.lang.commands.eval.modalLabel)
                        .setCustomId("codeInput")
                        .setPlaceholder(this.lang.commands.eval.modalPlaceholder)
                        .setRequired(true)
                        .setStyle(TextInputStyle.Paragraph),
                ),
            );

        await this.interaction.showModal(modal).catch(this.client.catchError);
        const modalSubmit = await this.interaction.awaitModalSubmit({
            filter: modalSubmitted => modalSubmitted.user.id === this.interaction.user.id,
            time: 300_000,
        }).catch(this.client.catchError);

        if (modalSubmit !== undefined) {
            const codeInput = modalSubmit.fields.getTextInputValue("codeInput") ?? "";

            const resp = await this.client.evalCode(codeInput, this);
            modalSubmit.reply({
                content: resp,
                ephemeral: false,
            }).catch(this.client.catchError);
        }

        return this.end();
    }
}

module.exports = Base;