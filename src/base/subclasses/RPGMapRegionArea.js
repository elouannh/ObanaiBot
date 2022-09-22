const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionAreaBiome = require("./RPGMapRegionAreaBiome");

class RPGMapRegionArea extends RPGAssetBase {
    constructor(mapRegion, mapRegionAreaData, name) {
        super(mapRegion.lang, mapRegionAreaData.id);

        this.name = name;
        this.biome = new RPGMapRegionAreaBiome(this, mapRegionAreaData.biome, this.lang.json.biomes[mapRegionAreaData.biome]);
    }

    getDistanceTo(area) {
        return Math.abs(Number(area.id) - Number(this.id)) * 25;
    }
}

module.exports = RPGMapRegionArea;