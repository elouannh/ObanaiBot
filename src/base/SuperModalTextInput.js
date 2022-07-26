const SuperModalTextInputComponent = require("./SuperModalTextInputComponent");

class SuperModalTextInput {
    constructor() {
        this.datas = {
            "type": 1,
            "components": [],
        };
    }

    setComponents(components) {
        this.datas["components"] = components.map(e => new SuperModalTextInputComponent()
            .setCustomId(e[0])
            .setLabel(e[1])
            .setMinLength(e[2])
            .setMaxLength(e[3])
            .setPlaceholder(e[4])
            .setRequired(e[5])
            .setStyle(e[6])
            .inputcomponent,
        );

        return this;
    }

    get input() {
        const d = {
            "type": this.datas.type,
            "components": [new SuperModalTextInputComponent().modal],
        };

        if (this.datas.components.length > 0) d.components = this.datas.components;
        return d;
    }

}

module.exports = SuperModalTextInput;