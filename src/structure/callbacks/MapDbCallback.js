const UpdateQuest = require("./UpdateQuest");

module.exports = client => {

    function hasChangement(oldValue, newValue) {
        return (oldValue?.region !== newValue?.region) || (oldValue?.area !== newValue?.area);
    }

    async function MapDbCallback(key, oldValue, newValue) {
        const qDatas = await client.questDb.get(key);

        for (const qKey of ["daily", "slayer", "world"]) {
            for (const dq of qDatas[qKey]) {
                if (hasChangement(oldValue, newValue)) {
                    if (dq.objective.type === "voyage_to") {
                        const quests = qDatas[qKey].filter(q => q.id !== dq.id);
                        await UpdateQuest(quests, qKey, dq, client, key, newValue, dq.objective.region === newValue.region && dq.objective.area === newValue.area);
                    }
                }

            }
        }
    }

    return MapDbCallback;
};