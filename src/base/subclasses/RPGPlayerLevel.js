class RPGPlayerLevel {
    constructor(exp) {
        this.datas = {
            level: 0,
            exp: exp,
            reached: exp,
            required: 1000,
            toReach: 1000,
        };

        while (this.datas.reached >= ((this.datas.level + 2) * 1000)) {
            this.datas.reached -= ((this.datas.level + 2) * 1000);
            this.datas.level++;
        }

        this.datas.required = ((this.datas.level + 2) * 1000);
        this.datas.toReach = this.datas.required - this.datas.reached;

        return this.datas;
    }
}

module.exports = RPGPlayerLevel;