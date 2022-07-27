const DailyQuest = require("../bases/DailyQuest");
const CollectKItems = require("../bases/objectives/CollectKItems");

module.exports = step => {
    const q = [
        new DailyQuest(
            "Vous aimez le jardinage ?",
            "J'ai entendu dire que vous aviez développé une passion pour le jardinage. Montrez-moi ça !",
            new CollectKItems(50, "seed", "Graine", "materials"),
            "dq1:0",
            0,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};