class Team {
    constructor(players, id) {
        this.players = players;
        this.id = id;
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
}

module.exports = Team;