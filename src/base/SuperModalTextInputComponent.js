class SuperModalTextInputComponent {
    constructor() {
        this.datas = {
            "type": 4,
            "customId": "default_customId",
            "label": "Default",
            "style": 1,
            "minLength": 1,
            "maxLength": 1000,
            "placeholder": "Nothing..",
            "required": true,
        };
    }

    setCustomId(customId) {
        this.datas["customId"] = customId;

        return this;
    }

    setLabel(label) {
        this.datas["label"] = label;

        return this;
    }

    setStyle(style) {
        this.datas["style"] = style;

        return this;
    }

    setMinLength(minLength) {
        this.datas["minLength"] = minLength;

        return this;
    }

    setMaxLength(maxLength) {
        this.datas["maxLength"] = maxLength;

        return this;
    }

    setPlaceholder(placeholder) {
        this.datas["placeholder"] = placeholder;

        return this;
    }

    setRequired(required) {
        this.datas["required"] = required;

        return this;
    }

    get inputcomponent() {
        const d = this.datas;
        return d;
    }

    get default() {
        return {
            "type": 4,
            "customId": "default_customId",
            "label": "Default",
            "style": 1,
            "minLength": 1,
            "maxLength": 1000,
            "placeholder": "Nothing..",
            "required": true,
        };
    }

}

module.exports = SuperModalTextInputComponent;