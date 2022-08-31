const SlayerQuest = require("../../bases/SlayerQuest");
const VoyageTo = require("../../bases/objectives/VoyageTo");
const InspectArea = require("../../bases/superobjectives/InspectArea");
const CollectKItems = require("../../bases/objectives/CollectKItems");
const GiveKItems = require("../../bases/superobjectives/GiveKItems");
const Talk = require("../../bases/superobjectives/Talk");

module.exports = step => {
    const q = [
        new SlayerQuest(
            "Journée banale",
            "Les champs sont prêts à être récoltés ! Rendez-vous sur place afin de vous en occuper.",
            new VoyageTo(4, 2),
            "chapter1/quest1:0",
            1,
            1,
            0,
        ),
        new SlayerQuest(
            "Un inconnu (1)",
            "Pendant que vous vous occupiez de vos champs, vous vous rendez compte qu'un homme est allongé sur le sol,"
            +
            " dans la forêt non loin de là.",
            new VoyageTo(4, 3),
            "chapter1/quest1:1",
            1,
            1,
            1,
        ),
        new SlayerQuest(
            "Un inconnu (2)",
            "Vous voilà dans la forêt où le corps sans vie bougeait, inspectez les environs.",
            new InspectArea(
                "*Un homme torse nu, couvert de blessure dont le bras manque se trouve sur le sol. "
                +
                "Vous décidez de le prendre et de l'emmener à votre hutte.*",
                "pierre_body",
                "Corps d'un homme blessé",
                "questItems",
                1,
                4,
                3,
            ),
            "chapter1/quest1:2",
            1,
            1,
            2,
        ),
        new SlayerQuest(
            "Premiers soins ! (1)",
            "Ramenez l'homme blessé dans votre hutte, afin de le soigner.",
            new VoyageTo(4, 1),
            "chapter1/quest1:3",
            1,
            1,
            3,
        ),
        new SlayerQuest(
            "Premiers soins ! (2)",
            "Donnez l'homme blessé à Hime pour qu'elle puisse s'en occuper.",
            new GiveKItems(pnj2.name, pnj2.id, "pierre_body", "Corps d'un homme blessé", "questItems", 1, 4, 1),
            "chapter1/quest1:4",
            1,
            1,
            4,
        ),
        new SlayerQuest(
            "Routine",
            "Votre routine reprend. Vous devez désormais retourner aux champs et vous en occuper.",
            new CollectKItems(50, "seed", "Graine", "materials"),
            "chapter1/quest1:5",
            1,
            1,
            5,
        ),
        new SlayerQuest(
            "Explications",
            "Le jeune homme anciennement inconscient semble rétabli, "
            +
            "et vous avez une discussion à entretenir avec lui et Hime.",
            new Talk(pnj2.name, pnj2.id, texts["6"].join("\n\n"), 4, 1),
            "chapter1/quest1:6",
            1,
            1,
            6,
        ),
        new SlayerQuest(
            "Visite inopinée (1)",
            "Après les explications de Pierre, vous décidez de retourner "
            +
            "voir dans la forêt afin de voir si quelque chose cloche.",
            new VoyageTo(4, 3),
            "chapter1/quest1:7",
            1,
            1,
            7,
        ),
        new SlayerQuest(
            "Visite inopinée (2)",
            "Vous ne trouvez rien. Cependant, une odeur horrible émane de la hutte. "
            +
            "Vous ne savez plus où vous êtes, mais vous devez absolument y retourner !",
            new VoyageTo(4, 1),
            "chapter1/quest1:8",
            1,
            1,
            8,
        ),
        new SlayerQuest(
            "Destruction !!",
            "La hutte étant détruite, Hime disparue... "
            +
            "Tout ce qu'il vous reste à faire, c'est demander des explications à Pierre !",
            new Talk(pnj3.name, pnj3.id, texts["9"].join("\n\n"), 4, 1),
            "chapter1/quest1:9",
            1,
            1,
            9,
        ),
        new SlayerQuest(
            "Hime ? Où es-tu passée ?...",
            "Hime a disparu. Pierre est mort. "
            +
            "Il ne vous reste qu'une chose, partir à sa recherche. Trouvez d'abord des indices.",
            new InspectArea(
                "*Vous trouverez sur le sol un peu de sang et des cheveux blancs d'Hime. Vous les prenez avec vous.*",
                "hime_hair",
                "Cheveux d'Hime",
                "questItems",
                3,
                4,
                1,
            ),
            "chapter1/quest1:10",
            1,
            1,
            10,
        ),
    ];

    if (step === "SIZE") return q.length;

    return step < q.length ? q[Number(step)] : true;
};