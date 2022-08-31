class SQLiteTableMerger {
    constructor(client, ...ignoreTables) {
        this.client = client;
        this.tables = [...ignoreTables];

        if (this.client.mergeSQLiteTables === "true") {
            this.merge();
        }
    }

    merge() {
        /**
         *
         * ANY MERGER
         *
         * */
    }
}

module.exports = SQLiteTableMerger;