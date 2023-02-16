const Command = require("../../base/Command");

class Delete extends Command {
    constructor() {
        super(
            {
                name: "delete",
                description: "Permet à l’utilisateur de supprimer son aventure s' il en possède une.",
                descriptionLocalizations: {
                    "en-US": "Allows the user to delete their adventure if they have one.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Delete",
            },
            {
                trad: "delete",
                type: [1],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["adventure"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read", "write"],
            },
             {
                needToBeStatic: false,
                needToBeInRpg: true,
            },
        );
    }

    async run() {
        const exists = await this.hasAdventure();
        if (!exists) return;

        const firstResponse = await this.choice(
            {
                content: this.trad.firstContent + this.trad.deleteInfos,
            },
            this.trad.deleteButton,
            this.trad.cancelButton,
        );
        if (firstResponse === null) return this.end();

        if (firstResponse === "secondary") {
            return await this.return(this.trad.notDeleted).catch(this.client.catchError);
        }

        const secondResponse = await this.choice(
            {
                content: this.trad.secondContent,
            },
            this.trad.deleteDefinitivelyButton,
            this.trad.cancelButton,
        );
        if (secondResponse === null) return this.end();

        if (secondResponse === "secondary") {
            return await this.return(this.trad.notDeleted);
        }
        else {
            await this.client.playerDb.remove(this.user.id);
            return await this.return(this.trad.deleted);
        }
    }
}

module.exports = Delete;