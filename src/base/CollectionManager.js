const { Collection } = require("discord.js");

class CollectionManager {
    constructor(client, callback, addValue, defaultValue) {
        this.client = client;
        this.collection = new Collection();
        this.callback = callback;
        this.addValue = addValue;
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

    add(key, valueKey) {
        this.ensure(key);
        this.collection.get(key).set(valueKey, this.addValue());
    }

    addSome(key, valueKey, values) {
        this.ensure(key);
        for (const value of values) {
            this.add(valueKey, value);
        }
    }

    addToAGroup(keys, value) {
        for (const key of keys) {
            this.add(key, value);
        }
    }

    addSomeToAGroup(keys, values) {
        for (const key of keys) {
            this.addSome(key, values);
        }
    }

    has(key) {
        this.ensure(key);
        return this.callback(this, key);
    }

    remove(key, value) {
        this.ensure(key);
        this.collection.get(key).delete(value);
    }

    removeAll(key) {
        this.ensure(key);
        this.collection.get(key).set(new Collection());
    }

    removeSome(key, values) {
        this.ensure(key);
        for (const value of values) {
            this.remove(key, value);
        }
    }

    removeToAGroup(keys, value) {
        for (const key of keys) {
            this.remove(key, value);
        }
    }

    removeAllToAGroup(keys) {
        for (const key of keys) {
            this.removeAll(key);
        }
    }

    removeSomeToAGroup(keys, values) {
        for (const key of keys) {
            this.removeSome(key, values);
        }
    }

    ready(key, value) {
        this.ensure(key);
        return this.collection.get(key).has(value);
    }

    get totalSize() {
        return this.collection.map(e => e.size).reduce((a, b) => a + b, 0);
    }
}

module.exports = CollectionManager;