const Command = require("../../base/Command");

class Interact extends Command {
    constructor() {
        super({
            name: "interact",
            description: "Permet d’interagir avec l’environnement; peut déclencher un dialogue, un combat, fouiller la zone...",
            descriptionLocalizations: {
                "en-US": "Allows you to interact with the environment; can trigger a dialogue, a fight, explore the area...",
            },
            options: [],
            type: [1],
            dmPermission: true,
            category: "RPG",
            cooldown: 20,
            completedRequests: ["interact"],
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

        const map = await this.client.mapDb.load(user.id);
        const quest = await this.client.questDb.load(user.id);
        const inventory = await this.client.inventoryDb.load(user.id);

        const options = [
            {
                label: "Dialoguer",
                value: "dialogue",
                description: "Permet de dialoguer avec un PNJ.",
            },
            {
                label: "Interagir",
                value: "interact",
                description: "Permet d’interagir avec l'environnement.",
            },
            {
                label: "Don d'objets",
                value: "giveItems",
                description: "Permet de donner des objets à un PNJ.",
            },
        ];

        const zoneExplored = Object.values(map.excavated?.[map.region.id] || {}).map(area => area.id).includes(map.area.id);
        if (!zoneExplored) {
            options.push(
                {
                    label: "Fouiller",
                    value: "excavate",
                    description: "Permet de fouiller une zone.",
                },
            );
        }

        const action = await this.menu(
            {
                content: this.mention + "Choix possibles d'actions:",
            },
            options,
        );
        if (action === null) return this.end();

        if (action[0] === "dialogue") {
            const pnjs = await this.client.questDb.getPNJs(user.id, "dialogue");

            if (pnjs.length === 0) {
                await this.interaction.editReply({
                    content: this.mention + "Aucun PNJ n'est disponible pour dialoguer.",
                    components: [],
                }).catch(this.client.catchError);
                return this.end();
            }

            const pnjChoice = await this.menu(
                {
                    content: this.mention + "Choix du PNJ:",
                },
                pnjs.map(pnj => (
                    {
                        label: pnj.fullName,
                        value: pnj.id,
                        description: pnj.label,
                    }
                )),
            );
            if (pnjChoice === null) return this.end();

            console.log(await this.client.questDb.getDialoguesByPNJ(user.id, pnjChoice[0]));
        }
        else if (action[0] === "interact") {

        }
        else if (action[0] === "giveItems") {

        }
        else {

        }
    }
}

module.exports = Interact;