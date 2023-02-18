const Command = require("../../base/Command");

class Interact extends Command {
    constructor() {
        super(
            {
                name: "interact",
                description: "Permet d’interagir avec l’environnement; peut déclencher un dialogue, un combat, fouiller le secteur...",
                descriptionLocalizations: {
                    "en-US": "Allows you to interact with the environment; can trigger a dialogue, a fight, explore the sector...",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Interact",
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
                cancelDefer: false,
            },
            {
                needToBeStatic: true,
                needToBeInRpg: true,
            },
        );
    }

    async run() {
        const exists = await this.hasAdventure();
        if (!exists) return;

        const map = await this.client.mapDb.load(this.user.id);
        const inventory = await this.client.inventoryDb.load(this.user.id);

        await this.client.additionalDb.showTutorial(
            this.user.id, "interact", "howItWorks", this.interaction,
        );

        const options = [
            {
                label: this.trad.optionDialogue,
                value: "dialogue",
                emoji: this.client.enums.Rpg.Interactions.Dialogue,
                description: this.trad.optionDialogueDesc,
            },
            {
                label: this.trad.optionInteract,
                value: "interact",
                emoji: this.client.enums.Rpg.Interactions.Interact,
                description: this.trad.optionInteractDesc,
            },
            {
                label: this.trad.optionGiveItems,
                value: "giveItems",
                emoji: this.client.enums.Rpg.Interactions.GiveItems,
                description: this.trad.optionGiveItemsDesc,
            },
        ];

        const sector = Object.values(map.excavated?.[map.district.id] || {})
            .filter(sect => sect[0].id === map.sector.id)?.at(0);
        const sectorExplored = sector || false;

        if (!sectorExplored) {
            options.push(
                {
                    label: this.trad.optionExcavate,
                    value: "excavate",
                    emoji: this.client.enums.Rpg.Interactions.Excavate,
                    description: this.trad.optionExcavateDesc,
                },
            );
        }

        const action = await this.menu(
            {
                content: (sectorExplored ? this.trad.alreadyExcavated : "")
                    + this.trad.possiblesChoices,
            },
            options,
        );
        if (action === null) return this.end();

        if (action[0] === "dialogue") {
            const pnjs = await this.client.questDb.getPNJs(this.user.id, "dialogue");

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

            const choices = await this.client.questDb.getDialoguesByPNJ(this.user.id, pnjChoice[0]);
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
            await this.client.questDb.setObjectiveManuallyCompleted(this.user.id, chosen.questKey, chosen.objectiveId);
            return this.end();
        }
        else if (action[0] === "interact") {
            const choices = await this.client.questDb.getInteractions(this.user.id);

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
            await this.client.questDb.setObjectiveManuallyCompleted(this.user.id, chosen.questKey, chosen.objectiveId);
            return await this.return(this.trad.interactionDone);
        }
        else if (action[0] === "giveItems") {
            const pnjs = await this.client.questDb.getPNJs(this.user.id, "giveItems");

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

            const choices = await this.client.questDb.getItemsToGive(this.user.id, pnjChoice[0]);
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

            if (userAmount < chosen.items.amount) {
                return await this.return(
                    this.trad.noItems
                    + `\n\n> **${chosen.items.instance.name} x${chosen.items.amount}**`,
                );
            }

            const pnjInfos = await this.client.RPGAssetsManager.getCharacter(
                this.client.playerDb.getLang(this.user.id), pnjChoice[0],
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
                this.client.questDb.giveItems(this.user.id, chosen.items);
                await this.client.questDb.setObjectiveManuallyCompleted(this.user.id, chosen.questKey, chosen.objectiveId);

                return await this.return(this.trad.giftDone);
            }
            else {
                return await this.return(this.trad.giftCanceled);
            }
        }
        else {
            let bag = [];
            const availableResources = Object.values(this.client.RPGAssetsManager.materials)
                .filter(e => e.biomes.includes(map.sector.biome.id));

            for (let i = 0; i < 2; i++) {
                if (i === 0) {
                    for (const resource of availableResources.sort(() => Math.random() - 0.5)) {
                        if (bag.reduce((a, b) => a.size + b.size, 0) >= 200) break;

                        const itemAmount = Math.floor(Math.random * 100) < resource.lootRate ? 1 : 0;
                        bag.push({ resource: resource, amount: itemAmount });
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
                        resourceFocused++;
                    }
                }
            }

            bag = bag.filter(e => e.amount > 0);

            this.client.mapDb.explore(this.user.id, map.district.id, map.sector.id);
            const totalAmount = bag.reduce((a, b) => a + b.amount * b.resource.size, 0);
            if (bag.length === 0 || totalAmount === 0) {
                return await this.return(this.trad.noResourcesFound);
            }
            else {
                for (const item of bag) {
                    this.client.inventoryDb.addMaterial(this.user.id, item.resource.id, item.amount);
                }
                const scale = Math.min(Math.floor(totalAmount / 50), 3);
                return await this.return(
                    this.trad.sentences[scale]
                    + "\n\n" + bag.map(e => `> **${
                        this.client.RPGAssetsManager.getMaterial(
                            this.client.playerDb.getLang(this.user.id), e.resource.id,
                        ).name
                    }** x${e.amount}`).join("\n")
                    + "\n\n"
                    + this.trad.explored,
                );
            }
        }
    }
}

module.exports = Interact;