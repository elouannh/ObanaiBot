const NavigationIdentifier = require("./NavigationIdentifier");

class NavigationPage {
    constructor() {
        this.identifier = new NavigationIdentifier();
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

module.exports = NavigationPage;