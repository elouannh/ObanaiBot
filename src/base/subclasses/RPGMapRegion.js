const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionArea = require("./RPGMapRegionArea");

class RPGMapRegion extends RPGAssetBase {
    constructor(lang, id, mapRegionData) {
        super(lang, id);

        this.mapRegionData = mapRegionData;
        const areasLang = this.lang.json.regions[this.id].areas;

        this.name = this.lang.json.regions[this.id].name;

        this.x = this.mapRegionData.x;
        this.y = this.mapRegionData.y;
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
}

module.exports = RPGMapRegion;