const Enmap = require("enmap");
const SQLiteTableChangeListener = require("./SQLiteTableChangeListener");
const fs = require("fs");

function schema_(...args) {
    return { ...args };
}

class SQLiteTable {
    constructor(client, name, schema = schema_, listenerClass = SQLiteTableChangeListener) {
        this.client = client;
        this.db = new Enmap({ name });
        this.schema = schema;
        if (this.client.env.MERGE_SQLITE_TABLES === "0") {
            const changeListener = async (key, oldValue, newValue) => {
                if (oldValue === newValue) return;
                const listener = new listenerClass(this.client);
                if (listener.overListener) await listener.overListener(key, oldValue, newValue);
            };
            const dbListeners = fs.readdirSync("./src/base/database/listeners").map(e => e
                    .replace("Listener.js", "")
                    .toLowerCase(),
                );
            if (dbListeners.includes(name)) this.db.changed(changeListener);
        }
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

    get size() {
        return this.db.size;
    }
}

module.exports = SQLiteTable;