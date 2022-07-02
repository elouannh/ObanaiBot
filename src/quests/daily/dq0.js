const DailyQuest = require("../bases/DailyQuest");
const EarnXp = require("../bases/objectives/EarnXp");

module.exports = step => {
    const q = [
        new DailyQuest(
            "Un aventurier surpuissant",
            "Vous êtes fort, pas vrai ? Alors montrez moi ça !",
            new EarnXp(200),
            "dq0:0",
            0,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};