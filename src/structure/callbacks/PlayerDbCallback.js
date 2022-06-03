const alertQuest = require("./AlertRequest");

module.exports = client => {

    async function PlayerDbCallBack(key, oldValue, newValue) {
        const qDatas = await client.questDb.get(key);

        // xp changement
        for (const qKey of ["daily", "slayer", "world"]) {
            for (const dq of qDatas[qKey]) {

                if (oldValue?.exp < newValue?.exp) {
                    if (dq.objective.type === "earn_xp") {
                        const hadBefore = dq.objective.got;
                        const toAdd = newValue.exp - oldValue.exp;
                        const newAmount = hadBefore + toAdd;
                        const quests = qDatas[qKey].filter(q => q.id !== dq.id);
                        console.log(quests);

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


                for (const subKey in oldValue.stats) {
                    if (newValue?.stats[subKey] > oldValue.stats[subKey]) {
                        if (dq.objective.type === "train_stat") {
                            if (dq.objective.stat === subKey) {
                                const quests = qDatas[qKey].filter(q => q.id !== dq.id);
                                client.questDb.db.set(key, quests, qKey);
                                await alertQuest(client, qKey, newValue, dq);
                            }
                        }
                    }
                }
            }
        }

    }

    return PlayerDbCallBack;
};