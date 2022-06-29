class SuperRow {
    constructor(type) {
        this.datas = {
            "type": type,
            "components": [],
        };
    }

    addComponent(component) {
        this.datas["components"].push(component);
    }

}

module.exports = SuperRow;