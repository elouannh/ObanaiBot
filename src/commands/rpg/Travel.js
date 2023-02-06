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
        const user = this.interaction.user;
        if (!(await this.client.playerDb.exists(user.id))) {
            return await this.return(
                this.client.playerDb.get(user.id).alreadyPlayed ?
                    this.lang.systems.playerNotFoundAlreadyPlayed
                    : this.lang.systems.playerNotFound,
                true,
            );
        }
        await this.interaction.deferReply().catch(this.client.catchError);

        const lang = this.client.playerDb.getLang(user.id);
        const map = await this.client.mapDb.load(user.id);
        const activity = await this.client.activityDb.load(user.id);

        if (activity.travel !== null) {
            const destination = `${activity.travel.destination.region.name}, ${activity.travel.destination.area.name}`;
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
                    description: this.trad.shortTravelDescription.replace("%REGION_NAME", map.region.name),
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
        let [region, area] = [map.region, map.area];

        if (mode === "long") {
            const availableRegions = Object.values(this.client.RPGAssetsManager.map.regions)
                .map(e => this.client.RPGAssetsManager.getMapRegion(lang, e.id))
                .filter(e => e.id !== map.region.id) || [];
            const regionChoice = await this.menu(
                {
                    content: `[${this.trad.longTravel}] ${this.trad.chooseRegion}`,
                },
                availableRegions.map(e => (
                    {
                        label: e.name,
                        value: e.id,
                        description: this.trad.availableAreas.replace("%AREAS", e.areas.length),
                    }
                )),
            );
            if (regionChoice === null) return this.end();
            region = this.client.RPGAssetsManager.getMapRegion(lang, `${regionChoice[0]}`);
        }
        const availableAreas = mode === "short" ?
            (map.region.areas.filter(e => e.id !== map.area.id) || [])
            : region.areas;
        const areaChoice = await this.menu(
            {
                content: `[${mode === "short" ? this.trad.shortTravel : this.trad.longTravel}] `
                    + `${mode === "short" ? 
                        this.trad.chooseArea
                        : this.trad.chooseRegionArea.replace("%REGION_NAME", map.region.name)
                }`,
            },
            availableAreas.map(e => (
                {
                    label: e.name,
                    value: e.id,
                    description: e.biome.name,
                }
            )),
        );
        if (areaChoice === null) return this.end();
        area = region.getArea(`${areaChoice[0]}`);

        const distance = this.client.activityDb.distance(map.region, region, map.area, area);
        const startedDate = Date.now();
        const time = distance * 5 * 60 * 1000;

        const wantsToTravel = await this.choice(
            {
                content: this.trad.wantsToTravel.replace("%LOCATION_NAME", `${region.name}, ${area.name}`)
                    + this.trad.endsInProbably
                        .replace("%DATE", `<t:${this.client.util.round((startedDate + time) / 1000)}:R>`),
            },
            this.trad.travel,
            this.trad.cancel,
        );
        if (wantsToTravel === null) return this.end();

        if (wantsToTravel === "primary") {

        }

        return this.end();
    }
}

module.exports = Travel;