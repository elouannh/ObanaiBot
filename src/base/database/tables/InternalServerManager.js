const Enmap = require("enmap");
const fs = require("fs");
const { escapeMarkdown } = require("discord.js");
const dailyQuests = fs.readdirSync("./src/quests/daily").map(q => require(`../../../quests/daily/${q}`)(0));

class InternalServerManager {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "internalServer" });
        this.day = 86_400_000;

        this.readyOrNot = ["0", "0"];
        this.processing = [[false, false], [false, false]];

        this.launcher();
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
            owners: [this.client.config.owner],
            admins: [],
            testers: [],
            authServers: [],
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
        const staff = this.testers;
        for (const owner of this.owners) staff.push(owner);
        for (const admin of this.admins) staff.push(admin);
        return staff;
    }

    userRank(userId) {
        return {
            isTester: this.datas.testers.includes(userId),
            isAdmin: this.datas.admins.includes(userId),
            isOwner: this.datas.owners.includes(userId),
            allGrades: [
                this.datas.testers.includes(userId) ? "tester" : "",
                this.datas.admins.includes(userId) ? "admin" : "",
                this.datas.owners.includes(userId) ? "owner" : "",
            ],
            asMinimal: (ranks) => {
                const allRanks = [];
                for (const rank of ranks) {
                    if (rank === "owner") allRanks.push("tester", "admin", "owner");
                    if (rank === "admin") allRanks.push("tester", "admin");
                    if (rank === "tester") allRanks.push("tester");
                }

                return allRanks;
            },
        };
    }

    get servers() {
        return this.datas.authServers;
    }

    async launcher() {
        const order = (chap, que, ste) => {
            let number = 0;
            number += ste;
            number += (que * Math.pow(10, 4));
            number += (chap * Math.pow(10, 8));

            return number;
        };
        // PARTIE OU ON VA GENERER LES QUETES DE TOUT LE MONDE TOUS LES JOURS
        async function refreshStoryQuest(t) {
            t.processing[0][0] = true;
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
                            const quest = require(
                                `../../../quests/slayer/chapter${nextQuest.split("_")[0]}`
                                +
                                `/quest${nextQuest.split("_")[1]}.js`,
                            )(sameQuest === true ? player.storyProgress.step : 0);
                            if (quest !== true) t.client.questDb.db.push(player.id, quest, "slayer");
                        }
                        else {
                            const cs = [`${player.storyProgress.chapter}`, `${probablyTheSame.split("_")[0]}`];
                            const qs = [`${player.storyProgress.quest}`, `${probablyTheSame.split("_")[1]}`];
                            const sameQuest = (cs[0] === cs[1]) && (qs[0] === qs[1]);

                            if (sameQuest) {
                                const quest = require(
                                    `../../../quests/slayer/chapter${probablyTheSame.split("_")[0]}`
                                    +
                                    `/quest${probablyTheSame.split("_")[1]}.js`,
                                )(sameQuest === true ? player.storyProgress.step + 1 : 0);
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
                    const largerQuest = player.slayer
                                .sort((a, b) => order(b.chapter, b.quest, b.step) - order(a.chapter, a.quest, a.step));
                    t.client.questDb.db.set(player.id, largerQuest[0], "slayer");
                }
            }
            t.processing[0][0] = false;
        }

        setInterval(async () => await refreshStoryQuest(this), 120_000);

        const lastRefresh = this.datas.dailyQuests.lastRefresh;
        const timeSpent = Date.now() - lastRefresh;
        const startDelay = this.day - timeSpent;

        async function giveDailyQuest(t) {
            t.processing[0][1] = true;
            for (const player of t.client.playerDb.db.array()) {
                if (!t.datas.dailyQuests.cache.includes(player.id)) {
                    const randomQuests = dailyQuests
                                .sort(() => 0.5 - Math.random()).slice(0, (dailyQuests.length >= 2 ? 2 : 1));

                    await t.client.questDb.ensure(player.id);
                    await t.client.questDb.db.set(player.id, randomQuests, "daily");
                    await t.db.push("internalServer", player.id, "dailyQuests.cache");
                }
            }
            await t.db.set("internalServer", [], "dailyQuests.cache");
            await t.db.set("internalServer", Date.now(), "dailyQuests.lastRefresh");
            await t.client.util.delay(20_000);
            t.processing[0][0] = false;
        }

        setTimeout(async () => {
            await giveDailyQuest(this);
            setInterval(async () => {
                await giveDailyQuest(this);
            }, 86_400_000);
        }, startDelay);

        this.readyOrNot[0] = "1";
        setTimeout(() => this.readyOrNot[0] = "2", [120_000, startDelay].sort((b, a) => b - a)[0]);
    }

    async sync_p2p() {
        setInterval(async () => {
            this.processing[1][0] = true;
			const testing = this.client.guilds.cache.get(this.client.config.testing);

			const olds = {
				owners: this.client.internalServerManager.owners,
				admins: this.client.internalServerManager.admins,
				testers: this.client.internalServerManager.testers,
			};
			const news = {
				owners: testing.roles.cache.get(this.client.config.roles.owners).members
                                           .filter(e => !e.user.bot).map(e => e.id),
				admins: testing.roles.cache.get(this.client.config.roles.admins).members
                                           .filter(e => !e.user.bot).map(e => e.id),
				testers: testing.roles.cache.get(this.client.config.roles.testers).members
                                            .filter(e => !e.user.bot).map(e => e.id),
			};

			const changedOwners = this.client.util.compareArrays(olds.owners, news.owners);
			const changedAdmins = this.client.util.compareArrays(olds.admins, news.admins);
			const changedTesters = this.client.util.compareArrays(olds.testers, news.testers);

			const fields = [];

			if (changedOwners.removed.length > 0 || changedOwners.added.length > 0) {
				fields.push(
					[
						"👑 __Owners update__",
						changedOwners.added.length > 0 ? `**(+) Added:** ${
                            changedOwners.added.map(e => `\`${
                                this.client.users.fetch(e)?.username ?? "Owner lambda"
                            }\``)
                        }\n\n` : ""
						+
						changedOwners.removed.length > 0 ? `**(-) Removed:** ${
                            changedOwners.removed.map(e => `\`${
                                this.client.users.fetch(e)?.username ?? "Owner lambda"
                            }\``)
                        }\n\n` : "",
						false,
					],
				);
			}
			if (changedAdmins.removed.length > 0 || changedAdmins.added.length > 0) {
				fields.push(
					[
						"🚧 __Admins update__",
						changedAdmins.added.length > 0 ? `**(+) Added:** ${
                            changedAdmins.added.map(e => `\`${
                                this.client.users.fetch(e)?.username ?? "Admin lambda"
                            }\``)
                        }\n\n` : ""
						+
						changedAdmins.removed.length > 0 ? `**(-) Removed:** ${
                            changedAdmins.removed.map(e => `\`${
                                this.client.users.fetch(e)?.username ?? "Admin lambda"
                            }\``)
                        }\n\n` : "",
						false,
					],
				);
			}
			if (changedTesters.removed.length > 0 || changedTesters.added.length > 0) {
				fields.push(
					[
						"🔨 __Testers update__",
						changedTesters.added.length > 0 ? `**(+) Added:** ${
                            changedTesters.added.map(e => `\`${
                                this.client.users.fetch(e)?.username ?? "Tester lambda"
                            }\``)
                        }\n\n` : ""
						+
						changedTesters.removed.length > 0 ? `**(-) Removed:** ${
                            changedTesters.removed.map(e => `\`${
                                this.client.users.fetch(e)?.username ?? "Tester lambda"
                            }\``)
                        }\n\n` : "",
						false,
					],
				);
			}

            this.db.set("internalServer", changedOwners.unchanged.concat(changedOwners.added), "owners");
            this.db.set("internalServer", changedAdmins.unchanged.concat(changedAdmins.added), "admins");
            this.db.set("internalServer", changedTesters.unchanged.concat(changedTesters.added), "testers");

			if (fields.length > 0) {
                let str = "```diff\n";
                str += `${
                    olds.owners.length < news.owners.length ?
                        `+${news.owners.length - olds.owners.length} owners\n`
                        : (
                            olds.owners.length > news.owners.length ?
                            `-${olds.owners.length - news.owners.length} owners\n`
                            : ""
                        )
                }`;
                str += `${
                    olds.admins.length < news.admins.length ?
                        `+${news.admins.length - olds.admins.length} admins\n`
                        : (
                            olds.admins.length > news.admins.length ?
                            `-${olds.admins.length - news.admins.length} admins\n`
                            : ""
                        )
                }`;
                str += `${
                    olds.testers.length < news.testers.length ?
                        `+${news.testers.length - olds.testers.length} testers`
                        : (
                            olds.testers.length > news.testers.length ?
                            `-${olds.testers.length - news.testers.length} testers`
                            : ""
                        )
                }`;
                str += "```";
                // this.client.supportLog("Bot staff changes.", str, fields, "outline");
            }
            await this.client.util.delay(20_000);
            this.processing[1][0] = false;

		}, 25_000);

        setInterval(async () => {
            this.processing[1][1] = true;
			const server = this.client.guilds.cache.get(this.client.config.support);

            // VIP PART
            const bddv = this.client.externalServerDb.db.array()
                                                        .filter(e => e.grades.includes("vip")).map(e => e.id);
            const supportv = server.roles.cache.get(this.client.config.roles.vip).members
                                               .filter(e => !e.user.bot)
                                               .map(e => e.id);

            const datasv = {
                add: bddv.filter(user => !supportv.includes(user)),
                remove: supportv.filter(user => !bddv.includes(user)),
            };

            for (const toAdd of datasv.add) {
                await this.client.externalServerDb.addVip(toAdd, "support");
            }

            for (const toRemove of datasv.remove) {
                await this.client.externalServerDb.removeVip(toRemove, "support");
            }

            // VIP(+) PART
            const bddvp = this.client.externalServerDb.db.array()
                                                         .filter(e => e.grades.includes("vip+"))
                                                         .map(e => e.id);
            const supportvp = server.roles.cache.get(this.client.config.roles["vip+"]).members
                                                .filter(e => !e.user.bot)
                                                .map(e => e.id);

            const datasvp = {
                add: bddvp.filter(user => !supportvp.includes(user)),
                remove: supportvp.filter(user => !bddvp.includes(user)),
            };

            for (const toAdd of datasvp.add) {
                await this.client.externalServerDb.addVipplus(toAdd, "support");
            }

            for (const toRemove of datasvp.remove) {
                await this.client.externalServerDb.removeVipplus(toRemove, "support");
            }

            await this.client.util.delay(20_000);
            this.processing[1][1] = false;
		}, 120_000);

        this.readyOrNot[1] = "1";
        setTimeout(() => this.readyOrNot[1] = "2", 120_000);
    }

    percentPrettier(percent) {
        const identifiers = {
            "0": "🟣 <10%",
            "10": "🔵 <25%",
            "25": "🟢 <50%",
            "50": "🟡 <60%",
            "60": "🟠 <80%",
            "80": "🔴 >80%",
        };

        return Object.entries(identifiers).filter(e => percent >= Number(e[0])).at(-1)[1];
    }

    statusString(status) {
        const identifiers = {
            "online": "🟢",
            "disabled": "🔴",
            "maintenance": "🟡",
        };

        return identifiers[status];
    }

    pingString(amount) {
        const identifiers = {
            "0": "⚪",
            "50": "🟣",
            "100": "🔵",
            "150": "🟢",
            "200": "🟡",
            "400": "🟠",
            "600": "🔴",
        };

        return Object.entries(identifiers).filter(e => amount >= Number(e[0])).at(-1)[1] + ` ${amount} ms`;
    }

    async status(timestamp) {
        const status = ["🔴", "🟡", "🟢"];
        const memoryUsage = process.memoryUsage().heapTotal / 1024 / 1024;
        const ramPercent = Math.ceil(memoryUsage * 100 / (4.00 * 1024));
        const requests = this.client.requestsManager.totalSize;

        const datas = {
            "clientStatus": this.statusString(this.client.statusDb.datas.mode),
            "apiPing": this.pingString(this.client.ws.ping),
            "serverPing": this.pingString(this.client.util.positive(Date.now() - timestamp)),
            "memoryUsage": [
                `${((memoryUsage).toFixed(4))} MB`,
                `${this.client.util.intRender((4.00 * 1024).toFixed(0), " ")} MB`,
            ],
            "memoryPercent": `${ramPercent}%`,
            "requests": [requests, this.client.maxRequests],
            "requestsPercent": `${this.percentPrettier(requests * 100 / this.client.maxRequests)}`,
            "uptime": this.client.util.convertDate(process.uptime() * 1000, true).string,
            "server1": {
                processus: `${this.processing[0].filter(e => e === true).length * 100 / this.processing[0].length}%`,
                status: status[Number(this.readyOrNot[0])],
            },
            "server2": {
                processus: `${this.processing[1].filter(e => e === true).length * 100 / this.processing[1].length}%`,
                status: status[Number(this.readyOrNot[1])],
            },
        };

        return datas;
    }

    async guilds() {
        const authServers = this.datas.authServers;

        const datas = {
            "list": this.datas.authServers,
            "cached": authServers.map(g => `\`${escapeMarkdown(this.client.guilds.cache.get(g)?.name ?? g)}\``),
        };

        return datas;
    }
}

module.exports = InternalServerManager;