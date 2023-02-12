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
        );
    }

    async run() {
        await this.interaction.deferReply().catch(this.client.catchError);
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            return await this.return(
                this.client.playerDb.get(user.id).alreadyPlayed ?
                    this.lang.systems.playerNotFoundAlreadyPlayed
                    : this.lang.systems.playerNotFound,
                true,
            );
        }

        const lang = this.client.playerDb.getLang(user.id);
        const map = await this.client.mapDb.load(user.id);
        const activity = await this.client.activityDb.load(user.id);

        if (activity.travel !== null) {
            const destination = `${activity.travel.destination.district.name}, ${activity.travel.destination.sector.name}`;
            return await this.return(this.trad.currentlyTraveling
                        .replace("%LOCATION_NAME", destination)
                    + this.trad.endsIn
                    + `<t:${this.client.util.round(activity.travel.endedDate / 1000)}:R>.`,
            );
        }

        let mode = await this.menu(
            {
                content: this.trad.chooseMode,
            },
            [
                {
                    label: this.trad.shortTravel,
                    description: this.trad.shortTravelDescription.replace("%DISTRICT_NAME", map.district.name),
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
                .filter(e => e.id !== map.district.id) || [];
            const districtChoice = await this.menu(
                {
                    content: `[${this.trad.longTravel}] ${this.trad.chooseDistrict}`,
                },
                availableDistricts.map(e => (
                    {
                        label: e.name,
                        value: e.id,
                        description: this.trad.availableSectors.replace("%SECTORS", e.sectors.length),
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
                        : this.trad.chooseDistrictSector.replace("%DISTRICT_NAME", map.district.name)
                }`,
            },
            availableSectors.map(e => (
                {
                    label: e.name,
                    value: e.id,
                    description: e.biome.name,
                }
            )),
        );
        if (sectorChoice === null) return this.end();
        sector = district.getSector(`${sectorChoice[0]}`);

        const distance = this.client.activityDb.distance(map.district, district, map.sector, sector);
        const startedDate = Date.now();
        const time = distance * 5 * 60 * 1000;

        const wantsToTravel = await this.choice(
            {
                content: this.trad.wantsToTravel.replace("%LOCATION_NAME", `${district.name}, ${sector.name}`)
                    + this.trad.endsInProbably
                        .replace("%DATE", `<t:${this.client.util.round((startedDate + time) / 1000)}:R>`),
            },
            this.trad.travel,
            this.trad.cancel,
        );
        if (wantsToTravel === null) return this.end();

        if (wantsToTravel === "primary") {
            this.client.activityDb.travel(user.id, startedDate, map.district.id, map.sector.id, district.id, sector.id);
            return await this.return(
                this.trad.startedTraveling.replace("%LOCATION_NAME", `${district.name}, ${sector.name}`),
            );
        }
        else if (wantsToTravel === "secondary") {
            return await this.return(this.trad.canceledTraveling);
        }
        return this.end();
    }
}

module.exports = Travel;