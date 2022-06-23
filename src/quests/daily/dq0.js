const DailyQuest = require("../bases/DailyQuest");
const EarnXp = require("../bases/objectives/EarnXp");
const CollectKItems = require("../bases/objectives/CollectKItems");
const GiveKItems = require("../bases/superobjectives/GiveKItems");

module.exports = step => {
    const q = [
        new DailyQuest(
            "Que vous progressez vite ! (Part. 1)",
            "Mmh, bite !",
            new GiveKItems("ゼロツー (Zero Two)", "0", "seed", "Graine", "materials", 10, 0, 0),
            "dq0:0",
            0,
        ),
        new DailyQuest(
            "Que vous progressez vite ! (Part. 2)",
            "Vous progressez rapidement, prouvez désormais au monde entier que vous êtes un vaillant combattant !",
            new EarnXp(500),
            "dq0:1",
            1,
        ),
        new DailyQuest(
            "Que vous progressez vite ! (Part. 3)",
            "Vous trichez ?? Non sérieusement, vérifions que vous êtes vraiment quelqu'un de balèze...",
            new CollectKItems(20, "seed", "Graine", "materials"),
            "dq0:2",
            2,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};