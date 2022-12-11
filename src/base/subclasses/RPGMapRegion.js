const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionArea = require("./RPGMapRegionArea");

class RPGMapRegion extends RPGAssetBase {
    constructor(lang, id, mapRegionData) {
        super(lang, id);

        this.mapRegionData = mapRegionData;
        const areasLang = this.lang.json.regions[this.id].areas;

        this.name = this.lang.json.regions[this.id].name;

        this.coordinates = { x: this.mapRegionData.x, y: this.mapRegionData.y };
        this.paths = this.mapRegionData.paths;

        this.areas = Object.values(this.mapRegionData.areas).map(e => new RPGMapRegionArea(this, e, areasLang[e.id]));
        this.arrivalArea = this.getArrivalArea;
    }

    get getArrivalArea() {
        return this.areas[this.mapRegionData.arrivalArea];
    }

    getArea(id) {
        return this.areas[id];
    }

    getDistanceTo(region) {
        return Math.sqrt(Math.pow(this.coordinates.x - region.coordinates.x, 2) + Math.pow(this.coordinates.y - region.coordinates.y, 2));
    }
}

module.exports = RPGMapRegion;