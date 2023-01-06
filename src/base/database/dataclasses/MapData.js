const TableData = require("../../TableData");

class MapData extends TableData {
    constructor(client, mapData, lang) {
        super(client, mapData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        this.data.region = this.client.RPGAssetsManager.getMapRegion(this.lang, this.data.regionId);
        this.data.area = this.data.region.getArea(this.data.areaId);
        delete this.data.regionId;
        delete this.data.areaId;
        const excavated = {};
        for (const regionId in this.data.exploration.excavated) {
            const region = this.client.RPGAssetsManager.getMapRegion(this.lang, regionId);
            excavated[regionId] = {};
            for (const areaId of this.data.exploration.excavated[regionId]) {
                excavated[regionId][areaId] = region.getArea(areaId);
            }
        }
        this.data.excavated = excavated;
    }
}

module.exports = MapData;