const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionAreaBiome = require("./RPGMapRegionAreaBiome");

class RPGMapRegionArea extends RPGAssetBase {
    constructor(mapRegion, mapRegionAreaData, name) {
        super(mapRegion.lang, mapRegionAreaData.id);

        this.name = name;
        this.x = mapRegionAreaData.x;
        this.y = mapRegionAreaData.y;
        this.z = mapRegionAreaData.z;
        this.paths = mapRegionAreaData.paths;
        this.biome = new RPGMapRegionAreaBiome(this, mapRegionAreaData.biome, this.lang.json.biomes[mapRegionAreaData.biome]);
    }
}

module.exports = RPGMapRegionArea;