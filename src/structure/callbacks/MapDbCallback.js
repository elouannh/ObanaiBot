const alertQuest = require("./AlertRequest");

module.exports = client => {

    function hasChangement(oldValue, newValue) {
        return (oldValue?.region !== newValue?.region) || (oldValue?.zone !== newValue?.zone);
    }

    async function MapDbCallback(key, oldValue, newValue) {
        const qDatas = await client.questDb.get(key);

        for (const qKey of ["daily", "slayer", "world"]) {
            for (const dq of qDatas[qKey]) {


                if (hasChangement(oldValue, newValue)) {
                    if (dq.objective.type === "voyage_to") {
                        const quests = qDatas[qKey].filter(q => q.id !== dq.id);

                        if (dq.objective.region === newValue.region && dq.objective.area === newValue.area) {
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

            }
        }
    }

    return MapDbCallback;
};