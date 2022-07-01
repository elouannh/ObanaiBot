const SlayerQuest = require("../../bases/SlayerQuest");
const Talk = require("../../bases/superobjectives/Talk");

module.exports = step => {
    const q = [
        new SlayerQuest(
            "Test v2",
            "Mmh, bite !",
            new Talk("Test", "04", "Coucou j'aime la bite", 4, 0),
            "chapter1/quest3:0",
            1,
            3,
            0,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};