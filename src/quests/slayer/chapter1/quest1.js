const SlayerQuest = require("../../bases/SlayerQuest");
const EarnXp = require("../../bases/objectives/EarnXp");

module.exports = step => {
    const q = [
        new SlayerQuest(
            "Test",
            "Mmh, bite !",
            new EarnXp(1),
            "chapter1/quest1:0",
            1,
            1,
            0,
        ),
        new SlayerQuest(
            "Test 2",
            "Mmh, arnaud !",
            new EarnXp(2),
            "chapter1/quest1:1",
            1,
            1,
            1,
        ),
        new SlayerQuest(
            "Test 3",
            "Mmh, e-girl !",
            new EarnXp(3),
            "chapter1/quest1:2",
            1,
            1,
            2,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};