class RPGPlayerLevel {
    constructor(exp) {
        this.data = {
            level: 0,
            exp: exp,
            reached: exp,
            required: 1000,
            toReach: 1000,
        };

        while (this.data.reached >= ((this.data.level + 2) * 50)) {
            this.data.reached -= ((this.data.level + 2) * 50);
            this.data.level++;
        }

        this.data.required = ((this.data.level + 2) * 50);
        this.data.toReach = this.data.required - this.data.reached;

        return this.data;
    }
}

module.exports = RPGPlayerLevel;