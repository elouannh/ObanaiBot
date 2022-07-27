const names = require("./json/names.json");

module.exports = () => {
    let sentence = "";
    let quote = "";


    const genre = ["m", "f"][Math.floor(Math.random() * 2)];
    const singOrPl = ["s", "p"][Math.floor(Math.random() * 2)];
    const exp = names.words[genre][singOrPl];
    sentence = `Escouade ${exp.names.at(Math.floor(Math.random() * exp.names.length))}`;
    sentence += `${exp.adjectives.at(Math.floor(Math.random() * exp.adjectives.length))}`;

    quote = names.quotes[Math.floor(Math.random() * names.quotes.length)];

    return { sentence, quote };
};