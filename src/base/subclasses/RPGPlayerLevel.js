class RPGPlayerLevel {
    constructor(exp) {
        this.data = {
            level: 0,
            exp,
            reached: exp,
            required: 100,
        };

        while (this.data.reached >= ((this.data.level + 2) * 50)) {
            this.data.reached -= ((this.data.level + 2) * 50);
            this.data.level++;
        }

        this.data.required = ((this.data.level + 2) * 50);
    }
}

module.exports = RPGPlayerLevel;