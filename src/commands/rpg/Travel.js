const Command = require("../../base/Command");

class Travel extends Command {
    constructor() {
        super(
            {
                name: "travel",
                description: "Permet de voyager sur la carte.",
                descriptionLocalizations: {
                    "en-US": "Allows you to travel on the map.",
                },
                options: [],
                dmPermission: true,
            },
            {
                name: "Travel",
                dmPermission: true,
            },
            {
                trad: "travel",
                type: [1],
                category: "RPG",
                cooldown: 10,
                completedRequests: ["adventureLocal"],
                authorizationBitField: 0b000,
                permissions: 0n,
                targets: ["read", "write"],
            },
            {
                needToBeStatic: true,
                needToBeInRpg: true,
            },
        );
    }

    async run() {
        const exists = await this.hasAdventure();
        if (!exists) return;

        const lang = this.client.playerDb.getLang(this.user.id);
        const map = await this.client.mapDb.load(this.user.id);
        const activity = await this.client.activityDb.load(this.user.id);

        if (activity.travel !== null) {
            const destination = `${activity.travel.destination.district.region.name}\n`
                + `${activity.travel.destination.district.fullName}, ${activity.travel.destination.sector.fullName}`;

            return await this.return(
                this.trad.currentlyTraveling
                    .replace("%LOCATION_NAME", destination)
                + this.trad.endsIn
                    .replace("%DATE", `<t:${this.client.util.round(activity.travel.endedDate / 1000)}:R>.`),
            );
        }

        let mode = await this.menu(
            {
                content: this.trad.chooseMode,
            },
            [
                {
                    label: this.trad.shortTravel,
                    description: this.trad.shortTravelDescription.replace("%DISTRICT_NAME", `${map.district.fullName}`),
                    value: "short",
                },
                {
                    label: this.trad.longTravel,
                    description: this.trad.longTravelDescription,
                    value: "long",
                },
            ],
        );
        if (mode === null) return this.end();
        mode = mode[0];
        let [district, sector] = [map.district, map.sector];

        if (mode === "long") {
            const availableDistricts = Object.values(this.client.RPGAssetsManager.map.districts)
                .map(e => this.client.RPGAssetsManager.getMapDistrict(lang, e.id))
                .filter(e => e.id !== map.district.id)
                .filter(e => Math.abs(Number(e.region.id) - Number(map.district.region.id)) <= 1) || [];

            const districtChoice = await this.menu(
                {
                    content: `[${this.trad.longTravel}] ${this.trad.chooseDistrict}`,
                },
                availableDistricts.map(e => (
                    {
                        label: e.name,
                        value: e.id,
                        description: e.region.name,
                        emoji: e.emoji,
                    }
                )),
            );
            if (districtChoice === null) return this.end();
            district = this.client.RPGAssetsManager.getMapDistrict(lang, `${districtChoice[0]}`);
        }
        const availableSectors = mode === "short" ?
            (map.district.sectors.filter(e => e.id !== map.sector.id) || [])
            : district.sectors;
        const sectorChoice = await this.menu(
            {
                content: `[${mode === "short" ? this.trad.shortTravel : this.trad.longTravel}] `
                    + `${mode === "short" ? 
                        this.trad.chooseSector
                        : this.trad.chooseDistrictSector.replace("%DISTRICT_NAME", district.fullName)
                }`,
            },
            availableSectors.map(e => (
                {
                    label: e.name,
                    value: e.id,
                    description: e.biome.name,
                    emoji: e.emoji,
                }
            )),
        );
        if (sectorChoice === null) return this.end();
        sector = district.getSector(`${sectorChoice[0]}`);

        const distance = this.client.activityDb.distance(map.district, district, map.sector, sector);
        const startedDate = Date.now();
        const time = this.client.activityDb.distanceToTime(distance);

        const wantsToTravel = await this.choice(
            {
                content: this.trad.wantsToTravel.replace("%LOCATION_NAME", `${district.fullName}, ${sector.fullName}`)
                    + this.trad.endsIn.replace("%DATE", this.client.util.toTimestamp(startedDate + time)),
            },
            this.trad.travel,
            this.trad.cancel,
        );
        if (wantsToTravel === null) return this.end();

        if (wantsToTravel === "primary") {
            await this.client.activityDb.travel(this.user.id, startedDate, map.district.id, map.sector.id, district.id, sector.id);
            return await this.return(
                this.trad.startedTraveling.replace("%LOCATION_NAME", `${district.fullName}, ${sector.fullName}`),
            );
        }
        else if (wantsToTravel === "secondary") {
            return await this.return(this.trad.canceledTraveling);
        }
        return this.end();
    }
}

module.exports = Travel;