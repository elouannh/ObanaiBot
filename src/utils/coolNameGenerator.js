module.exports = () => {

    let sentence = "";
    let quote = "";


    const genre = ["m", "f"][Math.floor(Math.random() * 2)];
    const singOrPl = ["s", "p"][Math.floor(Math.random() * 2)];
    const words = {
        "m": {
            "s": {
                "names": ["du Pourfendeur", "du Démon", "du Forgeron", "du Kimono", "du Corbeau"],
                "adjectives": ["Légendaire", "Infini", "Surpuissant", "Démoniaque"],
            },
            "p": {
                "names": ["des Pourfendeurs", "des Démons", "des Forgerons", "des Kimonos", "des Corbeaux"],
                "adjectives": ["Légendaires", "Infinis", "Surpuissants", "Démoniaques"],
            },
        },
        "f": {
            "s": {
                "names": ["de la Pourfendeuse", "de la Démone", "de la Forgeronne", "de l'Épée"],
                "adjectives": ["Légendaire", "Infinie", "Surpuissante", "Démoniaque"],
            },
            "p": {
                "names": ["des Pourfendeuses", "des Démones", "des Forgeronnes", "des Épées"],
                "adjectives": ["Légendaires", "Infinies", "Surpuissantes", "Démoniaques"],
            },
        },
    };
    const exp = words[genre][singOrPl];
    sentence = `Escouade ${exp.names.at(Math.floor(Math.random() * exp.names.length))} ${exp.adjectives.at(Math.floor(Math.random() * exp.adjectives.length))}`;


    const quotes = [
        "Ressentez la rage, La rage puissante et pure de ne pas pouvoir pardonner qui deviendra votre impulsion inébranlable pour agir.",
        "Les faibles n’ont ni droits ni choix. Leur seul destin est d’être écrasé sans relâche par les forts !",
        "Soyez reconnaissant pour le sang… Vous n’êtes pas autorisé à répandre ne serait-ce qu’une seule goutte sur le sol… car si vous le faites… votre torse et votre tête se sépareront douloureusement.",
        "Vous avez ouvert un chemin… pour atteindre des sommets plus élevés… et vous l’avez abandonné… Très faible.",
        "Tuer des humains est… impardonnable.",
        "Peu importe le nombre de personnes que vous pourriez perdre, vous n’avez pas d’autre choix que de continuer à vivre. Peu importe à quel point les coups sont dévastateurs.",
        "Ceux qui ont regretté leurs propres actions, Je ne les piétinerais jamais. Parce que les démons étaient autrefois humains aussi. Tout comme moi, ils étaient humains aussi.",
        "Je peux le faire, je sais que je peux le faire. Je suis le gars qui le fait, os cassés ou pas… Quoi qu’il en soit… Je peux le faire ! Je peux me battre !",
        "Les batailles frontales sont simples. Celui qui est le plus fort et le plus rapide gagne.",
        "Utilisez votre tête, pas seulement votre esprit. Pensez, pensez, pensez.",
        "N’abandonnez jamais. Même si c’est douloureux, même si c’est angoissant, n’essayez pas de prendre la solution de facilité.",
        "J’ai gagné la bataille mais j’ai perdu la guerre !",
        "Je suis une créature parfaite qui est infiniment proche de la perfection.",
        "Est-ce que mon teint vous paraît terrible ? Mon visage vous paraît-il pâle ? Ai-je l’air faible pour vous ? On dirait que je n’ai pas longtemps à vivre ? Est-ce que je suis proche de la mort ?",
        "Si vous ne pouvez faire qu’une seule chose, affûtez-la à la perfection. Affinez-la à l’extrême limite. ",
    ];

    quote = quotes[Math.floor(Math.random() * quotes.length)];

    return { sentence, quote };
};