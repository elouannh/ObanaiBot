class CollectKItems {
    constructor(quantity, item, itemName, itemCategory) {
        this.type = "collect_k_items";
        this.item = item;
        this.itemCategory = itemCategory;
        this.itemName = itemName;
        this.quantity = quantity;
        this.got = 0;
        this.display = function() {
            return `Collecter ${this.itemName}: **${this.got}**/${this.quantity}`;
        };
    }
}

module.exports = CollectKItems;