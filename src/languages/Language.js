class Language {
    constructor(identifier) {
        this.identifier = identifier;
        this.json = require(`../languages/json/${identifier}.json`);
    }
}

module.exports = Language;