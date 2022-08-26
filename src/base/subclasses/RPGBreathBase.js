const RPGMovementBase = require("./RPGMovementBase");

class RPGBreathBase {
    constructor() {
        this.id = "null";
        this.emoji = "🔴";
        this.movements = [new RPGMovementBase(this)];
    }
}

module.exports = RPGBreathBase;