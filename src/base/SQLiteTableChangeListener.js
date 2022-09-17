class SQLiteTableChangeListener {
    constructor(client, table) {
        this.client = client;
        this.table = table;

        this.table.changed((key, before, after) => {

        });
    }

    propertyAccess(obj, path) {
        return path.split(".").reduce((prev, curr) => prev ? prev[curr] : undefined, obj);
    }

    hasChanges(key, before, after) {
        if (key in before) {
            if (typeof before[key] === "object" && before[key] !== null) {
                if (key in after) return this.hasChanges(key, before[key], after[key]);
            }
        }
    }

    async listener(before, after) {
        return { ...before, ...after };
    }
}

module.exports = SQLiteTableChangeListener;