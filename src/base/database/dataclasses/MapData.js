const TableData = require("../../TableData");

class MapData extends TableData {
    constructor(client, mapData, lang) {
        super(client, mapData);

        this.lang = lang;

        this.load();
        this.overwrite();
    }

    load() {
        this.data.district = this.client.RPGAssetsManager.getMapDistrict(this.lang, this.data.districtId);
        this.data.sector = this.data.district.getSector(this.data.sectorId);
        delete this.data.districtId;
        delete this.data.sectorId;
        const excavated = {};
        for (const districtId in this.data.exploration.excavated) {
            const district = this.client.RPGAssetsManager.getMapDistrict(this.lang, districtId);
            excavated[districtId] = {};
            for (const [sectorId, sectorDate] of this.data.exploration.excavated[districtId]) {
                excavated[districtId][sectorId] = [district.getSector(sectorId), sectorDate];
            }
        }
        this.data.excavated = excavated;
    }
}

module.exports = MapData;