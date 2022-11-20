class RPGPlayerHealth {
    constructor(amount, lastHealing) {
        this.amount = amount;
        this.lastRegen = lastHealing;

        this.fullRegen = lastHealing;
        this.fullRegenString = (lastHealing / 1000).toFixed(0);
        if (this.amount < 100) {
            this.fullRegen += Date.now() + (100 - this.amount) * 60 * 5 * 1000;
            this.fullRegenString = (this.fullRegen / 1000).toFixed(0);
        }
    }
}

module.exports = RPGPlayerHealth;