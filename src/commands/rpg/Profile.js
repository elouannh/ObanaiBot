const Command = require("../../base/Command");
const {
    EmbedBuilder,
    ActionRowBuilder,
    SelectMenuBuilder,
    ButtonBuilder,
    inlineCode,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder,
    escapeMarkdown,
    User,
} = require("discord.js");
const Nav = require("../../base/NavigationClasses");

class StaffPanel extends Command {
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
                    name: "joueur",
                    nameLocalizations: {
                        "en-US": "player",
                    },
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
            finishRequest: ["profile"],
            private: "none",
            permissions: 0n,
        });
    }

    async run() {
        let [user, cached, userId] = [this.interaction.user, true, this.interaction.user.id];
        if (this.interaction.type === 1) userId = this.interaction.options?.get("joueur")?.user?.id;
        else if (this.interaction.type === 2) userId = this.client.users.cache.get(this.interaction.targetId);
        [user, cached, userId] = await this.client.getUser(userId, user);

        const userPDB = await this.client.playerDb.get(userId);
        const userIDB = await this.client.inventoryDb.get(userId);

        console.log(userPDB);
        console.log(userIDB);
        console.log(this.lang);

        // {
        //     started: false,
        //         id: '854358656519110666',
        //     lang: 'fr',
        //     stats: { agility: 1, defense: 1, strength: 1, speed: 1 },
        //     category: 'slayer',
        //         categoryLevel: 1,
        //     breath: 'water',
        //     exp: 0,
        //     created: 1660735861425,
        //     aptitudes: { agility: 10, defense: 10, strength: 11, speed: 10 },
        //     squad: null
        // }
        // {
        //     id: '854358656519110666',
        //         yens: 1000,
        //     kasugai_crow: null,
        //     kasugai_crow_exp: 0,
        //     active_grimoire: null,
        //     active_grimoire_since: 0,
        //     grimoires: { mastery: 1 },
        //     materials: {},
        //     questItems: {},
        //     weapon: { rarity: 1, name: 'Épée abîmée', label: 'katana' },
        //     weapons: []
        // }

        const profile = ``;

        await this.interaction.reply({
            content: "```logged into the console```",
        }).catch(this.client.util.catcherror);
    }
}

module.exports = StaffPanel;