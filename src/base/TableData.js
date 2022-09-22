class TableData {
    constructor(client, data) {
        this.client = client;
        this.data = data;
    }

    load() {
        return 0;
    }

    overwrite() {
        const data = this.data;
        for (const key in this) {
            if (typeof this[key] !== "function") delete this[key];
        }
        Object.assign(this, data);
    }

}

module.exports = TableData;