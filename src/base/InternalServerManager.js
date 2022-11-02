const SQLiteTable = require("./SQLiteTable");

function schema() {
    return {
        staff: {
            owners: [],
            administrators: [],
            moderators: [],
        },
        guilds: {
            allowed: [],
        },
        status: {
            latency: 0,
            mode: "0b0000",
        },
        delays: {
            dailyQuestGenerator: 0,
        },
    };
}

class InternalServerManager extends SQLiteTable {
    constructor(client) {
        super(client, "internalServer", schema);
    }

    get main() {
        this.ensureInDeep("main");
        return this.get("main");
    }

    get delays() {
        return this.main.delays;
    }

    get owners() {
        return this.main.staff.owners;
    }

    addOwner(id) {
        if (!this.main.staff.owners.includes(id)) this.db.push("main", id, "staff.owners");
    }

    get administrators() {
        return this.main.staff.administrators;
    }

    get moderators() {
        return this.main.staff.moderators;
    }

    get staff() {
        const staff = {};
        for (const owner of this.owners) {
            if (!(staff instanceof Array)) staff[owner] = [];
            staff[owner].push("owner");
        }
        for (const admin of this.administrators) {
            if (!(staff instanceof Array)) staff[admin] = [];
            staff[admin].push("administrator");
        }
        for (const moderator of this.moderators) {
            if (!(staff instanceof Array)) staff[moderator] = [];
            staff[moderator].push("moderator");
        }
        return Object.entries(staff);
    }

    get allowedGuilds() {
        return this.main.guilds.allowed;
    }

    get latency() {
        return this.main.status.latency;
    }

    get statusMode() {
        return this.main.status.mode;
    }

    userBitField(userId) {
        let bitfield = "0b";
        for (const grade of ["owners", "administrators", "moderators"]) {
            if (this[grade].includes(userId)) bitfield += "1";
            else bitfield += "0";
        }
        return bitfield;
    }

    async slayerQuestGenerator() {
        const players = this.client.playerDb.db.array();

        for (const player of players) {
            this.client.questDb.ensureInDeep(player.id);
            const questData = await this.client.questDb.load(player.id);

            if (questData.currentQuests.slayerAmount === 0) {
                const userQuest = questData.storyProgression;
                this.client.questDb.setSlayerQuest(player.id, userQuest.tome, userQuest.arc, userQuest.quest);
            }
        }
    }

    async dailyQuestGenerator() {
        const players = this.client.playerDb.db.array();

        for (const player of players) {
            this.client.questDb.ensureInDeep(player.id);
            const questData = await this.client.questDb.load(player.id);

            if (questData.currentQuests.dailyAmount === 0) {
                const quests = Object.keys(this.client.RPGAssetsManager.quests.dailyQuests)
                    .sort(() => Math.random() - 0.5)
                    .slice(0, 2);

                for (let i = 0; i < 2; i++) this.client.questDb.setDailyQuest(player.id, quests[i], `${i}`);
            }
        }
    }

    async questGenerator() {
        setInterval(async () => {
            await this.slayerQuestGenerator();
        }, 600_000);

        const lastRefresh = (Date.now() - this.delays.dailyQuestGenerator);
        const timeLeft = (86_400_000 - lastRefresh);
        setTimeout(async () => {
            await this.dailyQuestGenerator();

            setInterval(async () => {
                await this.dailyQuestGenerator();
            }, 86_400_000);
        }, timeLeft);
    }
}

module.exports = InternalServerManager;