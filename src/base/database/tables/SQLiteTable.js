const Enmap = require("enmap");

function schema_(...args) {
    return { ...args };
}

class SQLiteTable {
    constructor(client, name, schema = schema_) {
        this.client = client;
        this.db = new Enmap({ name });
        this.schema = schema;
    }

    ensureInDeep(key) {
        return this.db.ensure(key, this.schema(key));
    }

    ensure(key) {
        if (!this.db.has(key)) return Object.assign(this.schema(key), { schemaInstance: true });

        return this.client.util.ensureObj(this.schema(key), this.db.get(key));
    }

    get(key) {
        return this.ensure(key);
    }

    set(key, ...args) {
        if (!this.db.has(key)) return;
        this.ensureInDeep(key);
        return this.db.set(key, ...args);
    }

    delete(key, ...args) {
        if (!this.db.has(key)) return;
        return this.db.delete(key, ...args);
    }
}

module.exports = SQLiteTable;