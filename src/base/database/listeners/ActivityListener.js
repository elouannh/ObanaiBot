const SQLiteTableChangeListener = require("../../SQLiteTableChangeListener");

class ActivityListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client);
    }
}

module.exports = ActivityListener;