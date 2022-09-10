const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionArea = require("./RPGMapRegionArea");

class RPGMapRegion extends RPGAssetBase {
    constructor(lang, id, mapRegionDatas) {
        super(lang, id);

        this.mapRegionDatas = mapRegionDatas;
        const areasLang = this.lang.json.regions[this.id].areas;

        this.coordinates = { x: this.mapRegionDatas.x, y: this.mapRegionDatas.y };
        this.paths = this.mapRegionDatas.paths;

        this.areas = this.mapRegionDatas.areas.map(e => new RPGMapRegionArea(this, e, areasLang[e.id]));
        this.arrivalArea = this.getArrivalArea;
    }

    get getArrivalArea() {
        return this.areas.filter(e => e.id === this.mapRegionDatas.arrivalArea)?.at(0);
    }

    getArea(id) {
        return this.areas.filter(e => e.id === id)[0];
    }

    getDistanceTo(region) {
        return Math.sqrt(Math.pow(this.coordinates.x - region.coordinates.x, 2) + Math.pow(this.coordinates.y - region.coordinates.y, 2));
    }
}

module.exports = RPGMapRegion;