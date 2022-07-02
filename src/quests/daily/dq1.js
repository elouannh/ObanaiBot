const DailyQuest = require("../bases/DailyQuest");
const VoyageTo = require("../bases/objectives/VoyageTo");

module.exports = step => {
    const q = [
        new DailyQuest(
            "Que vous progressez vite ! (Part. 2)",
            "Mmh, bite !",
            new VoyageTo(0, 0, "test"),
            "dq1:0",
            0,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};