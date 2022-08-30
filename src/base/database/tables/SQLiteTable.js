const Enmap = require("enmap");

function schema(...args) {
    return { ...args };
}

class SQLiteTable {
    constructor(client, name, schema = schema) {
        this.client = client;
        this.db = new Enmap({ name });
        this.schema = schema;
    }

    ensure(key) {
        return this.db.ensure(key, this.schema(key));
    }

    get(key) {
        this.ensure(key);
        return this.db.get(key);
    }

    set(key, ...args) {
        this.ensure(key);
        return this.db.set(key, ...args);
    }

    delete(...args) {
        return this.db.delete(...args);
    }
}

module.exports = SQLiteTable;