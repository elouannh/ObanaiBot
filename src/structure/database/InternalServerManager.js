const Enmap = require("enmap");
const fs = require("fs");
const compareArrays = require("../../utils/compareArrays");
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
            owners: [],
            admins: [],
            testers: [],
        };

        return datas;
    }

    get datas() {
        this.db.ensure("internalServer", this.model());
        return this.db.get("internalServer");
    }

    get owners() {
        return this.datas.owners;
    }

    get admins() {
        return this.datas.admins;
    }

    get testers() {
        return this.datas.testers;
    }

    get staffs() {
        return this.owners.concat(this.admins).concat(this.testers);
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

        setInterval(async () => await refreshStoryQuest(this), 20_000);

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

    async staffUpdate() {
        setInterval(async () => {
			const testing = this.client.guilds.cache.get(this.client.config.testing);

			const olds = {
				owners: this.client.internalServerManager.owners,
				admins: this.client.internalServerManager.admins,
				testers: this.client.internalServerManager.testers,
			};
			const news = {
				owners: testing.roles.cache.get(this.client.config.roles.owners).members.filter(e => !e.user.bot).map(e => e.id),
				admins: testing.roles.cache.get(this.client.config.roles.admins).members.filter(e => !e.user.bot).map(e => e.id),
				testers: testing.roles.cache.get(this.client.config.roles.testers).members.filter(e => !e.user.bot).map(e => e.id),
			};

			const changedOwners = compareArrays(olds.owners, news.owners);
			const changedAdmins = compareArrays(olds.admins, news.admins);
			const changedTesters = compareArrays(olds.testers, news.testers);

			const fields = [];

			if (changedOwners.removed.length > 0 || changedOwners.added.length > 0) {
				fields.push(
					[
						"👑 __Owners update__",
						changedOwners.added.length > 0 ? `**(+) Added:** ${changedOwners.added.map(e => `\`${this.client.users.cache.get(e)?.username ?? "Owner lambda"}\``)}\n\n` : ""
						+
						changedOwners.removed.length > 0 ? `**(-) Removed:** ${changedOwners.removed.map(e => `\`${this.client.users.cache.get(e)?.username ?? "Owner lambda"}\``)}\n\n` : "",
						false,
					],
				);
			}
			if (changedAdmins.removed.length > 0 || changedAdmins.added.length > 0) {
				fields.push(
					[
						"🚧 __Admins update__",
						changedAdmins.added.length > 0 ? `**(+) Added:** ${changedAdmins.added.map(e => `\`${this.client.users.cache.get(e)?.username ?? "Admin lambda"}\``)}\n\n` : ""
						+
						changedAdmins.removed.length > 0 ? `**(-) Removed:** ${changedAdmins.removed.map(e => `\`${this.client.users.cache.get(e)?.username ?? "Admin lambda"}\``)}\n\n` : "",
						false,
					],
				);
			}
			if (changedTesters.removed.length > 0 || changedTesters.added.length > 0) {
				fields.push(
					[
						"🔨 __Testers update__",
						changedTesters.added.length > 0 ? `**(+) Added:** ${changedTesters.added.map(e => `\`${this.client.users.cache.get(e)?.username ?? "Tester lambda"}\``)}\n\n` : ""
						+
						changedTesters.removed.length > 0 ? `**(-) Removed:** ${changedTesters.removed.map(e => `\`${this.client.users.cache.get(e)?.username ?? "Tester lambda"}\``)}\n\n` : "",
						false,
					],
				);
			}

            this.db.set("internalServer", news.owners, "owners");
            this.db.set("internalServer", news.admins, "admins");
            this.db.set("internalServer", news.testers, "testers");

			if (fields.length > 0) {
                let str = "```diff\n";
                str += `${
                    olds.owners.length < news.owners.length ?
                        `+${news.owners.length - olds.owners.length} owners\n`
                        : (olds.owners.length > news.owners.length ? `-${olds.owners.length - news.owners.length} owners\n` : "")
                }`;
                str += `${
                    olds.admins.length < news.admins.length ?
                        `+${news.admins.length - olds.admins.length} admins\n`
                        : (olds.admins.length > news.admins.length ? `-${olds.admins.length - news.admins.length} admins\n` : "")
                }`;
                str += `${
                    olds.testers.length < news.testers.length ?
                        `+${news.testers.length - olds.testers.length} testers`
                        : (olds.testers.length > news.testers.length ? `-${olds.testers.length - news.testers.length} testers` : "")
                }`;
                str += "```";
                this.client.supportLog("Bot staff changes.", str, fields, "outline");
            }

		}, 5000);
    }
}

module.exports = { InternalServerManager };