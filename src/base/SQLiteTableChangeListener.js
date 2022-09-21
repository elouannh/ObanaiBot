const SQLiteTableChange = require("./SQLiteTableChange");

class SQLiteTableChangeListener {
    constructor(client) {
        this.client = client;
    }

    refreshChanges(before, after) {
        if (typeof after === "string") {
            if (before !== after) before = new SQLiteTableChange(before, after);
        }
        else {
            for (const key in after) {
                if (after[key] instanceof Object && !(after[key] instanceof String)) {
                    if (before[key] instanceof Object && !(before[key] instanceof String) && key in before) before[key] = this.refreshChanges(before[key], after[key]);
                    else before[key] = new SQLiteTableChange(null, after[key]);
                }
                else if (before[key] instanceof Object && !(before[key] instanceof String) && key in before) {
                    before[key] = this.refreshChanges(before[key], after[key]);
                }
                else if (before[key] !== after[key]) {
                    before[key] = new SQLiteTableChange(before[key], after[key]);
                }
            }
        }

        return before;
    }

    async listener(key, before, after, changes) {
        return { key, before, after, changes };
    }
}

module.exports = SQLiteTableChangeListener;