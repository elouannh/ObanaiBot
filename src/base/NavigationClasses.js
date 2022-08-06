class Page {
    constructor() {
        this.identifier = new Identifier();
        this.embeds = [];
        this.components = [];
    }

    setIdentifier(identifier) {
        this.identifier = identifier;

        return this;
    }

    setEmbeds(embeds) {
        this.embeds = embeds;

        return this;
    }

    setComponents(components) {
        this.components = components;

        return this;
    }
}

class Identifier {
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

class Panel {
    constructor() {
        this.identifier = new Identifier();
        this.pages = [new Page()];
        this.components = [];
    }

    setIdentifier(identifier) {
        this.identifier = identifier;

        return this;
    }

    setPages(pages) {
        this.pages = pages;

        return this;
    }

    setComponents(components) {
        this.components = components;

        return this;
    }
}

module.exports = { Page, Identifier, Panel };