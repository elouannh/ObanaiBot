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
            cooldown: 10,
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
        const inventory = await this.client.inventoryDb.load(user.id);

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

        const zoneExplored = Object.values(map.excavated?.[map.region.id] || {}).map(area => area[0].id).includes(map.area.id);
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

            const choices = await this.client.questDb.getDialoguesByPNJ(user.id, pnjChoice[0]);
            let temp = null;

            if (choices.length > 0) {
                const choice = await this.menu(
                    {
                        content: this.mention + this.trad.dialogueChoice,
                    },
                    choices.map(e => (
                        {
                            label: e.dialogue.name,
                            value: e.dialogue.id,
                        }
                    )),
                );
                if (choice === null) return this.end();

                temp = choice[0];
            }
            else {
                await this.interaction.editReply({
                    content: this.mention + this.trad.noDialogue,
                }).catch(this.client.catchError);
                return this.end();
            }

            const chosen = choices.find(e => e.dialogue.id === temp);

            await this.client.questDb.displayDialogue(this, chosen.dialogue);
            await this.client.questDb.setObjectiveManuallyCompleted(user.id, chosen.questKey, chosen.objectiveId);
            return this.end();
        }
        else if (action[0] === "interact") {
            const choices = await this.client.questDb.getInteractions(user.id);

            if (choices.length === 0) {
                await this.interaction.editReply({
                    content: this.mention + this.trad.noInteraction,
                    components: [],
                }).catch(this.client.catchError);
                return this.end();
            }

            const choice = await this.menu(
                {
                    content: this.mention + this.trad.interactionChoice,
                },
                choices.map(e => (
                    {
                        label: e.interaction.name,
                        value: e.interaction.id,
                    }
                )),
            );
            if (choice === null) return this.end();

            const chosen = choices.find(e => e.interaction.id === choice[0]);

            await chosen.interaction.play(this);
            await this.client.questDb.setObjectiveManuallyCompleted(user.id, chosen.questKey, chosen.objectiveId);
            return this.end();
        }
        else if (action[0] === "giveItems") {
            const pnjs = await this.client.questDb.getPNJs(user.id, "giveItems");

            if (pnjs.length === 0) {
                await this.interaction.editReply({
                    content: this.mention + this.trad.noPnjForItems,
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

            const choices = await this.client.questDb.getItemsToGive(user.id, pnjChoice[0]);
            let temp = null;

            if (choices.length > 0) {
                const choice = await this.menu(
                    {
                        content: this.mention + this.trad.giftChoice,
                    },
                    choices.map(e => (
                        {
                            label: e.objectiveName,
                            value: e.objectiveId,
                            description: e.questName,
                        }
                    )),
                );
                if (choice === null) return this.end();

                temp = choice[0];
            }
            else {
                await this.interaction.editReply({
                    content: this.mention + this.trad.canceledGift,
                }).catch(this.client.catchError);
                return this.end();
            }
            const chosen = choices.find(e => e.objectiveId === temp);
            const userAmount = inventory.items[chosen.items.type]?.[chosen.items.instance.id]?.amount || 0;

            if (userAmount < chosen.items.amount) {
                await this.interaction.editReply({
                    content: this.mention + this.trad.noItems
                        + `\n\n> **${chosen.items.instance.name} x${chosen.items.amount}**`,
                    components: [],
                }).catch(this.client.catchError);
                return this.end();
            }

            const pnjInfos = await this.client.RPGAssetsManager.getCharacter(this.client.playerDb.getLang(user.id), pnjChoice[0]);

            const wantsToGive = await this.choice(
                {
                    content: this.mention + this.trad.wantsToGive.replace("%PNJ_NAME", pnjInfos.fullName)
                        + `\n\n> **${chosen.items.instance.name} x${chosen.items.amount}**`,
                },
                this.trad.give,
                this.trad.cancel,
            );
            if (wantsToGive === null) return this.end();

            if (wantsToGive === "primary") {
                this.client.questDb.giveItems(user.id, chosen.items);
                await this.client.questDb.setObjectiveManuallyCompleted(user.id, chosen.questKey, chosen.objectiveId);

                await this.interaction.editReply({
                    content: this.mention + this.trad.giftDone,
                    components: [],
                }).catch(this.client.catchError);
                return this.end();
            }
            else if (wantsToGive === "secondary") {
                await this.interaction.editReply({
                    content: this.mention + this.trad.giftCanceled,
                    components: [],
                }).catch(this.client.catchError);
                return this.end();
            }
        }
        else {
            const bag = [];
            const availableResources = Object.values(this.client.RPGAssetsManager.materials)
                .filter(e => e.biomes.includes(map.area.biome.id));

            for (let i = 0; i < 2; i++) {
                if (i === 0) {
                    for (const resource of availableResources.sort(() => Math.random() - 0.5)) {
                        if (bag.reduce((a, b) => a.size + b.size, 0) >= 200) break;

                        bag.push({ resource: resource, amount: 0 });
                    }
                }
                else {
                    let resourceFocused = 0;
                    while (resourceFocused < bag.length) {
                        const res = bag[resourceFocused];
                        const dropped = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];
                        if (dropped[0] < res.resource.lootRate || dropped[1] < res.resource.lootRate) {
                            if (res.resource.size * bag[resourceFocused].amount <= 200) {
                                bag[resourceFocused].amount++;
                                continue;
                            }
                        }
                        resourceFocused++;
                    }
                }
            }

            console.log(bag);
            return this.end();
        }
    }
}

module.exports = Interact;