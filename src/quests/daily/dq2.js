const DailyQuest = require("../bases/DailyQuest");
const TrainStat = require("../bases/objectives/TrainStat");

module.exports = step => {
    const q = [
        new DailyQuest(
            "De beaux muscles luisants",
            "1, 2, 3... 456, 457, 458 ! Quelle force incroyable vous avez dans les bras pour faire autant de pompes !",
            new TrainStat("strength", "Force"),
            "dq2:0",
            0,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};