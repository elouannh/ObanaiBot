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

    camelCase(string) {
        return string.replace(/(^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        }).replace(/\s+/g, "");
    }

    intRender(int, sep = " ") {
        return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    dateRender(date, full) {
        const data = {
            day: String(date.getDate()),
            month: String(date.getMonth() + 1),
            year: String(date.getFullYear()),
            hour: String(date.getHours()),
            min: String(date.getMinutes()),
            sec: String(date.getSeconds()),
        };

        if (data.day.length < 2) data.day = "0" + data.day;
        if (data.month.length < 2) data.month = "0" + data.month;
        if (data.hour.length < 2) data.hour = "0" + data.hour;
        if (data.min.length < 2) data.min = "0" + data.min;
        if (data.sec.length < 2) data.sec = "0" + data.sec;
        return `${data.day}/${data.month}/${data.year}` + (full ? ` ${data.hour}:${data.min}:${data.sec}` : "");
    }

    randomSquadNameGenerator() {}

    compareArrays(firstArray = [], secondArray = []) {
        const data = {
            added: [],
            removed: [],
            unchanged: [],
        };

        data.added = secondArray.filter(element => !firstArray.includes(element));
        data.removed = firstArray.filter(element => !secondArray.includes(element));
        data.unchanged = secondArray.filter(element => firstArray.includes(element));

        return data;
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