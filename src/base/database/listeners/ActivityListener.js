const SQLiteTableChangeListener = require('./SQLiteTableChangeListener');

class ActivityListener extends SQLiteTableChangeListener {
    constructor(client) {
        super(client, client.activityDb);
    }

    async listener() {
        console.log("ActivityListener:", this.changes);
    }
}

module.exports = ActivityListener;