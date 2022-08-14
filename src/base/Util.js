function ensureObj(source, obj) {
    for (const key in source) {
        if (source instanceof Object) {
            const newValue = ensureObj(source[key], obj[key]);
            obj[key] = newValue;
        }
        else if (!(key in obj)) {
            obj[key] = source[key];
        }
    }

    return obj;
}

const Util = (client) => {
    return {
        intRender: function(int, sep) {
            let args = [];

            const length = String(int).length - 1;
            for (const k in String(int)) {
                args = [String(int)[length - k]].concat(args);
                if (args.filter(e => e !== sep).length % 3 === 0) args = [sep].concat(args);
            }

            if (args[0] === sep) args = args.slice(1);

            return args.join("");
        },
        delay: function(ms) {
            new Promise(res => setTimeout(res, ms));
        },
        dateRender: function(date, full) {
            const datas = {
                day: String(date.getDate()),
                month: String(date.getMonth() + 1),
                year: String(date.getFullYear()),
                hour: String(date.getHours()),
                min: String(date.getMinutes()),
                sec: String(date.getSeconds()),
            };

            if (datas.day.length < 2) datas.day = "0" + datas.day;
            if (datas.month.length < 2) datas.month = "0" + datas.month;
            if (datas.hour.length < 2) datas.hour = "0" + datas.hour;
            if (datas.min.length < 2) datas.min = "0" + datas.min;
            if (datas.sec.length < 2) datas.sec = "0" + datas.sec;
            return `${datas.day}/${datas.month}/${datas.year}` + (full ? ` ${datas.hour}:${datas.min}:${datas.sec}` : "");
        },
        coolNameGenerator: function() {
            const names = {
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
            let quote = "";

            const genre = ["m", "f"][Math.floor(Math.random() * 2)];
            const singOrPl = ["s", "p"][Math.floor(Math.random() * 2)];
            const exp = names.words[genre][singOrPl];
            let sentence = `Escouade ${exp.names.at(Math.floor(Math.random() * exp.names.length))}`;
            sentence += `${exp.adjectives.at(Math.floor(Math.random() * exp.adjectives.length))}`;

            quote = names.quotes[Math.floor(Math.random() * names.quotes.length)];

            return { sentence, quote };
        },
        convertDate: function(milisecs, short = false) {
            const datas = {
                secs: 0,
                mins: 0,
                hours: 0,
                days: 0,
                string: "",
            };

            while (milisecs > 999) {
                if (milisecs <= 60000) {
                    datas.secs += Math.ceil(milisecs / 1000);
                    milisecs = 0;
                }
                else if (milisecs >= 60000 && milisecs < 3600000) {
                    datas.mins++;
                    milisecs -= 60000;
                }
                else if (milisecs >= 3600000 && milisecs < 86400000) {
                    datas.hours++;
                    milisecs -= 3600000;
                }
                else if (milisecs >= 86400000) {
                    datas.days++;
                    milisecs -= 86400000;
                }
            }

            if (datas.secs === 60) {
                datas.mins++;
                datas.secs = 0;
            }
            if (datas.mins === 60) {
                datas.hours++;
                datas.mins = 0;
            }
            if (datas.hours === 24) {
                datas.days++;
                datas.hours = 0;
            }
            if (!short) {
                if (datas.days > 0) datas.string += `${datas.days} jours `;
                if (datas.hours > 0) datas.string += `${datas.hours} heures `;
                if (datas.mins > 0) datas.string += `${datas.mins} minutes `;
                if (datas.secs > 0) datas.string += `${datas.secs} secondes`;
            }
            else {
                if (datas.days > 0) datas.string += `${datas.days}j `;
                if (datas.hours > 0) datas.string += `${datas.hours}h `;
                if (datas.mins > 0) datas.string += `${datas.mins}m `;
                if (datas.secs > 0) datas.string += `${datas.secs}s`;
            }

            if (datas.string.length === 0) datas.string = "terminé(e)";

            return datas;
        },
        compareArrays: function(firstArray = [], secondArray = []) {
            const datas = {
                added: [],
                removed: [],
                unchanged: [],
            };

            datas.added = secondArray.filter(element => !firstArray.includes(element));
            datas.removed = firstArray.filter(element => !secondArray.includes(element));
            datas.unchanged = secondArray.filter(element => firstArray.includes(element));

            return datas;
        },
        blankField: { name: "\u200B", value: "\u200B" },
        // eslint-disable-next-line no-unused-vars
        eval: async function(code, that) {
            code = `(async () => {\n${code}})();`;
            const clean = text => {
                if (typeof text === "string") {
                    return text.replace(/`/g, "`" + String.fromCharCode(8203))
                        .replace(/@/g, "@" + String.fromCharCode(8203));
                }
                else {
                    return text;
                }
            };
            let response = `📥 **Input**\n\`\`\`js\n${clean(code)}\n\`\`\`\n📤 **Output**\n`;
            try {
                let evaled = await eval(code);
                if (typeof evaled !== "string") evaled = require("util").inspect(evaled);

                const cleanEvaled = clean(evaled);
                if (cleanEvaled === "undefined") {
                    response += "```cs\n# Voided processus```";
                }
                else {
                    response += `\`\`\`xl\n${cleanEvaled.substring(0, 2000 - response.length - 20)}\`\`\``;
                }
            }
            catch (err) {
                const cleanErr = clean(err.message);
                response += `\`\`\`xl\n${cleanErr.substring(0, 2000 - response.length - 20)}\`\`\``;
            }

            return response;
        },
        catcherror: function(error) {
            client.log("Catched error:", error.stack);
            client.log("................");
        },
        ensureObj,
    };
};

module.exports = Util;