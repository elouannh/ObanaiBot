const chalk = require("chalk");
const Canvas = require("canvas");
// eslint-disable-next-line no-unused-vars
const CollectionManager = require("./CollectionManager");

module.exports = {
    /**
     * Convert a number to a discord timestamps
     * @param {Number} date The date to convert
     * @returns {String} The converted date
     */
    toTimestamp(date) {
        const timestamp = this.round(date / 1000);
        return `<t:${timestamp}> (<t:${timestamp}:R>)`;
    },
    /**
     * Function that returns a string based on the date (not readable).
     * @param {Date} date
     * @returns {String}
     */
    dateToString(date) {
        return `${date.getDate()}${date.getMonth()}${date.getFullYear()}`;
    },
    /**
     * @typedef {Object} Request
     * @property {String} name The request name
     * @property {Number} ts The timestamp of the request
     */
    /**
     * A callback function for the manager class.
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
     * A callback function for the requestsManager class.
     * @param {CollectionManager} manager
     * @param {String} key The user ID
     * @returns {Request[]}
     */
    reqCallbackFunction(manager, key) {
        const map = manager.get(key).entries();
        const finalReq = [];
        for (const [entryKey, entryValue] of map) {
            finalReq.push([entryKey, entryValue]);
        }
        return finalReq.map(e => Object.assign({}, { name: e[0], ts: e[1].ts, link: e[1].link }));
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
    /**
     * Returns the capitalization of a string.
     * @param {String} string The string to capitalize
     * @returns {string}
     */
    capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    /**
     * Separate digits of a number with a given separator.
     * @param {Number} int The number to separate
     * @param {String} sep The separator
     * @returns {string}
     */
    intRender(int, sep = " ") {
        return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
    },
    /**
     * Wait a given amount of milliseconds.
     * @param {Number} ms The amount in ms to wait
     * @returns {Promise<unknown>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    /**
     * Returns the current date in a given format, in a string.
     * @param {Date} date The date
     * @param {String} form The format of the date
     * @returns {String}
     */
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
    /**
     * Log something with the time.
     * @param {*} message The message to log
     * @param {String} mainColor The color to print in
     * @returns {void}
     */
    timelog(message, mainColor = "greenBright") {
        const time = this.dateRender(new Date(), "[month/day] [hour:min:sec]");
        console.log(chalk[mainColor](`${time}  |  ${message}`));
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
        return canvas.toBuffer();
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
     * Return a corner into a progress bar. Specify the different limits, and returns three points: the first is the
     * main, and the two following are the two others at each extremity.
     * @param {Number} space The space between the two extremities
     * @param {Number} minX The minimum X value
     * @param {Number} maxX The maximum X value
     * @param {Number} minY The minimum Y value
     * @param {Number} maxY The maximum Y value
     * @returns {XCorner}
     */
    generateYCorner(space, minX, maxX, minY, maxY) {
        let y = Math.floor(Math.random() * (maxY - minY)) + minY;
        y = Math.min(Math.max(y, minY + space), maxY - space);

        return [[maxX, y], [minX, y - space], [minX, y + space]];
    },
    /**
     * Generate a vertical straight bar with two random corners.
     * @param width
     * @param height
     * @param color
     * @param border
     * @param borderWidth
     */
    verticalBar(width, height, color, border, borderWidth) {
        const canvas = Canvas.createCanvas(width, height);
        const context = canvas.getContext("2d");
        const lw = borderWidth;

        const widthPercent = width / 100;

        const leftCorner = this.generateYCorner(
            this.random(2, 5),
            lw,
            widthPercent * this.random(30, 40),
            lw,
            height - lw,
        );
        const rightCorner = this.generateYCorner(
            this.random(2, 5),
            width - lw,
            width - lw - widthPercent * this.random(30, 40),
            lw,
            height - lw,
        );

        const points = [
            [lw, lw], [width - lw, lw],
            rightCorner[1], rightCorner[0], rightCorner[2],
            [width - lw, height - lw], [lw, height - lw],
            leftCorner[2], leftCorner[0], leftCorner[1],
            [lw, lw],
        ];

        context.beginPath();
        context.strokeStyle = border;
        for (const point of points) context.lineTo(...point);
        context.closePath();
        context.clip();

        context.fillStyle = color;
        context.fillRect(0, 0, width, height);

        context.fillStyle = border;
        context.fillRect(0, 0, width, 1);
        context.fillRect(0, height - 1, width, 1);

        context.stroke();

        return canvas.toBuffer();
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
     * Generate a text with a 3D effect only using fillText method.
     * @param {Canvas.NodeCanvasRenderingContext2D} context The context to fill in
     * @param {String} text The text to fill
     * @param {String} color The color of the text
     * @param {String} shadow The color of the shadow
     * @param {String} font The font of the text
     * @param {Number} size The size of the text
     * @param {Number} x The X position of the text
     * @param {Number} y The Y position of the text
     */
    text3D(context, text, color, shadow, font, size, x, y) {
        context.fillStyle = shadow;
        context.textAlign = "left";
        context.font = `${size}px ${font}`;
        context.fillText(text, x - 1, y);
        context.fillText(text, x, y + 1);
        context.fillText(text, x, y + 1);
        context.fillText(text, x + 1, y);
        context.fillStyle = color;
        context.fillText(text, x, y);
    },
    /**
     * Generate a pie graph.
     * @param {Number[]} parts The percents of the graph
     * @param {String[]} colors The different colors tu use (it does a loop)
     * @param {Number} width The width of the graph
     * @param {String} fillStyle The fill style of the graph
     * @param {String} borderStyle The border style of the graph
     * @param {Number} borderWidth The border width of the graph
     * @returns {Promise<Buffer>}
     */
    async circleGraph(parts, colors, width, fillStyle, borderStyle, borderWidth) {
        const canvas = Canvas.createCanvas(width, width);
        const context = canvas.getContext("2d");

        let i = 0;
        let lastStartAngle = -Math.PI / 2;
        for (const part of parts) {
            context.beginPath();
            context.fillStyle = colors[i];
            context.strokeStyle = borderStyle;
            context.lineWidth = borderWidth;
            context.moveTo(width / 2, width / 2);
            context.arc(width / 2, width / 2, width / 2 - borderWidth, lastStartAngle, lastStartAngle + (part * Math.PI * 2), false);
            lastStartAngle = lastStartAngle + (part * Math.PI * 2);
            context.fill();
            context.stroke();
            context.closePath();
            context.restore();
            i++;
            if (i >= colors.length) i = 0;
        }
        context.beginPath();
        context.moveTo(width / 2, width / 2);
        context.arc(width / 2, width / 2, width / 4, 0, Math.PI * 2, false);
        context.fillStyle = borderStyle;
        context.fill();
        context.closePath();
        context.beginPath();
        context.moveTo(width / 2, width / 2);
        context.arc(width / 2, width / 2, width / 4 - borderWidth, 0, Math.PI * 2, false);
        context.fillStyle = fillStyle;
        context.fill();
        context.closePath();
        return canvas.toBuffer();
    },
    /**
     * @typedef {Array<Number, Number>} Point
     * @property {Number} 0 The X position
     * @property {Number} 1 The Y position
     */
    /**
     * @typedef {Object} Line
     * @property {Number} coefficient The coefficient of the line
     * @property {Number} origin The origin of the line
     */
    /**
     * Get the coefficient of a line. Get also the Y intercept.
     * @param {Point} point1 The first point
     * @param {Point} point2 The second point
     * @returns {Line} The coefficient and the Y intercept
     */
    getLine(point1, point2) {
        if (point1[0] === point2[0]) return { coefficient: Infinity, origin: point1[0] };
        if (point1[1] === point2[1]) return { coefficient: 0, origin: point1[1] };
        const coefficient = (point2[1] - point1[1]) / (point2[0] - point1[0]);
        const origin = point1[1] - coefficient * point1[0];
        return { coefficient, origin };
    },
    /**
     * @typedef {"linear"|"circular"} ScaleStyle
     */
    /**
     * Generate a polar graph.
     * @param {Number[]} parts The percents of the graph
     * @param {Number[]} values The values of the graph
     * @param {String} color The different colors tu use (it does a loop)
     * @param {Number} width The width of the graph
     * @param {String} lineStyle The line style of the graph that link the points
     * @param {Number} scales The amount of scales
     * @param {ScaleStyle} scaleStyle The style of the scales
     * @param {String} labelShadow The color of the shadow of the labels
     * @returns {Promise<Buffer>}
     */
    async polarGraph(parts, values, color, width, lineStyle, scales, scaleStyle, labelShadow) {
        const canvas = Canvas.createCanvas(width, width);
        const context = canvas.getContext("2d");

        const segmentAngle = (Math.PI * 2) / parts.length;
        const elts = {
            extremities: [[width / 2, 0]],
            lines: [],
            parts: [],
        };
        for (let i = 0; i < parts.length; i++) {
            const A = elts.extremities[elts.extremities.length - 1];
            elts.extremities.push(
                [
                    A[0] * Math.cos(segmentAngle) + A[1] * Math.sin(segmentAngle),
                    -A[0] * Math.sin(segmentAngle) + A[1] * Math.cos(segmentAngle),
                ],
            );
            elts.lines.push(
                this.getLine([width / 2, width / 2], elts.extremities[elts.extremities.length - 1]),
            );
        }
        context.beginPath();
        const maxPart = Math.max(...parts);
        for (let i = 0; i < parts.length; i++) {
            const length = parts[i] / maxPart;
            const pt = elts.extremities[i];
            elts.parts.push([pt[0] * length + width / 2, pt[1] * length + width / 2]);
            context.lineTo(elts.parts[i][0], elts.parts[i][1]);
        }
        context.closePath();
        context.fillStyle = color;
        context.fill();
        context.beginPath();
        const maxValue = Math.max(...values);
        const scalePercent = 1 / scales;
        for (let scaleI = scales; scaleI > 0; scaleI--) {
            for (const pt of elts.extremities.slice(0, elts.extremities.length - 1)) {
                const sWidth = (pt[0] * scaleI * scalePercent + width / 2) ;
                const sHeight = (pt[1] * scaleI * scalePercent + width / 2);
                context.moveTo(width / 2, width / 2);
                context.lineTo(sWidth, sHeight);
            }
            context.moveTo(width / 2, width / 2);
            if (scaleStyle === "linear") {
                for (const pt of elts.extremities) {
                    const sWidth = (pt[0] * scaleI * scalePercent + width / 2);
                    const sHeight = (pt[1] * scaleI * scalePercent + width / 2);
                    context.lineTo(sWidth, sHeight);
                }
            }
            else if (scaleStyle === "circular") {
                context.arc(width / 2, width / 2, width / 2 * scaleI * scalePercent - 1, 0, Math.PI * 2, false);
            }
        }
        for (let scaleI = scales; scaleI > 0; scaleI--) {
            context.textAlign = "left";
            context.textBaseline = "middle";
            this.text3D(context, `${this.round(scaleI * maxValue / scales, 0)}`, lineStyle, labelShadow, "soft", 10, width / 2, width / 2 - (width / 2 * scaleI * scalePercent - 5));
        }
        context.closePath();
        context.strokeStyle = lineStyle;
        context.lineWidth = 1;
        context.stroke();

        return canvas.toBuffer();
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
        context.strokeStyle = line;
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
        return canvas.toBuffer();
    },
    /**
     * Return a Buffer that contains the image with the given link, but in a perfect circle.
     * @param {String} link The image link
     * @returns {Promise<Buffer>}
     */
    async getRoundImage(link) {
        if (link.endsWith(".webp")) link = link.replace(".webp", ".png");
        const image = await Canvas.loadImage(link);
        const canvas = Canvas.createCanvas(image.width, image.height);
        const context = canvas.getContext("2d");

        context.arc(image.width / 2, image.width / 2, image.width / 2, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        context.drawImage(image, 0, 0, image.width, image.height);

        return canvas.toBuffer();
    },
};