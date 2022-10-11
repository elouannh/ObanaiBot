const SQLiteTableChange = require("./SQLiteTableChange");

class SQLiteTableChangeGroup {
    constructor(object) {
        this.object = object;
    }

    get(path) {
        let obj = { ...this.object };
        for (const key of path.split(".")) {
            if (obj instanceof Object && !(obj instanceof String)) {
                obj = obj[key];
            }
            else {
                obj = undefined;
                break;
            }
        }
        return obj;
    }

    before(path) {
        const obj = this.get(path);
        if (obj instanceof SQLiteTableChange) return obj.before;
        return obj;
    }

    after(path) {
        const obj = this.get(path);
        if (obj instanceof SQLiteTableChange) return obj.after;
        return obj;
    }

    changed(path) {
        const obj = this.get(path);
        return obj instanceof SQLiteTableChange;
    }
}

module.exports = SQLiteTableChangeGroup;