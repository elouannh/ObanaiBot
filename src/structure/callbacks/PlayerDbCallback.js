const UpdateQuest = require("./UpdateQuest");

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

                        if (!(await UpdateQuest(quests, qKey, dq, client, key, newValue, newAmount >= dq.objective.quantity))) {
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
                            const quests = qDatas[qKey].filter(q => q.id !== dq.id);
                            await UpdateQuest(quests, qKey, dq, client, key, newValue, dq.objective.stat === subKey);
                        }
                    }
                }
            }
        }

    }

    return PlayerDbCallBack;
};