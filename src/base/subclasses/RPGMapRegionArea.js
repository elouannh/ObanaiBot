const RPGAssetBase = require("./RPGAssetBase");
const RPGMapDistrictSectorBiome = require("./RPGMapDistrictSectorBiome");

class RPGMapDistrictSector extends RPGAssetBase {
    constructor(mapDistrict, mapDistrictSectorData, name) {
        super(mapDistrict.lang, mapDistrictSectorData.id);

        this.name = name;
        this.x = mapDistrictSectorData.x;
        this.y = mapDistrictSectorData.y;
        this.z = mapDistrictSectorData.z;
        this.paths = mapDistrictSectorData.paths;
        this.biome = new RPGMapDistrictSectorBiome(this, mapDistrictSectorData.biome, this.lang.json.biomes[mapDistrictSectorData.biome]);
    }
}

module.exports = RPGMapDistrictSector;