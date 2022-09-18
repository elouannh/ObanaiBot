class SQLiteTableChangeListener {
    constructor(client) {
        this.client = client;
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

    async listener(key, before, after) {
        return { ...before, ...after };
    }
}

module.exports = SQLiteTableChangeListener;