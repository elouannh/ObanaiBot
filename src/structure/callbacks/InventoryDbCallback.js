const UpdateQuest = require("./UpdateQuest");

module.exports = client => {

    async function InventoryDbCallback(key, oldValue, newValue) {
        const qDatas = await client.questDb.get(key);

        for (const qKey of ["daily", "slayer", "world"]) {
            for (const dq of qDatas[qKey]) {

                if ((oldValue?.yens ?? 0) < (newValue?.yens ?? 0)) {
                    if (dq.objective.type === "collect_k_yens") {
                        const hadBefore = dq.objective.got;
                        const toAdd = newValue.yens - oldValue.yens;
                        const newAmount = hadBefore + toAdd;
                        const quests = qDatas[qKey].filter(q => q.id !== dq.id);

                        if (!(await UpdateQuest(quests, qKey, dq, client, key, newValue, newAmount >= dq.objective.quantity))) {
                            const newQ = dq;
                            newQ.objective.got = newAmount;
                            quests.push(newQ);
                            client.questDb.db.set(key, quests, qKey);
                        }
                    }
                }

                if (oldValue?.active_grimoire === null && newValue?.active_grimoire !== null) {
                    if (dq.objective.type === "equip_grimoire") {
                        const quests = qDatas[qKey].filter(q => q.id !== dq.id);
                        await UpdateQuest(quests, qKey, dq, client, key, newValue, newValue.active_grimoire === dq.objective.grimoire);
                    }
                }


                if (oldValue?.kasugai_crow_exp < newValue?.kasugai_crow_exp) {
                    if (dq.objective.type === "feed_crow") {
                        const hadBefore = dq.objective.fed;
                        const toAdd = newValue.kasugai_crow_exp - oldValue.kasugai_crow_exp;
                        const newAmount = hadBefore + toAdd;
                        const quests = qDatas[qKey].filter(q => q.id !== dq.id);

                        if (!(await UpdateQuest(quests, qKey, dq, client, key, newValue, newAmount >= dq.objective.quantity))) {
                            const newQ = dq;
                            newQ.objective.got = newAmount;
                            quests.push(newQ);
                            client.questDb.db.set(key, quests, qKey);
                        }
                    }
                }

                if (dq.objective.type === "collect_k_items") {
                    const hadBefore = dq.objective.got;
                    const source = dq.objective.itemCategory;
                    const item = dq.objective.item;
                    const newv = source in newValue ? (item in newValue[source] ? newValue[source][item] : 0) : 0;
                    const oldv = source in oldValue ? (item in oldValue[source] ? oldValue[source][item] : 0) : 0;
                    const toAdd = newv - oldv;
                    if (toAdd <= 0) return;
                    const newAmount = hadBefore + toAdd;
                    const quests = qDatas[qKey].filter(q => q.id !== dq.id);

                    if (!(await UpdateQuest(quests, qKey, dq, client, key, newValue, newAmount >= dq.objective.quantity))) {
                        const newQ = dq;
                        newQ.objective.got = newAmount;
                        quests.push(newQ);
                        client.questDb.db.set(key, quests, qKey);
                    }
                }

            }
        }

        // BADGE DE FERMER

        const oldSeeds = "materials" in (oldValue ?? {}) ? ("seed" in oldValue.materials ? oldValue.materials.seed : 0) : 0;
        const newSeeds = "materials" in (newValue ?? {}) ? ("seed" in newValue.materials ? newValue.materials.seed : 0) : 0;

        if (oldSeeds < newSeeds) {
            await client.externalServerDb.checkBadges(oldValue.id, "farmer", newSeeds - oldSeeds);
        }
    }

    return InventoryDbCallback;
};