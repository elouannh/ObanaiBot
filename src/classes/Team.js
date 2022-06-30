class Team {
    constructor(players, id, nid) {
        this.players = players;
        this.id = id;
        this.nid = nid;
    }

    async init(arena) {
        this.arena = arena;
        const p = {};
        for (const player of this.players) {
            const i = await player.merge(this);
            i.number = String(Object.entries(p).length);
            p[String(Object.entries(p).length)] = i;
        }

        this.players = p;
    }

    getPlayer(number) {
        return this.players[Object.values(this.players).filter(e => e.number === number)?.at(0).number];
    }

    hurtPlayer(number, amount) {
        this.players[number].pv -= amount;
    }

    removeStamina(number, amount) {
        this.players[number].stamina -= amount;
    }

    addStamina(number, amount) {
        if (this.players[number].stamina < 10) this.players[number].stamina += amount;
    }
}

module.exports = Team;