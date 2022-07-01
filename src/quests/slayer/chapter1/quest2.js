const SlayerQuest = require("../../bases/SlayerQuest");
const EarnXp = require("../../bases/objectives/EarnXp");

module.exports = step => {
    const q = [
        new SlayerQuest(
            "Test v2",
            "Mmh, bite !",
            new EarnXp(1),
            "chapter1/quest2:0",
            1,
            2,
            0,
        ),
        new SlayerQuest(
            "Test v2 2",
            "Mmh, arnaud !",
            new EarnXp(2),
            "chapter1/quest2:1",
            1,
            2,
            1,
        ),
        new SlayerQuest(
            "Test v2 3",
            "Mmh, e-girl !",
            new EarnXp(3),
            "chapter1/quest2:2",
            1,
            2,
            2,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};