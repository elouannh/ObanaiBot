const alertQuest = require("./AlertRequest");

module.exports = async (quests, qKey, dq, client, key, newValue, condition) => {
    if (condition) {
        client.questDb.db.set(key, quests, qKey);
        await alertQuest(client, qKey, newValue, dq);

        return true;
    }
    return false;
};