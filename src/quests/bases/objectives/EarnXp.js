class EarnXp {
    constructor(quantity) {
        this.type = "earn_xp";
        this.quantity = quantity;
        this.got = 0;
        this.display = function() {
            return `Gagner de l'expérience: **${this.got}**/${this.quantity}`;
        };
    }
}

module.exports = EarnXp;