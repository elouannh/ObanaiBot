class VoyageTo {
    constructor(region, area) {
        this.type = "voyage_to";
        this.region = region;
        this.area = area;
        this.destinationName = `${
            map.Regions.filter(r => r.id === this.region)?.at(0).name
        }, ${
            map.Regions.filter(r => r.id === this.region)?.at(0).Areas.filter(a => a.id === this.area)?.at(0).name
        }`;
        this.display = function() {
            return `Voyagez jusqu'à la destination: **${this.destinationName}**`;
        };
    }
}

module.exports = VoyageTo;