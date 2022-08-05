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
        this.label = "nothing";
        this.value = "nothing";
        this.description = "nothing";
    }

    setLabel(label) {
        this.label = label;

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