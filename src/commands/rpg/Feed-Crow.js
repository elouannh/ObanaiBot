const Command = require("../../base/Command");

class FeedCrow extends Command {
    constructor() {
        super(
            {
                name: "feed-crow",
                description: "Permet de nourrir son corbeau kasugai.",
                descriptionLocalizations: {
                    "en-US": "Allows you to feed your kasugai crow.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Feed-Crow",
                dmPermission: true,
            },
            {
                trad: "feedCrow",
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
            return await this.return(this.mention + this.trad.noCrow);
        }
        if (inventory.kasugaiCrow.hunger === 100) {
            return await this.return(this.mention + this.trad.noHunger);
        }

        const seedAmount = inventory.items.materials?.seed?.amount || 0;
        const wormAmount = inventory.items.materials?.worm?.amount || 0;
        const seedInstance = this.client.RPGAssetsManager.getMaterial(
            this.client.playerDb.getLang(user.id), "seed",
        );
        const wormInstance = this.client.RPGAssetsManager.getMaterial(
            this.client.playerDb.getLang(user.id), "worm",
        );

        if (seedAmount < 50 || wormAmount < 5) {
            return await this.return(
                this.mention + this.trad.missingResources + "\n"
                    + (seedAmount < 50 ?
                            `**${seedInstance.name} x${50 - seedAmount}** `
                            + `(${this.trad.currently
                                .replace("%AMOUNT", seedAmount)
                                .replace("%MAX", "50")})\n`
                            : ""
                    )
                    + (wormAmount < 5 ?
                            `**${wormInstance.name} x${5 - wormAmount}** `
                            + `(${this.trad.currently
                                .replace("%AMOUNT", wormAmount)
                                .replace("%MAX", "5")})`
                            : ""
                    ),
            );
        }

        const feedResponse = await this.choice(
            {
                content: this.mention + `${this.trad.wantsToFeed}\n\n`
                    + `${this.trad.required}\n`
                    + "**" + seedInstance.name + " x50**\n"
                    + "**" + wormInstance.name + " x5**",
            },
            this.trad.feedButton,
            this.trad.cancelButton,
        );
        if (feedResponse === null) return this.end();

        if (feedResponse === "secondary") return await this.return(this.mention + this.trad.canceled);

        const newAmount = Math.min(inventory.kasugaiCrow.hunger + 15, 100);
        await this.client.inventoryDb.feedKasugaiCrow(user.id, newAmount);
        return await this.return(this.mention + this.trad.fed.replace("%AMOUNT", newAmount));
    }
}

module.exports = FeedCrow;