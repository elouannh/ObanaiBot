module.exports = () => {
    const names = [
        "Pamplemousse", "Clavier", "Tapis", "Stylo", "Tube de colle", "Casque", "Gâteau", "Chausson", "Sac", "Pigeon",
    ];
    const adjectives = [
        "Superbe", "Magnifique", "Incroyable", "Romantique", "Beau", "Violent",
    ];

    return `Escouade du ${names.at(Math.floor(Math.random() * names.length))} ${adjectives.at(Math.floor(Math.random() * adjectives.length))}`;
};