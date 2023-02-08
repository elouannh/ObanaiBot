const Command = require("../../base/Command");

class Interact extends Command {
    constructor() {
        super(
            {
                name: "interact",
                description: "Permet d’interagir avec l’environnement; peut déclencher un dialogue, un combat, fouiller la zone...",
                descriptionLocalizations: {
                    "en-US": "Allows you to interact with the environment; can trigger a dialogue, a fight, explore the area...",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Interact",
                dmPermission: true,
            },
            {
                trad: "interact",
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
        await this.interaction.deferReply().catch(this.client.catchError);
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            return await this.return(
                this.client.playerDb.get(user.id).alreadyPlayed ?
                    this.lang.systems.playerNotFoundAlreadyPlayed
                    : this.lang.systems.playerNotFound,
                true,
            );
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

        const zoneExplored = Object.values(map.excavated?.[map.region.id] || {})
            .map(area => area[0].id).includes(map.area.id);

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
                content: this.trad.possiblesChoices,
            },
            options,
        );
        if (action === null) return this.end();

        if (action[0] === "dialogue") {
            const pnjs = await this.client.questDb.getPNJs(user.id, "dialogue");

            if (pnjs.length === 0) return await this.return(this.trad.noPnjForDialogue);

            const pnjChoice = await this.menu(
                {
                    content: this.trad.pnjChoice,
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
                        content: this.trad.dialogueChoice,
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
                return await this.return(this.trad.noDialogue);
            }

            const chosen = choices.find(e => e.dialogue.id === temp);

            await this.client.questDb.displayDialogue(this, chosen.dialogue);
            await this.client.questDb.setObjectiveManuallyCompleted(user.id, chosen.questKey, chosen.objectiveId);
            return this.end();
        }
        else if (action[0] === "interact") {
            const choices = await this.client.questDb.getInteractions(user.id);

            if (choices.length === 0) return await this.return(this.trad.noInteraction);

            const choice = await this.menu(
                {
                    content: this.trad.interactionChoice,
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

            if (pnjs.length === 0) return await this.return(this.trad.noPnjForItems);

            const pnjChoice = await this.menu(
                {
                    content: this.trad.pnjChoice,
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
                        content: this.trad.giftChoice,
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
                return await this.return(this.trad.canceledGift);
            }
            const chosen = choices.find(e => e.objectiveId === temp);
            const userAmount = inventory.items[chosen.items.type]?.[chosen.items.instance.id]?.amount || 0;
            console.log(chosen.items);
            console.log(inventory.items[chosen.items.type], inventory.items[chosen.items.type]?.[chosen.items.instance.id], userAmount);

            if (userAmount < chosen.items.amount) {
                return await this.return(
                    this.trad.noItems
                    + `\n\n> **${chosen.items.instance.name} x${chosen.items.amount}**`,
                );
            }

            const pnjInfos = await this.client.RPGAssetsManager.getCharacter(
                this.client.playerDb.getLang(user.id), pnjChoice[0],
            );

            const wantsToGive = await this.choice(
                {
                    content: this.trad.wantsToGive.replace("%PNJ_NAME", pnjInfos.fullName)
                        + `\n\n> **${chosen.items.instance.name} x${chosen.items.amount}**`,
                },
                this.trad.give,
                this.trad.cancel,
            );
            if (wantsToGive === null) return this.end();

            if (wantsToGive === "primary") {
                this.client.questDb.giveItems(user.id, chosen.items);
                await this.client.questDb.setObjectiveManuallyCompleted(user.id, chosen.questKey, chosen.objectiveId);

                return await this.return(this.trad.giftDone);
            }
            else if (wantsToGive === "secondary") {
                return await this.return(this.trad.giftCanceled);
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
                            if ((res.resource.size + 1) * bag[resourceFocused].amount <= 200) {
                                bag[resourceFocused].amount++;
                                continue;
                            }
                        }
                        if (bag[resourceFocused].amount === 0) bag.splice(resourceFocused, 1);
                        resourceFocused++;
                    }
                }
            }

            this.client.mapDb.explore(user.id, map.region.id, map.area.id);
            if (bag.length > 0) {
                for (const item of bag) {
                    this.client.inventoryDb.addMaterial(user.id, item.resource.id, item.amount);
                }
                return await this.return(
                    this.trad.explored
                    + "\n\n" + bag.map(e => `> **${
                        this.client.RPGAssetsManager.getMaterial(
                            this.client.playerDb.getLang(user.id), e.resource.id,
                        ).name
                    } x${e.amount}**`).join("\n"),
                );
            }
            else {
                return await this.return(this.trad.noResourcesFound);
            }
        }
    }
}

module.exports = Interact;