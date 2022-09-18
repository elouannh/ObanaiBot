const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class ActivityListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }

    async listener(key, before, after) {
        console.log("ActivityListener");
        console.log("HEYYYY");
    }
}

module.exports = ActivityListener;