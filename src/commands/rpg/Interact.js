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
        // const quest = await this.client.questDb.load(user.id);
        // const inventory = await this.client.inventoryDb.load(user.id);

        const options = [
            {
                label: this.trad.optionDialogue,
                value: "dialogue",
                description: this.trad.optionDialogueDesc,
            },
            {
                label: this.trad.optionInteract,
                value: "interact",
                description: this.trad.optionInteractDesc,
            },
            {
                label: this.trad.optionGiveItems,
                value: "giveItems",
                description: this.trad.optionGiveItemsDesc,
            },
        ];

        const zoneExplored = Object.values(map.excavated?.[map.region.id] || {}).map(area => area.id).includes(map.area.id);
        if (!zoneExplored) {
            options.push(
                {
                    label: this.trad.optionExcavate,
                    value: "excavate",
                    description: this.trad.optionExcavateDesc,
                },
            );
        }

        const action = await this.menu(
            {
                content: this.mention + this.trad.possiblesChoices,
            },
            options,
        );
        if (action === null) return this.end();

        if (action[0] === "dialogue") {
            const pnjs = await this.client.questDb.getPNJs(user.id, "dialogue");

            if (pnjs.length === 0) {
                await this.interaction.editReply({
                    content: this.mention + this.trad.noPnjForDialogue,
                    components: [],
                }).catch(this.client.catchError);
                return this.end();
            }

            const pnjChoice = await this.menu(
                {
                    content: this.mention + this.trad.pnjChoice,
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

            const dialogues = await this.client.questDb.getDialoguesByPNJ(user.id, pnjChoice[0]);
            let dialChosen = null;

            if (dialogues.length > 1) {
                const dialogueChoice = await this.menu(
                    {
                        content: this.mention + this.trad.dialogueChoice,
                    },
                    dialogues.map(dial => (
                        {
                            label: dial.dialogue.name,
                            value: dial.dialogue.id,
                        }
                    )),
                );
                if (dialogueChoice === null) return this.end();

                dialChosen = dialogueChoice[0];
            }
            else if (dialogues.length === 1) {
                const dialConfirmChoice = await this.choice(
                    {
                        content: this.mention + this.trad.wantsToDialogue.replace("%DIALOG_NAME", dialogues[0].dialogue.name),
                    },
                    this.trad.optionDialogue,
                    this.trad.cancel,
                );
                if (dialConfirmChoice === null) return this.end();

                if (dialConfirmChoice === "secondary") {
                    await this.interaction.editReply({
                        content: this.mention + this.trad.canceledDialogue,
                    }).catch(this.client.catchError);
                    return this.end();
                }
                dialChosen = dialogues[0];
            }
            else {
                await this.interaction.editReply({
                    content: this.mention + this.trad.noDialogue,
                }).catch(this.client.catchError);
                return this.end();
            }
            await this.client.questDb.displayDialogue(this, dialChosen.dialogue);
            await this.client.questDb.setObjectiveManuallyCompleted(user.id, dialChosen.questKey, dialChosen.objectiveId);
        }
        else if (action[0] === "interact") {
            const interactions = await this.client.questDb.getInteractions(user.id);

            if (interactions.length === 0) {
                await this.interaction.editReply({
                    content: this.mention + this.trad.noInteraction,
                    components: [],
                }).catch(this.client.catchError);
                return this.end();
            }

            const interChoice = await this.menu(
                {
                    content: this.mention + this.trad.interactionChoice,
                },
                interactions.map(int => (
                    {
                        label: int.interaction.name,
                        value: int.interaction.id,
                    }
                )),
            );
            if (interChoice === null) return this.end();

            const interChosen = interactions.find(int => int.interaction.id === interChoice[0]);

            await interChosen.interaction.play(this);
            await this.client.questDb.setObjectiveManuallyCompleted(user.id, interChosen.questKey, interChosen.objectiveId);
        }
        else if (action[0] === "giveItems") {
            console.log("cas 2");
        }
        else {
            console.log("cas 3");
        }
    }
}

module.exports = Interact;