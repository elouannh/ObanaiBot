const TableDatas = require("../../TableDatas");

class MapDatas extends TableDatas {
    constructor(client, mapDatas, lang) {
        super(client, mapDatas);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        this.datas.region = this.client.RPGAssetsManager.getMapRegion(this.lang, this.datas.regionId);
        this.datas.area = this.datas.region.getArea(this.datas.areaId);
        delete this.datas.regionId;
        delete this.datas.areaId;
        const exploration = {};
        for (const regionId in this.datas.exploration) {
            const region = {
                id: regionId,
                region: this.client.RPGAssetsManager.getMapRegion(regionId),
                areas: {},
            };
            for (const areaId in this.datas.exploration[regionId]) {
                region.areas[areaId] = {
                    id: areaId,
                    area: region.region.getArea(areaId),
                    alreadyExcavated: this.datas.exploration[regionId][areaId].alreadyExcavated,
                };
            }
            exploration[regionId] = region;
        }
        this.datas.exploration = exploration;
    }
}

module.exports = MapDatas;