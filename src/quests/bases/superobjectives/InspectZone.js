const map = require("../../../elements/map.js");

class InspectZone {
    constructor(target, targetId, item, itemName, itemCategory, quantity, region, area) {
        this.type = "inspect_zone";
        this.target = target;
        this.targetId = targetId;
        this.region = region;
        this.area = area;
        this.item = item;
        this.itemCategory = itemCategory;
        this.quantity = quantity;
        this.itemName = itemName;
        this.loc = map.Regions.filter(r => r.id === this.region)?.at(0);
        this.getLoc = `${this.loc.name}, ${this.loc.Areas.filter(a => a.id === this.area)?.at(0).name}`;
        this.display = function() {
            return `Inspecter la zone **${this.getLoc}**`;
        };
    }
}

module.exports = InspectZone;