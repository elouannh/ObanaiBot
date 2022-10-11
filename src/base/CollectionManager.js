const { Collection } = require("discord.js");

class CollectionManager {
    constructor(client, name, callback, defaultValue) {
        this.client = client;
        this.name = name;
        this.collection = new Collection();
        this.callback = callback;
        this.defaultValue = defaultValue;
    }

    ensure(key) {
        if (!this.collection.has(key)) this.collection.set(key, new Collection());
    }

    get(key) {
        this.ensure(key);
        return this.collection.get(key);
    }

    getSub(key, valueKey) {
        return this.get(key).get(valueKey) ?? this.defaultValue();
    }

    add(key, entry) {
        this.ensure(key);
        this.collection.get(key).set(entry.key, entry.value);
    }

    addSome(key, entries) {
        this.ensure(key);
        for (const entry of entries) {
            this.add(key, entry);
        }
    }

    addToAGroup(keys, entry) {
        for (const key of keys) {
            this.add(key, entry);
        }
    }

    addSomeToAGroup(keys, entries) {
        for (const key of keys) {
            this.addSome(key, entries);
        }
    }

    has(key) {
        this.ensure(key);
        return this.callback(this, key);
    }

    remove(key, entryKey) {
        this.ensure(key);
        this.collection.get(key).delete(entryKey);
    }

    removeAll(key) {
        this.ensure(key);
        this.collection.get(key).set(new Collection());
    }

    removeSome(key, entries) {
        this.ensure(key);
        for (const entry of entries) {
            this.remove(key, entry);
        }
    }

    removeToAGroup(keys, entry) {
        for (const key of keys) {
            this.remove(key, entry);
        }
    }

    removeAllToAGroup(keys) {
        for (const key of keys) {
            this.removeAll(key);
        }
    }

    removeSomeToAGroup(keys, entries) {
        for (const key of keys) {
            this.removeSome(key, entries);
        }
    }

    ready(key, entryKey) {
        this.ensure(key);
        return this.collection.get(key).has(entryKey);
    }

    get totalSize() {
        return this.collection.map(e => e.size).reduce((a, b) => a + b, 0);
    }
}

module.exports = CollectionManager;