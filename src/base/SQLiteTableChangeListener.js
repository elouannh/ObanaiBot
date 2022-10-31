class SQLiteTableChangeListener {
    constructor(client) {
        this.client = client;
    }

    async listener(key, before, after) {
        return { key, before, after };
    }
}

module.exports = SQLiteTableChangeListener;