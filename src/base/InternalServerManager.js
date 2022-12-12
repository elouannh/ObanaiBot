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
            let questData = this.client.questDb.get(player.id);
            if (questData.schemaInstance) {
                this.client.questDb.ensureInDeep(player.id);
                questData = this.client.questDb.get(player.id);
            }
            if (!questData.currentQuests.slayerQuest?.id) {
                const progress = this.client.questDb.getSlayerProgress(player.id);
                const quest = this.client.RPGAssetsManager.quests.slayerQuests[progress.next];

                if (!quest) continue;

                const [volume, arc, chapter, step] = quest.id.split(".").slice(1);
                this.client.questDb.setSlayerQuest(player.id, volume, arc, chapter, step);
            }
        }
    }

    async questGenerator() {
        setInterval(async () => {
            await this.slayerQuestGenerator();
        }, 6_000);

        const lastRefresh = (Date.now() - this.delays.dailyQuestGenerator);
        const timeLeft = (86_400_000 - lastRefresh);
        setTimeout(async () => {
            void null;

            setInterval(async () => {
                void null;
            }, 86_400_000);
        }, timeLeft);
    }
}

module.exports = InternalServerManager;