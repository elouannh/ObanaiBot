class TableDatas {
    constructor(client, datas) {
        this.client = client;
        this.datas = datas;
    }

    load() {
        return 0;
    }

    overwrite() {
        const datas = this.datas;
        for (const key in this) {
            if (typeof this[key] !== "function") delete this[key];
        }
        Object.assign(this, datas);
    }

}

module.exports = TableDatas;