class SuperSelectMenuOption {
    constructor() {
        this.datas = {
            "label": "default label",
            "value": "default_label",
            "description": "null",
            "emoji": "",
            "default": true,
        };
    }

    setLabel(label) {
        this.datas["label"] = label;

        return this;
    }

    setValue(value) {
        this.datas["value"] = value;

        return this;
    }

    setDescription(description) {
        this.datas["description"] = description;

        return this;
    }

    setDefault(default_) {
        this.datas["default"] = default_;

        return this;
    }

    setEmoji(emoji) {
        this.datas["emoji"] = { name: emoji };

        return this;
    }

    get option() {
        return this.datas;
    }

}

module.exports = SuperSelectMenuOption;