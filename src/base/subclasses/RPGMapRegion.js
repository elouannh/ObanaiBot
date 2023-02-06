const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionArea = require("./RPGMapRegionArea");

class RPGMapRegion extends RPGAssetBase {
    constructor(lang, id, mapRegionData) {
        super(lang, id);

        const areasLang = this.lang.json.regions[this.id].areas;

        this.name = this.lang.json.regions[this.id].name;

        this.x = mapRegionData.x;
        this.y = mapRegionData.y;
        this.z = mapRegionData.z;
        this.paths = mapRegionData.paths;

        this.areas = Object.values(mapRegionData.areas).map(e => new RPGMapRegionArea(this, e, areasLang[e.id]));
        this.arrivalArea = this.getArrivalArea(mapRegionData);
    }

    getArrivalArea(mapRegionData) {
        return this.areas[mapRegionData.arrivalArea];
    }

    getArea(id) {
        return this.areas[id];
    }
}

module.exports = RPGMapRegion;