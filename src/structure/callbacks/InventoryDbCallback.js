const alertQuest = require("./AlertRequest");

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

                        if (newAmount >= dq.objective.quantity) {
                            client.questDb.db.set(key, quests, qKey);
                            await alertQuest(client, qKey, newValue, dq);
                        }
                        else {
                            const newQ = dq;
                            newQ.objective.got = newAmount;
                            quests.push(newQ);
                            client.questDb.db.set(key, quests, qKey);
                        }
                    }
                }

                if (Object.keys(newValue?.materials ?? {}) < Object.keys(oldValue?.materials ?? {})) {
                    if (dq.objective.type === "collect_k_items") {
                        const hadBefore = dq.objective.got;
                        const toAdd = newValue[dq.objective.itemCategory][dq.objective.item] - oldValue[dq.objective.itemCategory][dq.objective.item];
                        const newAmount = hadBefore + toAdd;
                        const quests = qDatas[qKey].filter(q => q.id !== dq.id);

                        if (newAmount >= dq.objective.quantity) {
                            client.questDb.db.set(key, quests, qKey);
                            await alertQuest(client, qKey, newValue, dq);
                        }
                        else {
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

                        if (newValue.active_grimoire === dq.objective.grimoire) {
                            client.questDb.db.set(key, quests, qKey);
                            await alertQuest(client, qKey, newValue, dq);
                        }
                        else {
                            const newQ = dq;
                            quests.push(newQ);
                            client.questDb.db.set(key, quests, qKey);
                        }
                    }
                }


                if (oldValue?.kasugai_crow_exp < newValue?.kasugai_crow_exp) {
                    if (dq.objective.type === "feed_crow") {
                        const hadBefore = dq.objective.fed;
                        const toAdd = newValue.kasugai_crow_exp - oldValue.kasugai_crow_exp;
                        const newAmount = hadBefore + toAdd;
                        const quests = qDatas[qKey].filter(q => q.id !== dq.id);

                        if (newAmount >= dq.objective.quantity) {
                            client.questDb.db.set(key, quests, qKey);
                            await alertQuest(client, qKey, newValue, dq);
                        }
                        else {
                            const newQ = dq;
                            newQ.objective.got = newAmount;
                            quests.push(newQ);
                            client.questDb.db.set(key, quests, qKey);
                        }
                    }
                }


            }
        }
    }

    return InventoryDbCallback;
};