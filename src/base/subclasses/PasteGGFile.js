class PasteGGFile {
    constructor() {
        this.name = "";
        this.content = {
            format: "text",
            highlight_language: "javascript",
            value: "return 1+1;",
        };
    }

    get file() {
        return {
            name: this.name,
            content: {
                format: this.content.format,
                highlight_language: this.content.highlight_language,
                value: this.content.value,
            },
        };
    }

    setName(name) {
        this.name = name;

        return this;
    }

    setContentFormat(format) {
        this.content.format = format;

        return this;
    }

    setContentHighlightLanguage(highlight_language) {
        this.content.highlight_language = highlight_language;

        return this;
    }

    setContentValue(value) {
        this.content.value = value;

        return this;
    }
}

module.exports = PasteGGFile;