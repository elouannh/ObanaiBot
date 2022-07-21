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

    get row() {
        return this.datas;
    }

}

module.exports = SuperRow;