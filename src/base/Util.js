const chalk = require("chalk");
const Canvas = require("@napi-rs/canvas");
// eslint-disable-next-line no-unused-vars
const CollectionManager = require("./CollectionManager");

module.exports = {
    /**
     * @typedef {Object} Request
     * @property {String} name The request name
     * @property {Number} ts The timestamp of the request
     */
    /**
     * A callback function for the cooldownsManager class.
     * @param {CollectionManager} manager
     * @param {String} key The user ID
     * @returns {Request[]}
     */
    callbackFunction(manager, key) {
        const map = manager.get(key).entries();
        const finalReq = [];
        for (const [entryKey, entryValue] of map) {
            finalReq.push([entryKey, entryValue]);
        }
        return finalReq.map(e => Object.assign({}, { name: e[0], ts: e[1] }));
    },
    /**
     * @typedef {Object} EnsureIndicator
     * @property {String} value The value if we write in the render.json file
     * @property {String} addedString The string to write if a new value is added
     * @property {String} equalString The string to write if a value is equal to the source
     * @property {String} notInString The string to write if a value is removed
     */
    /**
     * Returns the targeted objected with the source properties. Useful for languages.
     * @param {Object|null} source The source object
     * @param {Object|null} obj The object to ensure
     * @param {EnsureIndicator} indicate The indicate to show in the render.json file the translations error
     * @returns {*}
     */
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
    },
    /**
     * Returns the targeted objected with the source properties.
     * @param {Object|null} source The source object
     * @param {Object|null} obj The object to ensure
     * @returns {*}
     */
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
    },
    /**
     * Equals to the <String>.toFixed() method but returns a Number.
     * @param {Number} int The number to round
     * @param {Number} digits The amount of digits to fix
     * @returns {number}
     */
    round(int, digits = 0) {
        return Number(int.toFixed(digits));
    },
    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    intRender(int, sep = " ") {
        return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    },
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    dateRender(date, form) {
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
        return form
            .replace("day", data.day)
            .replace("month", data.month)
            .replace("year", data.year)
            .replace("hour", data.hour)
            .replace("min", data.min)
            .replace("sec", data.sec);
    },
    timelog(message, mainColor = chalk.greenBright) {
        const time = this.dateRender(new Date(), "[month/day] [hour:min:sec]");
        console.log(mainColor(`${time}  |  ${message}`));
    },
    /**
     * Return the cropped image.
     * @param {Buffer} buffer The image buffer
     * @param {Number} width The width of the cropped image
     * @param {Number} height The height of the cropped image
     * @returns {Promise<Buffer>}
     */
    async cropImage(buffer, width, height) {
        const canvas = Canvas.createCanvas(width, height);
        const context = canvas.getContext("2d");
        const image = await Canvas.loadImage(buffer);
        context.drawImage(image, 0, 0, width, height);
        return await canvas.encode("png");
    },
    /**
     * @typedef {Array[]} XCorner
     * @property {Array<Integer, Integer>} 0 The central vertex of the corner, a couple of X and Y coordinates
     * @property {Array<Integer, Integer>} 1 The the left vertex of the corner, a couple of X and Y coordinates
     * @property {Array<Integer, Integer>} 2 The the right vertex of the corner, a couple of X and Y coordinates
     */
    /**
     * Return a corner into a progress bar. Specify the different limits, and returns three points: the first is the
     * main, and the two following are the two others at each extremity.
     * @param {Number} space The space between the two extremities
     * @param {Number} minX The minimum X value
     * @param {Number} maxX The maximum X value
     * @param {Number} minY The minimum Y value
     * @param {Number} maxY The maximum Y value
     * @returns {XCorner}
     */
    generateXCorner(space, minX, maxX, minY, maxY) {
        let x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        x = Math.min(Math.max(x, minX + space), maxX - space);

        return [[x, maxY], [x - space, minY], [x + space, minY]];
    },
    /**
     * Return a random number between a minimum and a maximum.
     * @param {Number} min The minimum value
     * @param {Number} max The maximum value
     * @returns {Number}
     */
    random(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },
    /**
     * Return a Buffer that contains a progress bar with the given percentage.
     * @param {Number} percent The percentage of the progress bar
     * @param {Number} width The width of the progress bar
     * @param {Number} height The height of the progress bar
     * @param {String|Canvas.Image} fill The fill of the progress bar
     * @param {String|Canvas.Image} bg The background of the progress bar
     * @param {String} line The stroke line
     * @returns {Promise<Buffer>}
     */
    async getProgressBar(percent, width, height, fill, bg, line) {
        const canvas = Canvas.createCanvas(width, height);
        const context = canvas.getContext("2d");

        const widthPercent = width / 100;
        const heightPercent = height / 100;
        const lw = 2;
        context.lineWidth = lw;

        const firstTopCorner = this.generateXCorner(
            this.random(10, 30),
            lw,
            width / 2,
            lw,
            heightPercent * this.random(10, 30),
        );
        const secondTopCorner = this.generateXCorner(
            this.random(10, 30),
            width / 2,
            width - lw,
            lw,
            heightPercent * this.random(10, 30),
        );
        const thirdCorner = this.generateXCorner(
            this.random(10, 30),
            lw,
            width - lw,
            height - lw,
            height - lw - heightPercent * this.random(10, 30),
        );

        const points = [
            [lw, lw],
            firstTopCorner[1], firstTopCorner[0], firstTopCorner[2], secondTopCorner[1], secondTopCorner[0], secondTopCorner[2],
            [width - lw, lw],
            [width - lw, height - lw], thirdCorner[2], thirdCorner[0], thirdCorner[1], [lw, height - lw], [lw, lw],
        ];

        context.beginPath();
        context.strokeStyle = "#000000";
        for (const point of points) context.lineTo(...point);
        context.closePath();
        context.clip();

        if (bg instanceof Canvas.Image) {
            const image = await Canvas.loadImage(bg);
            context.drawImage(image, lw, lw, width - lw, height - lw);
        }
        else {
            context.fillStyle = bg;
            context.fillRect(lw, lw, width - lw, height - lw);
        }
        if (fill instanceof Canvas.Image) {
            const image = await Canvas.loadImage(fill);
            context.drawImage(image, lw, lw, width - lw, height - lw);
        }
        else {
            context.fillStyle = fill;
            context.fillRect(lw, lw, (width * percent) - lw, height- lw);
        }
        context.stroke();
        return await canvas.encode("png");
    },
    /**
     * Return a Buffer that contains the image with the given link, but in a perfect circle.
     * @param {String} link The image link
     * @returns {Promise<Buffer>}
     */
    async getRoundImage(link) {
        const image = await Canvas.loadImage(link);
        const canvas = Canvas.createCanvas(image.width, image.height);
        const context = canvas.getContext("2d");

        context.arc(image.width / 2, image.width / 2, image.width / 2, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        context.drawImage(image, 0, 0, image.width, image.height);

        return await canvas.encode("png");
    },
    /**
     * Catch an error and log it (in a beautiful bright red).
     * @param {Error} error The error instance
     * @returns {void}
     */
    catchError(error) {
        const date = new Date();
        const data = {
            day: String(date.getDate()),
            month: String(date.getMonth() + 1),
            hour: String(date.getHours()),
            min: String(date.getMinutes()),
            sec: String(date.getSeconds()),
        };
        if (data.day.length < 2) data.day = "0" + data.day;
        if (data.month.length < 2) data.month = "0" + data.month;
        if (data.hour.length < 2) data.hour = "0" + data.hour;
        if (data.min.length < 2) data.min = "0" + data.min;
        if (data.sec.length < 2) data.sec = "0" + data.sec;
        console.log(chalk.redBright(`[${data.month}/${data.day}] [${data.hour}:${data.hour}:${data.sec}]  |  Error: ${error.stack}`));
    },
};