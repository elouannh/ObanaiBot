const Command = require("../../base/Command");

class LureCrow extends Command {
    constructor() {
        super(
            {
                name: "lure-crow",
                description: "Permet d'appâter un corbeau de liaison.",
                descriptionLocalizations: {
                    "en-US": "Allows you to lure a kasugai crow.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Lure-Crow",
                dmPermission: true,
            },
            {
                trad: "lureCrow",
                type: [1],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["adventureLocal"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read", "write"],
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

        const inventory = await this.client.inventoryDb.load(user.id);

        if (inventory.kasugaiCrow.id === null) {
            await this.interaction.reply({ content: this.mention + this.trad.noCrow })
                .catch(this.client.catchError);
            return this.end();
        }

    }

}

module.exports = LureCrow;