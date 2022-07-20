class TrainStat {
    constructor(stat, statName) {
        this.type = "train_stat";
        this.stat = stat;
        this.statName = statName;
        this.display = function() {
            return `Entrainez votre **${this.statName}**`;
        };
    }
}

module.exports = TrainStat;