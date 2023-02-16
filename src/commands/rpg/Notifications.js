const Command = require("../../base/Command");

class Profile extends Command {
    constructor() {
        super(
            {
                name: "notifications",
                description: "Permet à l'utilisateur de gérer les paramètres de notifications.",
                descriptionLocalizations: {
                    "en-US": "Allows the user to manage the notification settings.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Notifications",
            },
            {
                trad: "notifications",
                type: [1],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["notifications"],
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

        const additional = await this.client.additionalDb.load(this.user.id);

        const notificationConfig = await this.menu(
            {
                content: this.trad.mainChoice
                    + `\n\n> ${this.client.enums.Rpg.Notifications.Dm} **${this.trad.dmChoice}**`
                    + `\n→ ${this.trad.dmDesc}`
                    + `\n\n> ${this.client.enums.Rpg.Notifications.Last} **${this.trad.lastChoice}**`
                    + `\n→ ${this.trad.lastDesc}`
                    + `\n\n> ${this.client.enums.Rpg.Notifications.LastOnly} **${this.trad.lastOnlyChoice}**`
                    + `\n→ ${this.trad.lastOnlyDesc}`
                    + `\n\n> ${this.client.enums.Rpg.Notifications.Custom} **${this.trad.customChoice}**`
                    + `\n→ ${this.trad.customDesc}`,
            },
            [
                {
                    label: this.trad.dmChoice,
                    value: "dm",
                    description: this.trad.dmDesc,
                    emoji: this.client.enums.Rpg.Notifications.Dm,
                },
                {
                    label: this.trad.lastChoice,
                    value: "last",
                    description: this.trad.lastDesc,
                    emoji: this.client.enums.Rpg.Notifications.Last,
                },
                {
                    label: this.trad.lastOnlyChoice,
                    value: "lastOnly",
                    description: this.trad.lastOnlyChoice,
                    emoji: this.client.enums.Rpg.Notifications.LastOnly,
                },
                {
                    label: this.trad.customChoice,
                    value: "custom",
                    description: this.trad.customDesc,
                    emoji: this.client.enums.Rpg.Notifications.Custom,
                },
            ],
        );
        if (notificationConfig === null) return;

        if (notificationConfig[0] === "custom") return await this.return(this.trad.premiumOnly);

        this.client.additionalDb.setNotification(this.user.id, notificationConfig[0]);
        return await this.return(
            this.trad.chosen.replace(
                "%SETTINGS",
                `${this.client.enums.Rpg.Notifications[this.client.util.capitalize(notificationConfig[0])]} `
                + `**${this.trad[`${notificationConfig[0]}Choice`]}**`,
            ),
        );
    }
}

module.exports = Profile;