const Enmap = require("enmap");
const SQLiteTableChangeListener = require("./SQLiteTableChangeListener");
const SQLiteTableChangeGroup = require("./SQLiteTableChangeGroup");

function schema_(...args) {
    return { ...args };
}

class SQLiteTable {
    constructor(client, name, schema = schema_, listenerClass = SQLiteTableChangeListener) {
        this.client = client;
        this.db = new Enmap({ name });
        this.schema = schema;
        this.db.changed(async (key, oldValue, newValue) => {
            const listener = new listenerClass(this.client);
            await listener.listener(
                key, oldValue, newValue, new SQLiteTableChangeGroup(listener.refreshChanges(oldValue, newValue)),
            );
        });
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
        if (!this.db.has(key)) return this.ensureInDeep(key);
        return this.db.set(key, ...args);
    }

    delete(key, ...args) {
        if (!this.db.has(key)) return;
        return this.db.delete(key, ...args);
    }
}

module.exports = SQLiteTable;