class Talk {
    constructor(target, targetId, text, region, area) {
        this.type = "talk";
        this.target = target;
        this.targetId = targetId;
        this.region = region;
        this.area = area;
        this.text = text;
        this.loc = map.Regions.filter(r => r.id === this.region)?.at(0);
        this.getLoc = `${this.loc.name}, ${this.loc.Areas.filter(a => a.id === this.area)?.at(0).name}`;
        this.display = function() {
            return `Parler à **${this.target}** (${this.getLoc})`;
        };
    }
}

module.exports = Talk;