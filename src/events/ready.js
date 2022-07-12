module.exports = {
	name: "ready",
	once: true,
	async run(client) {
		console.log(`Bot connecté en tant que ${client.user.tag} !`);

		let i = 0;
        const status = [
			["WATCHING", `${client.playerDb.db.array().map(e => e.started)} joueurs`],
			["WATCHING", `${client.guilds.cache.size} serveurs`],
			["COMPETING", `version ${client.version}`],
        ];
		setInterval(() => {
			client.user.setPresence({
				status: "online",
				afk: false,
				activities: [
					{
						name: status[i][1],
						type: status[i][0],
					},
				],
			});
			i++;
			if (i === status.length) i = 0;
		}, 15000);
	},
};