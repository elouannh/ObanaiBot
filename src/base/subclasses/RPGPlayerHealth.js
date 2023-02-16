class RPGPlayerHealth {
    constructor(amount, lastHealing) {
        this.amount = amount;
        this.lastRegen = lastHealing;

        this.fullRegen = lastHealing;
        if (this.amount < 100) {
            this.fullRegen += Date.now() + (100 - this.amount) * 60 * 5 * 1000;
        }
    }
}

module.exports = RPGPlayerHealth;