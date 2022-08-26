class NavigationIdentifier {
    constructor() {
        this.label = "";
        this.value = "";
        this.description = "";
        this.emoji = "";
    }

    randomLetters(length) {
        let toReturn = "";
        for (let i = 0; i < length; i++) {
            toReturn += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        }

        return toReturn;
    }

    get identifier() {
        const toReturn = {};
        for (const property in this) {
            if (property === "description") {
                if (this[property]?.length >= 2) {
                    toReturn[property] = this[property];
                }
            }
            else if (property === "emoji") {
                if (this[property]?.length > 0) {
                    toReturn[property] = this[property];
                }
            }
            else if (this[property]?.length > 3) {
                toReturn[property] = this[property];
            }
            else {
                toReturn[property] = this.randomLetters(6);

            }
        }

        return toReturn;
    }

    setLabel(label) {
        this.label = label;

        return this;
    }

    setEmoji(emoji) {
        this.emoji = emoji;

        return this;
    }

    setValue(value) {
        this.value = value;

        return this;
    }

    setDescription(description) {
        this.description = description;

        return this;
    }
}

module.exports = NavigationIdentifier;