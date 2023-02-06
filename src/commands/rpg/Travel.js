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
    }
}

module.exports = Travel;