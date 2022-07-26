const SuperModalTextInput = require("./SuperModalTextInput");

class SuperModal {
    constructor() {
        this.datas = {
            "title": "Default title",
            "customId": "default_customId",
            "components": [],
        };
    }

    setTitle(title) {
        this.datas["title"] = title;

        return this;
    }

    setCustomId(customId) {
        this.datas["customId"] = customId;

        return this;
    }

    setComponents(components) {
        this.datas["components"] = components.map(e => new SuperModalTextInput().setComponents(
            e,
        ).input);

        return this;
    }

    get modal() {
        const d = {
            "title": this.datas.title,
            "customId": this.datas.customId,
            "components": [new SuperModalTextInput().input],
        };

        if (this.datas.components.length > 0) d.components = this.datas.components;
        return d;
    }

}

module.exports = SuperModal;