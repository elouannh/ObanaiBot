class FeedCrow {
    constructor(quantity) {
        this.type = "feed_crow";
        this.quantity = quantity;
        this.fed = 0;
        this.display = function() {
            return `Nourrir votre corbeau: **\`${this.fed}\`**\`/${this.quantity}\``;
        };
    }
}

module.exports = FeedCrow;