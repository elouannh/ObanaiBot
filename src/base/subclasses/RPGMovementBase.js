class RPGMovementBase {
    constructor(breath) {
        this.breath = breath;
        this.id = this.breath.movements.length;
    }
}

module.exports = RPGMovementBase;