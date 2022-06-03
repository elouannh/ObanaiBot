class VoyageTo {
    constructor(region, area, destinationName) {
        this.type = "voyage_to";
        this.region = region;
        this.area = area;
        this.destinationName = destinationName;
        this.display = function() {
            return `Voyager jusqu'à la destination: **${this.destinationName}**`;
        };
    }
}

module.exports = VoyageTo;