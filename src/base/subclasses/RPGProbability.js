class RPGProbability {
    constructor(list, labels) {
        this.list = list;
        this.labels = labels;
    }

    sum() {
        return this.list.reduce((a, b) => a + b, 0);
    }

    singlePull() {
        const prob = Math.random();
        for (let i = 0; i < this.list.length; i++) {
            if (prob > this.list[i]) return [i, this.labels[i], this.list[i]];
        }
        return [this.list.length - 1, this.labels[this.labels.length - 1], this.list[this.list.length - 1]];
    }

    singleRepeatPull(amount) {
        const results = {};
        for (let i = 0; i < amount; i++) {
            const result = this.singlePull();
            if (!results[result[1]]) results[result[1]] = 0;
            results[result[1]]++;
        }
        const sortedResults = {};
        Object.entries(results).sort((a, b) => b[1] - a[1]).forEach(key => {
            sortedResults[key[0]] = key[1];
        });
        return sortedResults;
    }
}

module.exports = RPGProbability;