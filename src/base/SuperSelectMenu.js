const SuperSelectMenuOption = require("./SuperSelectMenuOption");

class SuperSelectMenu {
    constructor() {
        this.datas = {
            "type": 3,
            "customId": "default",
            "options": [],
            "placeholder": "placeholder",
            "minValues": 0,
            "maxValues": 1,
            "disabled": false,
        };
    }

    setCustomId(customId) {
        this.datas["customId"] = customId;

        return this;
    }

    setOptions(options) {
        this.datas["options"] = options.map(e => new SuperSelectMenuOption().setLabel(e[0]).setValue(e[1]).setDescription(e[2]).setEmoji(e[3]).setDefault(e[4]).option);

        return this;
    }

    setPlaceholder(placeholder) {
        this.datas["placeholder"] = placeholder;

        return this;
    }

    setMinValues(minValues) {
        this.datas["minValues"] = minValues;

        return this;
    }

    setMaxValues(maxValues) {
        this.datas["maxValues"] = maxValues;

        return this;
    }

    setDisabled(disabled) {
        this.datas["disabled"] = disabled;

        return this;
    }

    get menu() {
        const d = {
            "type": this.datas.type,
            "customId": this.datas.customId,
            "options": [new SuperSelectMenuOption().option],
            "placeholder": this.datas.placeholder,
            "minValues": this.datas.minValues,
            "maxValues": this.datas.maxValues,
            "disabled": this.datas.disabled,
        };

        if (this.datas.options.length > 0) d.options = this.datas.options;
        return d;
    }

}

module.exports = SuperSelectMenu;