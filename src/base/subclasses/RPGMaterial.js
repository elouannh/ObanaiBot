const RPGAssetBase = require("./RPGAssetBase");
const RPGMapDistrictSectorBiome = require("./RPGMapDistrictSectorBiome");

class RPGMaterial extends RPGAssetBase {
    constructor(assetsManager, lang, id, materialData) {
        super(lang, id);

        this.assetsManager = assetsManager;

        const data = materialData;
        this.size = data.size;
        this.biomes = data.biomes.map(e => new RPGMapDistrictSectorBiome(this, e, this.lang.biomes.json[e]));
        this.name = this.lang.materials.json[this.id];
    }

    get getSectors() {
        const sectors = [];
        for (const biome of this.biomes) {
            for (let district of this.assetsManager.map.districts) {
                district = this.assetsManager.getMapDistrict(this.lang.id, district.id);
                const validSectors = district.sectors.filter(e => e.biome.id === biome.id);

                if (validSectors.length > 0) {
                    sectors.push({ district: district, sectors: validSectors });
                }
            }
        }

        return sectors;
    }
}

module.exports = RPGMaterial;