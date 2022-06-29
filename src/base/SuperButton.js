class SuperButton {
    constructor() {
        this.datas = {
            "type": 2,
            "style": 1,
            "label": "<instance>",
            "emoji": "",
            "custom_id": "default",
            "url": "",
            "disabled": false,
        };

        this.colors = {
            "primary": 1,
            "secondary": 2,
            "success": 3,
            "danger": 4,
            "link": 5,
        };
    }

    setStyle(color) {
        this.datas["style"] = this.colors[color];

        return this;
    }

    setLabel(label) {
        this.datas["label"] = label;

        return this;
    }

    setEmoji(emoji) {
        this.datas["emoji"] = emoji;

        return this;
    }

    setCustomId(customId) {
        this.datas["customId"] = customId;

        return this;
    }

    setUrl(url) {
        this.datas["url"] = url;

        return this;
    }

    setDisabled(disabled) {
        this.datas["disabled"] = disabled;

        return this;
    }
}

module.exports = SuperButton;