const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionAreaBiome = require("./RPGMapRegionAreaBiome");

class RPGMapRegionArea extends RPGAssetBase {
    constructor(mapRegion, mapRegionAreaData, name) {
        super(mapRegion.lang, mapRegionAreaData.id);

        this.name = name;
        this.x = mapRegionAreaData.x;
        this.y = mapRegionAreaData.y;
        this.paths = mapRegionAreaData.paths;
        this.biome = new RPGMapRegionAreaBiome(this, mapRegionAreaData.biome, this.lang.json.biomes[mapRegionAreaData.biome]);
    }

    getDistanceTo(area) {
        return Math.sqrt(Math.pow(this.coordinates.x - area.coordinates.x, 2) + Math.pow(this.coordinates.y - area.coordinates.y, 2));
    }
}

module.exports = RPGMapRegionArea;