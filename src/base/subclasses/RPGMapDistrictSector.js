const RPGAssetBase = require("./RPGAssetBase");
const RPGMapDistrictSectorBiome = require("./RPGMapDistrictSectorBiome");

class RPGMapDistrictSector extends RPGAssetBase {
    constructor(mapDistrict, mapDistrictSectorData, name) {
        super(mapDistrict.lang, mapDistrictSectorData.id);

        this.name = name;
        this.emoji = mapDistrictSectorData.emoji;
        this.fullName = `${this.name} ${this.emoji}`;
        this.x = mapDistrictSectorData.x;
        this.y = mapDistrictSectorData.y;
        this.z = mapDistrictSectorData.z;
        this.biome = new RPGMapDistrictSectorBiome(this, mapDistrictSectorData.biome, this.lang.json.biomes[mapDistrictSectorData.biome]);
    }
}

module.exports = RPGMapDistrictSector;