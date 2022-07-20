class CollectKYens {
    constructor(quantity) {
        this.type = "collect_k_yens";
        this.quantity = quantity;
        this.got = 0;
        this.display = function() {
            return `Collectez des yens: **\`${this.got}\`**\`/${this.quantity}\``;
        };
    }
}

module.exports = CollectKYens;