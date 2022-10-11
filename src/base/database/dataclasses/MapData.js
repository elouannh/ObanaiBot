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
        const exploration = {};
        for (const regionId in this.data.exploration) {
            const region = {
                id: regionId,
                region: this.client.RPGAssetsManager.getMapRegion(regionId),
                areas: {},
            };
            for (const areaId in this.data.exploration[regionId]) {
                region.areas[areaId] = {
                    id: areaId,
                    area: region.region.getArea(areaId),
                    alreadyExcavated: this.data.exploration[regionId][areaId].alreadyExcavated,
                };
            }
            exploration[regionId] = region;
        }
        this.data.exploration = exploration;
    }
}

module.exports = MapData;