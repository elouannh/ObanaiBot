class Player {
    constructor(id, name, user) {
        this.id = id;
        this.name = name;
        this.user = user;
        this.stamina = 10;
        this.pv = 100;
        this.number = "0";
        this.target = "0";
        this.entityType = "player";
        this.counterRate = 5;
    }

    async merge(team) {
        this.team = team;
        this.datas = await this.team.arena.cmd.client.playerDb.get(this.id);
        this.datas.breath = require(`../elements/breaths/${this.datas.breath}_style.json`);

        return this;
    }
}

module.exports = Player;