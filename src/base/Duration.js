class Duration {
    constructor(ms, lang) {
        this.ms = ms;
        this.units = lang;
        this.stringFormat = "%w %d %h %m %s %ms";
    }

    get times() {
        return {
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

    convert(render = "short", ignoreZero = false) {
        const data = {};
        let ms = this.ms;
        for (let i = 0; i < this.format.length;) {
            const unit = this.format[i];
            const duration = this.times.durations[unit];
            const max = this.times.max[unit];
            if (data[unit] === undefined) data[unit] = 0;

            if (ms >= duration && data[unit] !== max) {
                data[unit]++;
                ms -= duration;
                continue;
            }
            else if (i === this.format.length - 1) {
                const lastUnit = this.format[this.format.length - 1];
                const lastDuration = this.times.durations[lastUnit];

                const amountToAdd = Math.floor(ms / lastDuration);
                data[lastUnit] += amountToAdd;
                ms = Math.floor(ms - (amountToAdd * lastDuration));
            }

            i++;
        }

        const string = this.format
            .filter(e => ignoreZero ? data[e] > 0 : true)
            .map(e =>
                `${data[e]}${render === "short" ? "" : " "}`
                +
                `${this.units[e][Number(data[e] > 1) + (render === "short" ? 2 : 0)]}`,
            )
            .join(" ");

        if (Object.values(data).length === 0 || string.length <= 1) {
            return String(`1${this.units.s[render === "short" ? 2 : 0]}`);
        }

        return string;
    }
}

module.exports = Duration;