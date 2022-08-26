const NavigationPage = require("./subclasses/NavigationPage");
const NavigationIdentifier = require("./subclasses/NavigationIdentifier");

class Panel {
    constructor() {
        this.identifier = new NavigationIdentifier();
        this.pages = [new NavigationPage()];
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

module.exports = { Page: NavigationPage, Identifier: NavigationIdentifier, Panel };