const Enmap = require("enmap");
const fs = require("fs");
const dailyQuests = fs.readdirSync("./src/quests/daily").map(q => require(`../../quests/daily/${q}`)(0));

class InternalServerManager {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "internalServer" });
        this.day = 1000;
        this.day = 86_400_000;

        this.launch();
    }

    model() {
        const datas = {
            dailyQuests: {
                lastRefresh: Date.now() - this.day,
                cache: [],
            },
            slayerQuests: {
                caches: {
                    "1": [],
                    "2": [],
                },
            },
        };

        return datas;
    }

    get datas() {
        this.db.ensure("internalServer", this.model());
        return this.db.get("internalServer");
    }

    async launch() {
        const order = (chap, que, ste) => {
            let number = 0;
            number += ste;
            number += (que * Math.pow(10, 4));
            number += (chap * Math.pow(10, 8));

            return number;
        };
        // PARTIE OU ON VA GENERER LES QUETES DE TOUT LE MONDE TOUS LES JOURS
        async function refreshStoryQuest(t) {
            const questSuit = [];
            for (const folder of fs.readdirSync("./src/quests/slayer/")) {
                for (const file of fs.readdirSync(`./src/quests/slayer/${folder}/`).map(e => e.replace(".js", ""))) {
                    questSuit.push(`${folder.replace("chapter", "")}_${file.replace("quest", "")}`);
                }
            }

            for (const p of t.client.playerDb.db.array()) {
                let player = await t.client.questDb.get(p.id);


                if (player.slayer.length === 0) {
                    if (player.storyProgress.chapter === 0) {
                        const quest = require("../../quests/slayer/chapter1/quest1.js")(0);
                        t.client.questDb.db.push(player.id, quest, "slayer");
                        t.client.questDb.db.set(player.id, 1, "storyProgress.chapter");
                        player = await t.client.questDb.get(p.id);
                    }

                    if (
                        !t.datas.slayerQuests.caches["1"].includes(player.id)
                        &&
                        !t.datas.slayerQuests.caches["2"].includes(player.id)
                    ) {
                        await t.db.push("internalServer", player.id, "slayerQuests.caches.1");
                    }

                    else if (
                        t.datas.slayerQuests.caches["1"].includes(player.id)
                        &&
                        !t.datas.slayerQuests.caches["2"].includes(player.id)
                    ) {
                        await t.db.push("internalServer", player.id, "slayerQuests.caches.2");
                        await t.db.remove("internalServer", player.id, "slayerQuests.caches.1");
                    }

                    else if (
                        t.datas.slayerQuests.caches["2"].includes(player.id)
                    ) {
                        await t.db.remove("internalServer", player.id, "slayerQuests.caches.2");
                        const advancement = `${player.storyProgress.chapter}_${player.storyProgress.quest}`;
                        const nextQuest = questSuit[questSuit.indexOf(advancement) + 1];
                        const probablyTheSame = questSuit[questSuit.indexOf(advancement)];

                        if (nextQuest !== undefined) {
                            const cs = [`${player.storyProgress.chapter}`, `${nextQuest.split("_")[0]}`];
                            const qs = [`${player.storyProgress.quest}`, `${nextQuest.split("_")[1]}`];
                            const sameQuest = (cs[0] === cs[1]) && (qs[0] === qs[1]);
                            const quest = require(`../../quests/slayer/chapter${nextQuest.split("_")[0]}/quest${nextQuest.split("_")[1]}.js`)(sameQuest === true ? player.storyProgress.step : 0);
                            if (quest !== true) t.client.questDb.db.push(player.id, quest, "slayer");
                        }
                        else {
                            const cs = [`${player.storyProgress.chapter}`, `${probablyTheSame.split("_")[0]}`];
                            const qs = [`${player.storyProgress.quest}`, `${probablyTheSame.split("_")[1]}`];
                            const sameQuest = (cs[0] === cs[1]) && (qs[0] === qs[1]);

                            if (sameQuest) {
                                const quest = require(`../../quests/slayer/chapter${probablyTheSame.split("_")[0]}/quest${probablyTheSame.split("_")[1]}.js`)(sameQuest === true ? player.storyProgress.step + 1 : 0);
                                if (quest !== true) t.client.questDb.db.push(player.id, quest, "slayer");
                            }
                        }
                    }
                }
                else if (
                    t.datas.slayerQuests.caches["1"].includes(player.id)
                ) {
                    await t.db.remove("internalServer", player.id, "slayerQuests.caches.1");
                }
                else if (
                    t.datas.slayerQuests.caches["2"].includes(player.id)
                ) {
                    await t.db.remove("internalServer", player.id, "slayerQuests.caches.2");
                }

                if (player.slayer.length > 1) {
                    const largerQuest = player.slayer.sort((a, b) => order(b.chapter, b.quest, b.step) - order(a.chapter, a.quest, a.step));
                    t.client.questDb.db.set(player.id, largerQuest[0], "slayer");
                }
            }
        }

        setInterval(async () => await refreshStoryQuest(this), 300_000);

        const lastRefresh = this.datas.dailyQuests.lastRefresh;
        const timeSpent = Date.now() - lastRefresh;
        const startDelay = this.day - timeSpent;

        async function giveDailyQuest(t) {
            for (const player of t.client.playerDb.db.array()) {
                if (!t.datas.dailyQuests.cache.includes(player.id)) {
                    const randomQuests = dailyQuests.sort(() => 0.5 - Math.random()).slice(0, (dailyQuests.length >= 2 ? 2 : 1));

                    await t.client.questDb.get(player.id);
                    await t.client.questDb.db.set(player.id, randomQuests, "daily");
                    await t.db.push("internalServer", player.id, "dailyQuests.cache");
                }
            }
            await t.db.set("internalServer", [], "dailyQuests.cache");
            await t.db.set("internalServer", Date.now(), "dailyQuests.lastRefresh");
        }

        setTimeout(async () => {
            await giveDailyQuest(this);
            setInterval(async () => await giveDailyQuest(this), 86_400_000);
        }, startDelay);
    }
}

module.exports = { InternalServerManager };