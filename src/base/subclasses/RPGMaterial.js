const RPGAssetBase = require("./RPGAssetBase");
const RPGMapRegionAreaBiome = require("./RPGMapRegionAreaBiome");

class RPGMaterial extends RPGAssetBase {
    constructor(assetsManager, lang, id, materialDatas) {
        super(lang, id);

        this.assetsManager = assetsManager;

        const datas = materialDatas;
        this.size = datas.size;
        this.biomes = datas.biomes.map(e => new RPGMapRegionAreaBiome(this, e, this.lang.biomes.json[e]));
        this.name = this.lang.materials.json[this.id];
        this.rarity = datas.rarity;
    }

    get getAreas() {
        const areas = [];
        for (const biome of this.biomes) {
            for (let region of this.assetsManager.map.regions) {
                region = this.assetsManager.getMapRegion(this.lang._id, region.id);
                const validAreas = region.areas.filter(e => e.biome.id === biome.id);

                if (validAreas.length > 0) {
                    areas.push({ region: region, areas: validAreas });
                }
            }
        }

        return areas;
    }
}

module.exports = RPGMaterial;