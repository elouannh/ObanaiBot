const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionAreaBiome = require("./RPGMapRegionAreaBiome");

class RPGMapRegionArea extends RPGAssetBase {
    constructor(mapRegion, mapRegionAreaDatas, name) {
        super(mapRegion.lang, mapRegionAreaDatas.id);

        this.name = name;
        this.biome = new RPGMapRegionAreaBiome(this, mapRegionAreaDatas.biome, this.lang.json.biomes[mapRegionAreaDatas.biome]);
    }
}

module.exports = RPGMapRegionArea;