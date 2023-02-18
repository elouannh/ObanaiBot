const Command = require("../../base/Command");

class Profile extends Command {
    constructor() {
        super(
            {
                name: "profile",
                description: "Permet à l’utilisateur de voir son profil, son inventaire, son emplacement sur la carte, ses activités en cours ainsi que certaines statistiques.",
                descriptionLocalizations: {
                    "en-US": "Allows the user to view their profile, inventory, location on the map, current activities and some statistics.",
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
                dmPermission: true,
            },
            {
                name: "Profile",
            },
            {
                trad: "profile",
                type: [1, 2],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["profile"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read"],
                cancelDefer: false,
            },
            {
                needToBeStatic: false,
                needToBeInRpg: true,
            },
        );
    }

    async run() {
        await this.focus("option");
        const exists = await this.hasAdventure();
        if (!exists) return;

        const player = await this.client.playerDb.load(this.user.id);
        const inventory = await this.client.inventoryDb.load(this.user.id);
        const activity = await this.client.activityDb.load(this.user.id);
        const map = await this.client.mapDb.load(this.user.id);
        const additional = await this.client.additionalDb.load(this.user.id);

        const playerImage = await this.client.playerDb.getImage(player);

        const embeds = {
            player: await this.client.playerDb.getEmbed(
                this.lang, player, this.user, this.client.additionalDb.getThemeName(this.lang, playerImage.name),
            ),
            inventory: await this.client.inventoryDb.getEmbed(this.lang, inventory, this.user),
            activity: await this.client.activityDb.getEmbed(this.lang, activity, this.user),
            map: await this.client.mapDb.getEmbed(this.lang, map, this.user),
            additional: await this.client.additionalDb.getEmbed(this.lang, additional, this.user),
        };
        const attachments = {
            player: playerImage.attachment,
            inventory: null,
            activity: null,
            map: null,
            additional: null,
        };

        const options = [
            {
                label: this.lang.commands.profile.playerButton,
                emoji: this.client.enums.Rpg.Databases.Player,
                value: "Player",
            },
            {
                label: this.lang.commands.profile.inventoryButton,
                emoji: this.client.enums.Rpg.Databases.Inventory,
                value: "Inventory",
            },
            {
                label: this.lang.commands.profile.activityButton,
                emoji: this.client.enums.Rpg.Databases.Activity,
                value: "Activity",
            },
            {
                label: this.lang.commands.profile.mapButton,
                emoji: this.client.enums.Rpg.Databases.Map,
                value: "Map",
            },
            {
                label: this.lang.commands.profile.additionalButton,
                emoji: this.client.enums.Rpg.Databases.Additional,
                value: "Additional",
            },
        ];
        let lastPanel = "Player";
        if (this.interaction.user.id === this.user.id) {
            await this.client.additionalDb.showTutorial(
                this.user.id, "profile", "main", this.interaction,
            );
        }
        let loop = true;
        while (loop) {
            let profileInteraction = await this.menu(
                {
                    embeds: [embeds[lastPanel.toLowerCase()]],
                    files: attachments[lastPanel.toLowerCase()] === null ?
                        []
                        : [attachments[lastPanel.toLowerCase()]],
                },
                options,
                null,
                null,
                false,
                true,
            );
            if (profileInteraction === null || profileInteraction === lastPanel || profileInteraction === "cancel") {
                if (profileInteraction === null || profileInteraction === "cancel") loop = false;
                continue;
            }
            profileInteraction = profileInteraction[0];
            const embedAttachment = (await this.message())?.embeds[0]?.data?.image?.url;
            await (await this.message())?.removeAttachments().catch(this.client.catchError);
            if (
                typeof attachments[lastPanel.toLowerCase()] !== "string"
                && attachments[lastPanel.toLowerCase()] !== null
            ) {
                attachments[lastPanel.toLowerCase()] = null;
                embeds[lastPanel.toLowerCase()].setImage(embedAttachment);
            }

            await this.editContent({
                embeds: [embeds[profileInteraction.toLowerCase()]],
                files: attachments[profileInteraction.toLowerCase()] === null ?
                    []
                    : [attachments[profileInteraction.toLowerCase()]],
            });
            lastPanel = profileInteraction;
        }
        return this.end();
    }
}

module.exports = Profile;