const Enmap = require("enmap");
const calcCrowLevel = require("../../elements/calcCrowLevel");

class ActivityDb {
    constructor(client) {
        this.client = client;
        this.db = new Enmap({ name: "activityDb" });
    }

    model(id) {
        const datas = {
            id: id,
            isTraining: false,
            isTravelling: false,
            isForging: [false, false, false],
            training: {
                start: 0,
                duration: 0,
                aptitude: null,
            },
            travelling: {
                start: 0,
                duration: 0,
                destination: null,
            },
            forging: [null, null, null],
        };

        return datas;
    }

    async ensure(id) {
        const p = this.model(id);
        this.db.ensure(id, p);

        return this.db.get(id);
    }

    async get(id) {
        this.ensure(id);

        return this.db.get(id);
    }

    async trains(id, aptitude, duration) {
        this.db.set(id, true, "isTraining");
        this.db.set(id, Date.now(), "training.start");
        this.db.set(id, duration, "training.duration");
        this.db.set(id, aptitude, "training.aptitude");
    }

    async endOfTrain(id) {
        const a = await this.get(id);

        this.db.set(id, false, "isTraining");
        this.db.set(id, 0, "training.start");
        this.db.set(id, 0, "training.duration");
        this.db.set(id, null, "training.aptitude");
        const lastLevel = await this.client.playerDb.db.get(id).stats[a.training.aptitude];
        this.client.playerDb.db.set(id, Math.floor(lastLevel + 1), `stats.${a.training.aptitude}`);
    }

    async travels(id, distance, destination) {
        this.db.set(id, true, "isTravelling");
        this.db.set(id, Date.now(), "travelling.start");
        this.db.set(id, distance, "travelling.duration");
        this.db.set(id, destination, "travelling.destination");
    }

    async endOfTrip(id) {
        const a = await this.get(id);

        this.db.set(id, false, "isTravelling");
        this.db.set(id, 0, "travelling.start");
        this.db.set(id, 0, "travelling.duration");
        this.db.set(id, null, "travelling.destination");
        this.client.mapDb.db.set(id, Number(a.travelling.destination.split("_")[0]), "region");
        this.client.mapDb.db.set(id, Number(a.travelling.destination.split("_")[1]), "area");
    }

    async travellingTime(id, time) {
        const p = await this.client.inventoryDb.get(id);
        let coeff = 1;

        const crow = p.kasugai_crow === null ? null : require(`../../elements/kasugai_crows/${p.kasugai_crow}.json`);
        const crowLevel = calcCrowLevel(p.kasugai_crow_exp);

        if (crow !== null) {
            if (crow.bonus.includes("travelling_time")) {
                const crowBoost = crowLevel.level * 5;
                coeff -= (crowBoost / 100);
            }
        }

        const grim = p.active_grimoire === null ? null : require(`../../elements/grimoires/${p.active_grimoire}.json`);
        if (grim !== null) {
            if (grim.benefits.includes("travelling_time")) {
                coeff -= (grim.boost - 1);
            }
        }

        time *= 3;
        time *= 100000;
        time *= Number(coeff.toFixed(2));

        time = Math.ceil(time);

        return Math.ceil(time);
    }

    async trainingTime(id, time) {
        const p = await this.client.inventoryDb.get(id);
        let coeff = 1;

        const crow = p.kasugai_crow === null ? null : require(`../../elements/kasugai_crows/${p.kasugai_crow}.json`);
        const crowLevel = calcCrowLevel(p.kasugai_crow_exp);

        if (crow !== null) {
            if (crow.bonus.includes("training_time")) {
                const crowBoost = crowLevel.level * 5;
                coeff -= (crowBoost / 100);
            }
        }

        const grim = p.active_grimoire === null ? null : require(`../../elements/grimoires/${p.active_grimoire}.json`);
        if (grim !== null) {
            if (grim.benefits.includes("training_time")) {
                coeff -= (grim.boost - 1);
            }
        }

        time *= 60;
        time *= 1000;
        time *= Number(coeff.toFixed(2));

        time = Math.ceil(time);

        return Math.ceil(time);
    }

    // scheme: { type: string, ...args }
    async forgeItem(id, item) {
        const p = await this.get(id);

        const index = p.isForging.indexOf(false);
        if (index < 0) return;
        /* eslint-disable prefer-const */
        let isForgingDatas = p.isForging;
        let forgingDatas = p.forging;

        isForgingDatas[index] = true;
        forgingDatas[index] = {
            start: Date.now(),
            duration: 7_200_000 * item.rarity,
            itemCat: item.type,
            itemRarity: item.rarity,
            itemName: item.datas.name,
            itemLabel: item.datas.weapon,
        };

        this.db.set(id, forgingDatas, "forging");
        this.db.set(id, isForgingDatas, "isForging");
    }
}

module.exports = { ActivityDb };