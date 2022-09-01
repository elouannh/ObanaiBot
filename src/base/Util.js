class Util {
    constructor(client) {
        this.client = client;
    }

    callbackFunction(manager, key) {
        const map = manager.get(key).entries();
        const finalReq = [];
        for (const [entryKey, entryValue] of map) {
            finalReq.push([entryKey, entryValue]);
        }
        return finalReq.map(e => Object.assign({}, { name: e[0], ts: e[1] }));
    }

    ensureLang(source, obj, indicate) {
        for (const key in source) {
            if (source[key] instanceof Object && !(source instanceof String)) {
                if (key in obj) obj[key] = this.ensureLang(source[key], obj[key], indicate);
                else obj[key] = source[key];
            }
            else if (!(key in obj)) {
                if (indicate.value === "true" && !(obj[key].startsWith(indicate.addedString))) {
                    obj[key] = `${indicate.addedString} ${source[key]}`;
                }
                else {
                    obj[key] = source[key];
                }
            }
            else if (obj[key] === source[key]) {
                if (indicate.value === "true" && !(obj[key].startsWith(indicate.equalString))) {
                    obj[key] = `${indicate.equalString} ${obj[key]}`;
                }
            }
        }
        for (const key2 in obj) {
            if (!(key2 in source)) {
                if (indicate.value === "true" && !(obj[key2].startsWith(indicate.notInString))) {
                    obj[key2] = `${indicate.notInString} ${obj[key2]}`;
                }
            }
        }

        return obj;
    }

    ensureObj(source, obj) {
        for (const key in source) {
            if (source[key] instanceof Object && !(source instanceof String)) {
                if (key in obj) obj[key] = this.ensureObj(source[key], obj[key]);
                else obj[key] = source[key];
            }
            else if (!(key in obj)) {
                obj[key] = source[key];
            }
        }

        return obj;
    }

    positive(int) {
        return Math.sqrt(int * int);
    }

    round(int, digits = 0) {
        return Number(int.toFixed(digits));
    }

    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    intRender(int, sep = " ") {
        return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    dateRender(date, full) {
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
    }

    nameGenerator() {
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
    }

    convertDate(milisecs, short = false) {
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
    }

    compareArrays(firstArray = [], secondArray = []) {
        const datas = {
            added: [],
            removed: [],
            unchanged: [],
        };

        datas.added = secondArray.filter(element => !firstArray.includes(element));
        datas.removed = firstArray.filter(element => !secondArray.includes(element));
        datas.unchanged = secondArray.filter(element => firstArray.includes(element));

        return datas;
    }

    blankField() {
        return { name: "\u200B", value: "\u200B" };
    }

    catchError(error) {
        const time = this.dateRender(new Date(), true);
        console.log(`${time} || Catched error:`);
        console.log(error.stack);
        console.log(`${time} ||................`);
    }

    async evalCode(code) {
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
    }
}

module.exports = Util;