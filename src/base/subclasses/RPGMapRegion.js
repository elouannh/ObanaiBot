const RPGAssetBase = require("./RPGAssetBase");
const RPGMapDistrictSector = require("./RPGMapDistrictSector");

class RPGMapDistrict extends RPGAssetBase {
    constructor(lang, id, mapDistrictData) {
        super(lang, id);

        const sectorsLang = this.lang.json.districts[this.id].sectors;

        this.name = this.lang.json.districts[this.id].name;

        this.x = mapDistrictData.x;
        this.y = mapDistrictData.y;
        this.z = mapDistrictData.z;
        this.paths = mapDistrictData.paths;

        this.sectors = Object.values(mapDistrictData.sectors).map(e => new RPGMapDistrictSector(this, e, sectorsLang[e.id]));
        this.referenceSector = this.getReferenceSector(mapDistrictData);
    }

    getReferenceSector(mapDistrictData) {
        return this.sectors[mapDistrictData.referenceSector];
    }

    getSector(id) {
        return this.sectors[id];
    }
}

module.exports = RPGMapDistrict;