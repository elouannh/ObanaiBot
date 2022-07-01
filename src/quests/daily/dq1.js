const DailyQuest = require("../bases/DailyQuest");
const InspectZone = require("../bases/superobjectives/InspectZone");

module.exports = step => {
    const q = [
        new DailyQuest(
            "Que vous progressez vite ! (Part. 2)",
            "Mmh, bite !",
            new InspectZone("gugus", "4", "skullHead", "Grimoire", "questItems", 1, 4, 0),
            "dq1:0",
            0,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};