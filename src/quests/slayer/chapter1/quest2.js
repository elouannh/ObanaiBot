const SlayerQuest = require("../../bases/SlayerQuest");
const VoyageTo = require("../../bases/objectives/VoyageTo");
const Talk = require("../../bases/superobjectives/Talk");
const pnj4 = require("../../../elements/pnjs/pnj4.json");
const texts = require("../../../elements/texts/c1_q2.json");

module.exports = step => {
    const q = [
        new SlayerQuest(
            "Fuite urbaine",
            "Quittez la maison familiale et partez en direction de la ville.",
            new VoyageTo(9, 2),
            "chapter1/quest2:0",
            1,
            2,
            0,
        ),
        new SlayerQuest(
            "Qui sont ces gens ?",
            "Vous voilà dans le bar, mais la situation semble étrange. Espionnez la conversation des deux individus.",
            new Talk(pnj4.name, pnj4.id, texts["1"].join("\n\n"), 9, 2),
            "chapter1/quest2:1",
            1,
            2,
            1,
        ),
        new SlayerQuest(
            "Évitez le combat !",
            "Quittez immédiatement la taverne et rejoignez la ruelle principale.",
            new VoyageTo(9, 0),
            "chapter1/quest2:2",
            1,
            2,
            2,
        ),
    ];

    return step < q.length ? q[Number(step)] : true;
};