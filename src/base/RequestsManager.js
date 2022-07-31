const { Collection } = require("discord.js");

class RequestsManager {
    constructor(client) {
        this.client = client;
        this.requests = new Collection();
    }

    ensure(userId) {
        if (!this.requests.has(userId)) this.requests.set(userId, new Collection());
    }

    get(userId) {
        this.ensure(userId);
        return this.requests.get(userId);
    }

    add(userId, cmd) {
        this.ensure(userId);
        this.requests.get(userId).set(cmd.name, Date.now());
    }

    addSome(userId, cmds) {
        this.ensure(userId);
        for (const cmd of cmds) {
            this.add(userId, cmd);
        }
    }

    addToAGroup(cmd, usersIds) {
        for (const userId of usersIds) {
            this.add(userId, cmd);
        }
    }

    addSomeToAGroup(usersIds, cmds) {
        for (const userId of usersIds) {
            this.addSome(userId, cmds);
        }
    }

    has(userId) {
        this.ensure(userId);
        return Object.entries(this.requests.get(userId)).map(e => Object.assign(
            {}, { name: e[0], time: e[1] },
        ));
    }

    remove(userId, cmd) {
        this.ensure(userId);
        this.requests.get(userId).delete(cmd.name);
    }

    removeAll(userId) {
        this.ensure(userId);
        this.requests.get(userId).set(new Collection());
    }

    removeSome(userId, cmds) {
        this.ensure(userId);
        for (const cmd of cmds) {
            this.remove(userId, cmd);
        }
    }

    removeToAGroup(cmd, usersIds) {
        for (const userId of usersIds) {
            this.removeOne(userId, cmd);
        }
    }

    removeAllToAGroup(cmd, usersIds) {
        for (const userId of usersIds) {
            this.removeAll(userId);
        }
    }

    removeSomeToAGroup(usersIds, cmds) {
        for (const userId of usersIds) {
            this.removeSome(userId, cmds);
        }
    }

    ready(userId, cmd) {
        this.ensure(userId);
        return this.requests.get(userId).has(cmd.name);
    }

    get amountOfRequests() {
        return this.requests.map(e => e.size).reduce((a, b) => a + b, 0);
    }
}

module.exports = RequestsManager;