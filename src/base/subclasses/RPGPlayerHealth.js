class RPGPlayerHealth {
    constructor(amount, lastHeal) {
        this.amount = amount;
        this.lastRegen = lastHeal;

        this.fullRegen = lastHeal;
        if (this.amount < 100) {
            this.fullRegen += Date.now() + (100 - this.amount) * 60 * 5 * 1000;
        }
    }
}

module.exports = RPGPlayerHealth;