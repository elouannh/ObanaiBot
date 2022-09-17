class Duration {
    constructor(ms, lang = "fr") {
        this.ms = ms;
        this.lang = lang in this.units ? lang : "en";
        this.stringFormat = "%w %d %h %m %s %ms";
    }

    get units() {
        return {
            "fr": {
                "y": ["an", "ans", "a", "a"],
                "mo": ["mois", "mois", "mo", "mo"],
                "w": ["semaine", "semaines", "sem", "sem"],
                "d": ["jour", "jours", "j", "j"],
                "h": ["heure", "heures", "h", "h"],
                "m": ["minute", "minutes", "min", "mins"],
                "s": ["seconde", "secondes", "s", "s"],
                "ms": ["milliseconde", "millisecondes", "ms", "ms"],
            },
            "en": {
                "y": ["year", "years", "y", "y"],
                "mo": ["month", "months", "mo", "mo"],
                "w": ["week", "weeks", "w", "w"],
                "d": ["day", "days", "d", "d"],
                "h": ["hour", "hours", "h", "h"],
                "m": ["minute", "minutes", "min", "mins"],
                "s": ["second", "seconds", "s", "s"],
                "ms": ["millisecond", "milliseconds", "ms", "ms"],
            },
            "durations": {
                "y": 31536000000,
                "mo": 2592000000,
                "w": 604800000,
                "d": 86400000,
                "h": 3600000,
                "m": 60000,
                "s": 1000,
                "ms": 1,
            },
            "max": {
                "y": 100,
                "mo": 12,
                "w": 52,
                "d": 365,
                "h": 24,
                "m": 60,
                "s": 60,
                "ms": 1000,
            },
        };
    }

    setFormat(...units) {
        if (units.length === 0) return;
        this.stringFormat = units.map(u => `%${u}`).join(" ");

        return this;
    }

    get format() {
        return this.stringFormat.split(" ").map(e => e.replace("%", ""));
    }

    convert(render = "short") {
        const datas = {};
        let ms = this.ms;
        for (let i = 0; i < this.format.length;) {
            const unit = this.format[i];
            const duration = this.units.durations[unit];
            const max = this.units.max[unit];
            if (datas[unit] === undefined) datas[unit] = 0;

            if (ms >= duration && datas[unit] !== max) {
                datas[unit]++;
                ms -= duration;
                continue;
            }
            else if (i === this.format.length - 1) {
                const lastUnit = this.format[this.format.length - 1];
                const lastDuration = this.units.durations[lastUnit];

                const amountToAdd = Math.floor(ms / lastDuration);
                datas[lastUnit] += amountToAdd;
                ms = Math.floor(ms - (amountToAdd * lastDuration));
            }

            i++;
        }

        if (render === "short") return this.format.map(e => `${datas[e]}${this.units[this.lang][e][Number(datas[e] > 1) + 2]}`).join(" ");
        if (render === "long") return this.format.map(e => `${datas[e]} ${this.units[this.lang][e][Number(datas[e] > 1)]}`).join(" ");
    }
}

module.exports = Duration;